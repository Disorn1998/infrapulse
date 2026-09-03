import asyncio
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.rate_limit import simulation_rate_limiter
from app.core.websocket import ws_manager
from app.models.host import Host
from app.services.simulation_service import (
    ensure_simulated_cluster,
    tick_simulation_cycle,
    simulation_engine,
    SIMULATED_HOST_IDS,
)

router = APIRouter()


class SimulationResult(BaseModel):
    status: str
    action: str
    message: str


@router.post("/cluster", response_model=SimulationResult)
def trigger_cluster_simulation(db: Session = Depends(get_db)):
    """
    Instantly inject enterprise server nodes across Rack-01, Rack-02, and Rack-03,
    and activate the live telemetry ticker loop (Feed A ~950W, Feed B ~820W, Total ~1,770W, PUE ~1.21).
    """
    provisioned = ensure_simulated_cluster(db)
    simulation_engine.set_mode("normal")
    tick_simulation_cycle(db)

    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            loop.create_task(ws_manager.broadcast({
                "event": "simulation_updated",
                "action": "provision_cluster",
                "mode": "normal",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }))
    except Exception:
        pass

    return SimulationResult(
        status="success",
        action="provision_cluster",
        message="Provisioned 5 enterprise cluster nodes (Feed A: ~950W, Feed B: ~820W, Total IT: ~1,770W, PUE: ~1.21). Live ticker active.",
    )


@router.post("/stress", response_model=SimulationResult)
def trigger_stress_simulation(
    db: Session = Depends(get_db),
    _: None = Depends(simulation_rate_limiter),
):
    """Spike cluster compute to 88-95% CPU, jumping total IT power to ~3,200W."""
    simulation_engine.set_mode("stress")
    tick_simulation_cycle(db)

    now = datetime.now(timezone.utc)
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            loop.create_task(ws_manager.broadcast({
                "event": "simulation_updated",
                "action": "power_stress",
                "mode": "stress",
                "timestamp": now.isoformat(),
            }))
    except Exception:
        pass

    return SimulationResult(
        status="success",
        action="power_stress",
        message="Executed peak compute load scaling (90-95% CPU). IT load elevated with active thermal headroom tracking.",
    )


@router.post("/outage", response_model=SimulationResult)
def trigger_outage_simulation(
    db: Session = Depends(get_db),
    _: None = Depends(simulation_rate_limiter),
):
    """Simulate total Feed A blackout: verify single-feed load shedding and dual-corded failover to Feed B."""
    simulation_engine.set_mode("outage_feed_a")
    tick_simulation_cycle(db)

    now = datetime.now(timezone.utc)
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            loop.create_task(ws_manager.broadcast({
                "event": "simulation_updated",
                "action": "simulate_outage",
                "mode": "outage_feed_a",
                "timestamp": now.isoformat(),
            }))
    except Exception:
        pass

    return SimulationResult(
        status="success",
        action="simulate_outage",
        message="Simulated Feed A blackout: Feed A dropped to 0W while surviving Feed B sustains critical workloads.",
    )


@router.post("/reset", response_model=SimulationResult)
def trigger_reset_simulation(
    db: Session = Depends(get_db),
    _: None = Depends(simulation_rate_limiter),
):
    """Remove all simulated enterprise cluster nodes from database and restore clean production state."""
    simulation_engine.set_mode("normal")
    deleted_count = 0
    for host_id in SIMULATED_HOST_IDS:
        h = db.query(Host).filter(Host.id == host_id).first()
        if h:
            try:
                db.delete(h)
                db.flush()
                deleted_count += 1
            except Exception:
                db.rollback()
    db.commit()

    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            loop.create_task(ws_manager.broadcast({
                "event": "simulation_updated",
                "action": "reset_simulation",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }))
    except Exception:
        pass

    return SimulationResult(
        status="success",
        action="reset_simulation",
        message=f"Removed {deleted_count} simulated nodes. Restored clean production state.",
    )
