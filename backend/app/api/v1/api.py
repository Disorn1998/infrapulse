from fastapi import APIRouter
from app.api.v1.endpoints import metrics, hosts, facility, alerts, pdus

api_router = APIRouter()

api_router.include_router(metrics.router, prefix="/metrics", tags=["Metrics Ingestion & Query"])
api_router.include_router(hosts.router, prefix="/hosts", tags=["Host Inventory & Power Config"])
api_router.include_router(pdus.router, prefix="/pdus", tags=["PDU & Electrical Feed Management"])
api_router.include_router(facility.router, prefix="/facility", tags=["Data Center & Dynamic PUE Facility Management"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["Threshold Alerts & State Machine"])
