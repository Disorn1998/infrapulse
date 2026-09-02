from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.host import Host
from app.models.power import PowerConfig
from app.models.pdu import PDU
from app.schemas.host import HostResponse
from app.schemas.power import PowerConfigUpdate, PowerConfigResponse

router = APIRouter()

OFFLINE_THRESHOLD_SECONDS = 90


def enrich_host_status(host: Host) -> dict:
    """Enriches host ORM object with server-calculated online/offline status and lag."""
    now = datetime.now(timezone.utc)
    if host.last_seen:
        if host.last_seen.tzinfo is None:
            last_seen_aware = host.last_seen.replace(tzinfo=timezone.utc)
        else:
            last_seen_aware = host.last_seen
        diff_sec = max(0, int((now - last_seen_aware).total_seconds()))
    else:
        diff_sec = 999999

    is_online = diff_sec <= OFFLINE_THRESHOLD_SECONDS
    computed_status = "online" if is_online else "offline"

    return {
        "id": host.id,
        "hostname": host.hostname,
        "ip_address": host.ip_address,
        "os_type": host.os_type,
        "os_version": host.os_version,
        "cpu_count": host.cpu_count,
        "total_ram_bytes": host.total_ram_bytes,
        "total_disk_bytes": host.total_disk_bytes,
        "agent_version": host.agent_version,
        "status": computed_status,
        "is_online": is_online,
        "seconds_since_last_seen": diff_sec,
        "last_seen": host.last_seen,
        "created_at": host.created_at,
        "updated_at": host.updated_at,
        "power_config": host.power_config,
    }


@router.get("", response_model=List[HostResponse])
def list_hosts(
    include_test: bool = Query(default=False, description="Include test nodes if true"),
    db: Session = Depends(get_db),
):
    """
    List all monitored host nodes in the inventory.
    Excludes synthetic/test nodes by default to maintain a clean production dashboard.
    """
    query = db.query(Host)
    if not include_test:
        query = query.filter(Host.is_test == False)
    hosts = query.order_by(Host.hostname.asc()).all()
    return [enrich_host_status(h) for h in hosts]


@router.get("/{host_id}", response_model=HostResponse)
def get_host(host_id: str, db: Session = Depends(get_db)):
    """Retrieve detailed metadata, dynamic online status, and power specs for a host."""
    clean_target = host_id.strip()
    host = db.query(Host).filter((Host.id == clean_target.lower()) | (Host.hostname == clean_target)).first()
    if not host:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Host '{host_id}' not found.",
        )
    return enrich_host_status(host)


@router.put("/{host_id}/power", response_model=PowerConfigResponse)
def update_host_power_config(
    host_id: str,
    power_in: PowerConfigUpdate,
    db: Session = Depends(get_db),
):
    """
    Update power ratings (Idle/Rated Watts), PDU feed assignments (Primary & Secondary for N+1),
    and 42U rack layout location for a host.
    """
    clean_target = host_id.strip()
    host = db.query(Host).filter((Host.id == clean_target.lower()) | (Host.hostname == clean_target)).first()
    if not host:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Host '{host_id}' not found.",
        )

    power_cfg = db.query(PowerConfig).filter(PowerConfig.host_id == host.id).first()
    if not power_cfg:
        power_cfg = PowerConfig(host_id=host.id)
        db.add(power_cfg)

    # Validate PDU existence if provided
    if power_in.pdu_id:
        pdu = db.query(PDU).filter(PDU.id == power_in.pdu_id).first()
        if not pdu:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Primary PDU ID {power_in.pdu_id} not found.")

    if power_in.secondary_pdu_id:
        sec_pdu = db.query(PDU).filter(PDU.id == power_in.secondary_pdu_id).first()
        if not sec_pdu:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Secondary PDU ID {power_in.secondary_pdu_id} not found.")

    update_data = power_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(power_cfg, field, value)

    db.commit()
    db.refresh(power_cfg)
    return power_cfg


@router.delete("/{host_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_host(host_id: str, db: Session = Depends(get_db)):
    """Remove a host and all its associated metrics from the inventory."""
    clean_target = host_id.strip()
    host = db.query(Host).filter((Host.id == clean_target.lower()) | (Host.hostname == clean_target)).first()
    if not host:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Host '{host_id}' not found.",
        )
    try:
        db.delete(host)
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete host '{host_id}': it has linked records that prevent deletion.",
        )
    return None
