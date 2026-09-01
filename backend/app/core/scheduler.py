"""
InfraPulse Background Alert Worker
==================================

Runs periodic background evaluation of telemetry metrics and facility conditions.
Started automatically during FastAPI application lifespan startup.
"""

import asyncio
import logging
from app.core.database import SessionLocal
from app.services.alert_service import run_alert_evaluation_cycle

logger = logging.getLogger("infrapulse.scheduler")


async def alert_evaluator_worker(interval_seconds: int = 60):
    """Periodic background loop evaluating active alert rules."""
    logger.info(f"Started InfraPulse Alert Background Worker (interval: {interval_seconds}s)")
    
    # Wait 10s on boot before first evaluation cycle
    await asyncio.sleep(10)

    while True:
        try:
            db = SessionLocal()
            try:
                res = run_alert_evaluation_cycle(db)
                if res["total_alerts_dispatched"] > 0:
                    logger.warning(f"Alert cycle completed: {res['total_alerts_dispatched']} alert events dispatched.")
            finally:
                db.close()
        except Exception as e:
            logger.error(f"Error during alert evaluation background cycle: {e}", exc_info=True)

        await asyncio.sleep(interval_seconds)
