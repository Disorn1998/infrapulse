import time
import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.config import settings
from app.core.database import init_db, get_db
from app.core.scheduler import alert_evaluator_worker
from app.api.v1.api import api_router

# Setup Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("infrapulse.main")

START_TIME = time.time()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application Lifespan: Handles startup table creation, scheduler worker & shutdown cleanup."""
    logger.info("Starting InfraPulse Backend API...")
    try:
        init_db()
        logger.info("Database schema initialized and ready.")
    except Exception as e:
        logger.error(f"Failed to initialize database on startup: {e}")

    # Launch Background Alert Evaluation Worker (runs every 30s)
    worker_task = asyncio.create_task(alert_evaluator_worker(interval_seconds=30))
    
    yield

    worker_task.cancel()
    logger.info("Shutting down InfraPulse Backend API...")


app = FastAPI(
    title="InfraPulse — Mini Data Center Monitoring API",
    description=(
        "Unified IT Infrastructure and Critical Facility DCIM Monitoring System. "
        "Provides real-time host telemetry ingestion, dynamic power calculation, "
        "PUE (Power Usage Effectiveness) analysis, and threshold alerting."
    ),
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

from sqlalchemy import text
from app.core.database import engine


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled server error: {exc}", exc_info=True)
    if settings.ENVIRONMENT.lower() == "production":
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal Server Error. Please contact data center administrator."},
        )
    import traceback
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "traceback": traceback.format_exc().splitlines()},
    )


@app.get("/health", tags=["System Health"], status_code=status.HTTP_200_OK)
def health_check(db: Session = Depends(get_db)):
    """
    Service Healthcheck endpoint.
    Verifies database connectivity and returns system uptime.
    """
    db_status = "healthy"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        db_status = f"unhealthy: {str(e)}"

    uptime_sec = round(time.time() - START_TIME, 2)

    return {
        "status": "online" if db_status == "healthy" else "degraded",
        "database": db_status,
        "uptime_seconds": uptime_sec,
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "version": "0.1.0",
    }


@app.get("/", tags=["Root"])
def root():
    """Root landing endpoint with navigation links."""
    return {
        "message": "Welcome to InfraPulse API — Mini Data Center Monitoring System",
        "documentation": "/docs",
        "health": "/health",
        "api_v1_prefix": settings.API_V1_STR,
    }


# Mount API v1 Routes
app.include_router(api_router, prefix=settings.API_V1_STR)
