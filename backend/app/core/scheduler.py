"""
InfraPulse Background Alert Worker
==================================

Runs periodic background evaluation of telemetry metrics and facility conditions.
Started automatically during FastAPI application lifespan startup.
"""

import asyncio
import logging
from datetime import datetime, timedelta, timezone
from app.core.config import settings
from app.core.database import SessionLocal
from app.core.websocket import ws_manager
from app.models.metric import Metric
from app.services.alert_service import run_alert_evaluation_cycle
from app.services.simulation_service import tick_simulation_cycle

logger = logging.getLogger("infrapulse.scheduler")


def purge_expired_metrics(db) -> int:
    """Purges historical telemetry data older than configured retention days."""
    try:
        retention_days = settings.METRIC_RETENTION_DAYS
        cutoff = datetime.now(timezone.utc) - timedelta(days=retention_days)
        deleted = db.query(Metric).filter(Metric.timestamp < cutoff).delete(synchronize_session=False)
        db.commit()
        if deleted > 0:
            logger.info(f"Purged {deleted} historical metric rows older than {retention_days} days.")
        return deleted
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to purge expired metrics: {e}")
        return 0


async def alert_evaluator_worker(interval_seconds: int = 30):
    """Periodic background loop evaluating active alert rules and data retention."""
    logger.info(f"Started InfraPulse Alert Background Worker (interval: {interval_seconds}s)")
    
    # Wait 10s on boot before first evaluation cycle
    await asyncio.sleep(10)
    cycle_counter = 0

    while True:
        try:
            db = SessionLocal()
            try:
                res = run_alert_evaluation_cycle(db)
                if res["total_alerts_dispatched"] > 0:
                    logger.warning(f"Alert cycle completed: {res['total_alerts_dispatched']} alert events dispatched.")
                
                # Run retention cleanup every 120 cycles (approx 1 hour on 30s interval)
                cycle_counter += 1
                if cycle_counter >= 120:
                    purge_expired_metrics(db)
                    cycle_counter = 0
            finally:
                db.close()
        except Exception as e:
            logger.error(f"Error during alert evaluation background cycle: {e}", exc_info=True)

        await asyncio.sleep(interval_seconds)


async def simulation_ticker_worker(interval_seconds: int = 10):
    """
    Continuous background loop keeping simulated enterprise cluster nodes online,
    generating dynamic fluctuating telemetry, and maintaining realistic Feed A/Feed B power loads.
    """
    logger.info(f"Started InfraPulse Simulation Ticker Worker (interval: {interval_seconds}s)")
    
    # Wait 3s on boot before first tick cycle
    await asyncio.sleep(3)

    while True:
        try:
            db = SessionLocal()
            try:
                updated_count = tick_simulation_cycle(db)
                if updated_count > 0:
                    await ws_manager.broadcast({
                        "event": "telemetry_update",
                        "action": "simulation_tick",
                        "updated_nodes": updated_count,
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    })
            finally:
                db.close()
        except Exception as e:
            logger.error(f"Error during simulation ticker cycle: {e}", exc_info=True)

        await asyncio.sleep(interval_seconds)

