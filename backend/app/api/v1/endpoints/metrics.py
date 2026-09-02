import asyncio
from typing import List, Optional
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.core.security import verify_agent_token
from app.core.rate_limit import metric_ingest_rate_limiter
from app.core.websocket import ws_manager
from app.models.host import Host
from app.models.metric import Metric
from app.models.power import PowerConfig
from app.models.pdu import PDU
from app.schemas.metric import MetricIngest, MetricResponse
from app.services.power_service import calculate_node_power_watts

router = APIRouter()


def is_test_hostname(hostname: str) -> bool:
    """Detects test / benchmark hostnames to prevent inventory pollution."""
    clean = hostname.lower().strip()
    return clean.startswith(('test-', 'mock-', 'security-test', 'offline-flush', 'timestamp-audit', 'audit-'))


def resolve_since_timestamp(
    range_str: Optional[str],
    hours_int: Optional[int],
    from_time: Optional[datetime],
) -> Optional[datetime]:
    """Resolves filter start timestamp based on range shortcuts, hours, or explicit ISO time."""
    if from_time:
        return from_time
    now = datetime.now(timezone.utc)
    if hours_int:
        return now - timedelta(hours=hours_int)
    if range_str:
        clean = range_str.lower().strip()
        if clean == "1h":
            return now - timedelta(hours=1)
        elif clean == "6h":
            return now - timedelta(hours=6)
        elif clean == "24h":
            return now - timedelta(hours=24)
        elif clean == "7d":
            return now - timedelta(days=7)
    return now - timedelta(hours=1)


@router.post("", response_model=MetricResponse, status_code=status.HTTP_201_CREATED)
def ingest_metric(
    metric_in: MetricIngest,
    db: Session = Depends(get_db),
    _: str = Depends(verify_agent_token),
    __: None = Depends(metric_ingest_rate_limiter),
):
    """
    Ingest real-time host telemetry snapshot from Python agent.
    
    Security:
        Requires valid `X-Agent-Token` HTTP header matching backend configuration.
        Unauthorized requests receive 401 Unauthorized.
        Protected by Sliding Window Rate Limiting (240 req/min).
    """
    clean_hostname = metric_in.hostname.strip()
    host_id = clean_hostname.lower()
    server_now = datetime.now(timezone.utc)
    sample_time = metric_in.timestamp or server_now
    is_test = is_test_hostname(clean_hostname)

    # 1. Upsert Host Inventory by Hostname
    host = db.query(Host).filter((Host.id == host_id) | (Host.hostname == clean_hostname)).first()
    
    if not host:
        host = Host(
            id=host_id,
            hostname=clean_hostname,
            ip_address=metric_in.ip_address,
            os_type=metric_in.os_type.lower(),
            os_version=metric_in.os_version,
            cpu_count=metric_in.cpu_count or 1,
            total_ram_bytes=metric_in.total_ram_bytes or 0,
            total_disk_bytes=metric_in.total_disk_bytes or 0,
            agent_version=metric_in.agent_version or "1.0.0",
            status="online",
            is_test=is_test,
            last_seen=server_now,
        )
        db.add(host)
        db.flush()
    else:
        host.hostname = clean_hostname
        host.ip_address = metric_in.ip_address or host.ip_address
        host.os_version = metric_in.os_version or host.os_version
        host.cpu_count = metric_in.cpu_count or host.cpu_count
        host.total_ram_bytes = metric_in.total_ram_bytes or host.total_ram_bytes
        host.total_disk_bytes = metric_in.total_disk_bytes or host.total_disk_bytes
        host.agent_version = metric_in.agent_version or host.agent_version
        host.status = "online"
        host.is_test = is_test
        host.last_seen = server_now
        db.add(host)

    # 2. Retrieve or Provision Default Power Configuration and PDU Association
    power_cfg = db.query(PowerConfig).filter(PowerConfig.host_id == host.id).first()
    if not power_cfg:
        default_pdu = db.query(PDU).filter(PDU.feed == "A").first()
        idle_w, rated_w = (120.0, 500.0) if "win" in metric_in.os_type.lower() else (80.0, 350.0)
            
        power_cfg = PowerConfig(
            host_id=host.id,
            idle_watts=idle_w,
            rated_watts=rated_w,
            pdu_id=default_pdu.id if default_pdu else None,
            pdu_outlet="Outlet-01",
            rack_name="Rack-01",
            rack_unit_start=1,
            rack_unit_height=1,
        )
        db.add(power_cfg)
        db.flush()

    # 3. Dynamic Power Calculation
    computed_power = calculate_node_power_watts(
        idle_watts=power_cfg.idle_watts,
        rated_watts=power_cfg.rated_watts,
        cpu_percent=metric_in.cpu_percent,
    )

    # 4. Save Time-Series Metric Record
    metric_entry = Metric(
        host_id=host.id,
        timestamp=sample_time,
        received_at=server_now,
        cpu_percent=metric_in.cpu_percent,
        ram_percent=metric_in.ram_percent,
        ram_used_bytes=metric_in.ram_used_bytes,
        disk_percent=metric_in.disk_percent,
        disk_used_bytes=metric_in.disk_used_bytes,
        net_sent_bytes_per_sec=metric_in.net_sent_bytes_per_sec,
        net_recv_bytes_per_sec=metric_in.net_recv_bytes_per_sec,
        uptime_seconds=metric_in.uptime_seconds,
        load_1m=metric_in.load_1m,
        load_5m=metric_in.load_5m,
        load_15m=metric_in.load_15m,
        calculated_power_watts=computed_power,
        cpu_temperature_celsius=metric_in.cpu_temperature_celsius or round(36.0 + (metric_in.cpu_percent / 100.0) * 38.0, 1),
    )
    db.add(metric_entry)
    db.commit()
    db.refresh(metric_entry)

    # 5. Broadcast live telemetry update via WebSockets
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            loop.create_task(ws_manager.broadcast({
                "event": "telemetry_update",
                "host_id": host.id,
                "hostname": host.hostname,
                "cpu_percent": metric_in.cpu_percent,
                "ram_percent": metric_in.ram_percent,
                "disk_percent": metric_in.disk_percent,
                "calculated_power_watts": computed_power,
                "cpu_temperature_celsius": metric_entry.cpu_temperature_celsius,
                "timestamp": server_now.isoformat(),
            }))
    except Exception:
        pass

    return metric_entry


@router.post("/batch", status_code=status.HTTP_201_CREATED)
def ingest_metrics_batch(
    metrics_in: List[MetricIngest],
    db: Session = Depends(get_db),
    _: str = Depends(verify_agent_token),
    __: None = Depends(metric_ingest_rate_limiter),
):
    """
    Ingest a batch of historical telemetry snapshots flushed from an agent's offline SQLite buffer.
    All records are processed and committed within a single optimized transaction.
    """
    if not metrics_in:
        return {"status": "ok", "ingested_count": 0}

    server_now = datetime.now(timezone.utc)
    inserted_count = 0

    host_cache = {}
    power_cache = {}

    for metric_in in metrics_in:
        clean_hostname = metric_in.hostname.strip()
        host_id = clean_hostname.lower()
        sample_time = metric_in.timestamp or server_now
        is_test = is_test_hostname(clean_hostname)

        if host_id not in host_cache:
            host = db.query(Host).filter((Host.id == host_id) | (Host.hostname == clean_hostname)).first()
            if not host:
                host = Host(
                    id=host_id,
                    hostname=clean_hostname,
                    ip_address=metric_in.ip_address,
                    os_type=metric_in.os_type.lower(),
                    os_version=metric_in.os_version,
                    cpu_count=metric_in.cpu_count or 1,
                    total_ram_bytes=metric_in.total_ram_bytes or 0,
                    total_disk_bytes=metric_in.total_disk_bytes or 0,
                    agent_version=metric_in.agent_version or "1.0.0",
                    status="online",
                    is_test=is_test,
                    last_seen=server_now,
                )
                db.add(host)
                db.flush()
            else:
                host.status = "online"
                host.is_test = is_test
                host.last_seen = server_now
                db.add(host)
            host_cache[host_id] = host
        else:
            host = host_cache[host_id]

        if host_id not in power_cache:
            power_cfg = db.query(PowerConfig).filter(PowerConfig.host_id == host.id).first()
            if not power_cfg:
                default_pdu = db.query(PDU).filter(PDU.feed == "A").first()
                idle_w = 45.0 if "win" in metric_in.os_type.lower() else 15.0
                rated_w = 200.0 if "win" in metric_in.os_type.lower() else 65.0
                power_cfg = PowerConfig(
                    host_id=host.id,
                    idle_watts=idle_w,
                    rated_watts=rated_w,
                    pdu_id=default_pdu.id if default_pdu else None,
                )
                db.add(power_cfg)
                db.flush()
            power_cache[host_id] = power_cfg
        else:
            power_cfg = power_cache[host_id]

        computed_power = calculate_node_power_watts(
            idle_watts=power_cfg.idle_watts,
            rated_watts=power_cfg.rated_watts,
            cpu_percent=metric_in.cpu_percent,
        )

        metric_entry = Metric(
            host_id=host.id,
            timestamp=sample_time,
            received_at=server_now,
            cpu_percent=metric_in.cpu_percent,
            ram_percent=metric_in.ram_percent,
            ram_used_bytes=metric_in.ram_used_bytes,
            disk_percent=metric_in.disk_percent,
            disk_used_bytes=metric_in.disk_used_bytes,
            net_sent_bytes_per_sec=metric_in.net_sent_bytes_per_sec,
            net_recv_bytes_per_sec=metric_in.net_recv_bytes_per_sec,
            uptime_seconds=metric_in.uptime_seconds,
            load_1m=metric_in.load_1m,
            load_5m=metric_in.load_5m,
            load_15m=metric_in.load_15m,
            calculated_power_watts=computed_power,
            cpu_temperature_celsius=metric_in.cpu_temperature_celsius or round(36.0 + (metric_in.cpu_percent / 100.0) * 38.0, 1),
        )
        db.add(metric_entry)
        inserted_count += 1

    db.commit()
    return {"status": "ok", "ingested_count": inserted_count}


@router.get("", response_model=List[MetricResponse])
def query_metrics(
    host: Optional[str] = Query(None, description="Filter by hostname or host ID"),
    range: Optional[str] = Query(default="1h", description="Time range shortcut: '1h', '6h', '24h', '7d'"),
    hours: Optional[int] = Query(None, ge=1, le=720, description="Explicit hours lookup"),
    from_time: Optional[datetime] = Query(None, alias="from", description="Start timestamp (ISO 8601)"),
    to_time: Optional[datetime] = Query(None, alias="to", description="End timestamp (ISO 8601)"),
    limit: int = Query(default=500, ge=1, le=2000, description="Max records to return"),
    db: Session = Depends(get_db),
):
    """
    Query telemetry metrics supporting range shortcuts ('1h', '6h', '24h'),
    host filtering, and custom time windows. Optimized with index on (host_id, timestamp).
    """
    query = db.query(Metric)

    if host:
        clean_target = host.strip()
        matched_host = db.query(Host).filter(
            (Host.id == clean_target.lower()) | (Host.hostname == clean_target)
        ).first()
        if matched_host:
            query = query.filter(Metric.host_id == matched_host.id)
        else:
            return []

    since_time = resolve_since_timestamp(range, hours, from_time)
    if since_time:
        query = query.filter(Metric.timestamp >= since_time)
    if to_time:
        query = query.filter(Metric.timestamp <= to_time)

    metrics = query.order_by(desc(Metric.timestamp)).limit(limit).all()
    return list(reversed(metrics))


@router.get("/{host_id}", response_model=List[MetricResponse])
def get_host_metrics_by_id(
    host_id: str,
    range: Optional[str] = Query(default="1h", description="Time range shortcut: '1h', '6h', '24h'"),
    hours: Optional[int] = Query(None, ge=1, le=720),
    limit: int = Query(default=500, ge=1, le=2000),
    db: Session = Depends(get_db),
):
    """
    Retrieve historical time-series metrics for a given host with range shortcut support.
    """
    clean_target = host_id.strip()
    host = db.query(Host).filter((Host.id == clean_target.lower()) | (Host.hostname == clean_target)).first()
    if not host:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Host '{host_id}' not found in inventory.",
        )

    query = db.query(Metric).filter(Metric.host_id == host.id)
    since_time = resolve_since_timestamp(range, hours, None)
    if since_time:
        query = query.filter(Metric.timestamp >= since_time)

    metrics = query.order_by(desc(Metric.timestamp)).limit(limit).all()
    return list(reversed(metrics))
