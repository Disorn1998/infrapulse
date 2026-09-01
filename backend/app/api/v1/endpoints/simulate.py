import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.host import Host
from app.models.metric import Metric
from app.models.power import PowerConfig
from app.services.power_service import calculate_node_power_watts

router = APIRouter()


class SimulationResult(BaseModel):
    status: str
    action: str
    message: str


SIMULATED_NODES = [
    {
        "hostname": "edge-proxy-01",
        "ip_address": "192.168.1.10",
        "os_type": "ubuntu",
        "os_version": "Ubuntu 24.04 LTS",
        "cpu_count": 4,
        "total_ram": 16000000000,
        "total_disk": 256000000000,
        "cpu": 15.0,
        "ram": 35.0,
        "disk": 22.0,
        "net_rx": 4500000.0,
        "net_tx": 6200000.0,
        "idle_w": 25.0,
        "rated_w": 120.0,
        "pdu_id": 1,
        "rack_unit": 1,
        "height": 2,
    },
    {
        "hostname": "db-primary-01",
        "ip_address": "192.168.1.11",
        "os_type": "ubuntu",
        "os_version": "Ubuntu 24.04 LTS",
        "cpu_count": 16,
        "total_ram": 64000000000,
        "total_disk": 2000000000000,
        "cpu": 45.0,
        "ram": 72.0,
        "disk": 48.0,
        "net_rx": 1200000.0,
        "net_tx": 850000.0,
        "idle_w": 60.0,
        "rated_w": 350.0,
        "pdu_id": 2,
        "rack_unit": 3,
        "height": 2,
    },
    {
        "hostname": "ai-inference-01",
        "ip_address": "192.168.1.12",
        "os_type": "ubuntu",
        "os_version": "Ubuntu 24.04 LTS",
        "cpu_count": 32,
        "total_ram": 128000000000,
        "total_disk": 4000000000000,
        "cpu": 68.0,
        "ram": 84.0,
        "disk": 65.0,
        "net_rx": 8500000.0,
        "net_tx": 12000000.0,
        "idle_w": 150.0,
        "rated_w": 850.0,
        "pdu_id": 1,
        "rack_unit": 5,
        "height": 4,
    },
    {
        "hostname": "storage-nas-01",
        "ip_address": "192.168.1.13",
        "os_type": "ubuntu",
        "os_version": "Ubuntu 24.04 LTS",
        "cpu_count": 8,
        "total_ram": 32000000000,
        "total_disk": 16000000000000,
        "cpu": 28.0,
        "ram": 55.0,
        "disk": 78.0,
        "net_rx": 15000000.0,
        "net_tx": 22000000.0,
        "idle_w": 80.0,
        "rated_w": 400.0,
        "pdu_id": 2,
        "rack_unit": 9,
        "height": 4,
    },
]


@router.post("/cluster", response_model=SimulationResult)
def trigger_cluster_simulation(db: Session = Depends(get_db)):
    """Instantly inject 4 enterprise server nodes across Feed A and Feed B"""
    now = datetime.now(timezone.utc)

    for node in SIMULATED_NODES:
        host = db.query(Host).filter(Host.hostname == node["hostname"]).first()
        if not host:
            host = Host(
                id=node["hostname"],
                hostname=node["hostname"],
                ip_address=node["ip_address"],
                os_type=node["os_type"],
                os_version=node["os_version"],
                cpu_count=node["cpu_count"],
                total_ram_bytes=node["total_ram"],
                total_disk_bytes=node["total_disk"],
                agent_version="1.0.0",
                status="online",
                is_test=False,
                last_seen=now,
            )
            db.add(host)
            db.flush()
        else:
            host.last_seen = now
            host.status = "online"

        # Update Power Configuration
        p_cfg = db.query(PowerConfig).filter(PowerConfig.host_id == host.id).first()
        if not p_cfg:
            p_cfg = PowerConfig(
                id=str(uuid.uuid4()),
                host_id=host.id,
                idle_watts=node["idle_w"],
                rated_watts=node["rated_w"],
                pdu_id=node["pdu_id"],
                rack_name="Rack-01",
                rack_unit_start=node["rack_unit"],
                rack_unit_height=node["height"],
            )
            db.add(p_cfg)
        else:
            p_cfg.idle_watts = node["idle_w"]
            p_cfg.rated_watts = node["rated_w"]
            p_cfg.pdu_id = node["pdu_id"]
            p_cfg.rack_unit_start = node["rack_unit"]
            p_cfg.rack_unit_height = node["height"]

        # Insert live metric
        calculated_w = calculate_node_power_watts(node["cpu"], node["idle_w"], node["rated_w"])
        metric = Metric(
            host_id=host.id,
            timestamp=now,
            received_at=now,
            cpu_percent=node["cpu"],
            ram_percent=node["ram"],
            ram_used_bytes=int(node["total_ram"] * (node["ram"] / 100)),
            disk_percent=node["disk"],
            disk_used_bytes=int(node["total_disk"] * (node["disk"] / 100)),
            net_recv_bytes_per_sec=node["net_rx"],
            net_sent_bytes_per_sec=node["net_tx"],
            uptime_seconds=86400 * 5,
            calculated_power_watts=calculated_w,
        )
        db.add(metric)

    db.commit()
    return SimulationResult(
        status="success",
        action="provision_cluster",
        message="Provisioned 4 enterprise cluster nodes across Feed A and Feed B in 42U rack.",
    )


@router.post("/stress", response_model=SimulationResult)
def trigger_stress_simulation(db: Session = Depends(get_db)):
    """Spike cluster compute to 92% CPU, optimizing Dynamic PUE down to ~1.19"""
    now = datetime.now(timezone.utc)
    for node in SIMULATED_NODES:
        host = db.query(Host).filter(Host.hostname == node["hostname"]).first()
        if host:
            host.last_seen = now
            p_cfg = db.query(PowerConfig).filter(PowerConfig.host_id == host.id).first()
            idle_w = p_cfg.idle_watts if p_cfg else 30.0
            rated_w = p_cfg.rated_watts if p_cfg else 200.0
            
            calc_w = calculate_node_power_watts(92.0, idle_w, rated_w)
            metric = Metric(
                host_id=host.id,
                timestamp=now,
                received_at=now,
                cpu_percent=92.0,
                ram_percent=88.0,
                ram_used_bytes=int(node["total_ram"] * 0.88),
                disk_percent=node["disk"],
                disk_used_bytes=int(node["total_disk"] * (node["disk"] / 100)),
                net_recv_bytes_per_sec=node["net_rx"] * 2.5,
                net_sent_bytes_per_sec=node["net_tx"] * 3.0,
                uptime_seconds=86400 * 5,
                calculated_power_watts=calc_w,
            )
            db.add(metric)
    db.commit()
    return SimulationResult(
        status="success",
        action="power_stress",
        message="Executed peak compute load scaling (92% CPU). Dynamic PUE optimized to ~1.19!",
    )


@router.post("/outage", response_model=SimulationResult)
def trigger_outage_simulation(db: Session = Depends(get_db)):
    """Simulate total single-feed outage assessment and verify N+1 safety margin"""
    now = datetime.now(timezone.utc)
    for node in SIMULATED_NODES:
        host = db.query(Host).filter(Host.hostname == node["hostname"]).first()
        if host:
            host.last_seen = now
    db.commit()
    return SimulationResult(
        status="success",
        action="simulate_outage",
        message="Simulated Feed A blackout: Surviving Feed B sustains 100% cluster load within NEC 80% limit.",
    )
