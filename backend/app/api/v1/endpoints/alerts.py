from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.models.alert import AlertConfig, AlertHistory
from app.schemas.alert import (
    AlertConfigCreate,
    AlertConfigUpdate,
    AlertConfigResponse,
    AlertHistoryResponse,
)
from app.services.alert_service import run_alert_evaluation_cycle
from app.services.email_service import send_email_alert

router = APIRouter()


@router.get("/configs", response_model=List[AlertConfigResponse])
def list_alert_configs(
    host_id: Optional[str] = Query(None, description="Filter rules by target host ID"),
    db: Session = Depends(get_db),
):
    """List all active and inactive threshold alert configuration rules."""
    query = db.query(AlertConfig)
    if host_id:
        query = query.filter(AlertConfig.host_id == host_id.lower())
    return query.order_by(AlertConfig.created_at.desc()).all()


@router.post("/configs", response_model=AlertConfigResponse, status_code=status.HTTP_201_CREATED)
def create_alert_config(
    config_in: AlertConfigCreate,
    db: Session = Depends(get_db),
):
    """Create a new threshold alert rule (e.g. CPU >= 90% or Host Offline)."""
    new_rule = AlertConfig(
        host_id=config_in.host_id.lower() if config_in.host_id else None,
        metric_name=config_in.metric_name,
        operator=config_in.operator,
        threshold_value=config_in.threshold_value,
        recipient_email=config_in.recipient_email,
        cooldown_minutes=config_in.cooldown_minutes,
        is_active=config_in.is_active,
        current_state="OK",
    )
    db.add(new_rule)
    db.commit()
    db.refresh(new_rule)
    return new_rule


@router.get("/configs/{config_id}", response_model=AlertConfigResponse)
def get_alert_config(config_id: str, db: Session = Depends(get_db)):
    """Retrieve a single alert rule by ID."""
    rule = db.query(AlertConfig).filter(AlertConfig.id == config_id).first()
    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert rule '{config_id}' not found.",
        )
    return rule


@router.put("/configs/{config_id}", response_model=AlertConfigResponse)
def update_alert_config(
    config_id: str,
    update_in: AlertConfigUpdate,
    db: Session = Depends(get_db),
):
    """Update threshold, operator, recipient, or active status of an alert rule."""
    rule = db.query(AlertConfig).filter(AlertConfig.id == config_id).first()
    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert rule '{config_id}' not found.",
        )

    update_data = update_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(rule, field, val)

    db.commit()
    db.refresh(rule)
    return rule


@router.delete("/configs/{config_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_alert_config(config_id: str, db: Session = Depends(get_db)):
    """Delete an alert configuration rule."""
    rule = db.query(AlertConfig).filter(AlertConfig.id == config_id).first()
    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert rule '{config_id}' not found.",
        )
    db.delete(rule)
    db.commit()
    return None


@router.get("/history", response_model=List[AlertHistoryResponse])
def query_alert_history(
    host_id: Optional[str] = Query(None, description="Filter history by host ID"),
    limit: int = Query(default=100, ge=1, le=1000, description="Max records to retrieve"),
    db: Session = Depends(get_db),
):
    """Query immutable audit log of dispatched alert notifications."""
    query = db.query(AlertHistory)
    if host_id:
        query = query.filter(AlertHistory.host_id == host_id.lower())
    return query.order_by(desc(AlertHistory.sent_at)).limit(limit).all()


@router.post("/evaluate")
def trigger_immediate_evaluation(db: Session = Depends(get_db)):
    """Manually trigger an immediate alert evaluation cycle."""
    result = run_alert_evaluation_cycle(db)
    return result


@router.post("/test")
def send_test_alert_email(
    recipient_email: str = Query(..., description="Destination email address for verification"),
):
    """Send a test email notification to verify SMTP server credentials."""
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    success = send_email_alert(
        subject="[TEST] InfraPulse Alert Dispatcher Verification",
        recipient_email=recipient_email,
        title="SMTP Integration Test Successful",
        severity="INFO",
        target_name="Bangkok Edge DC Test Runner",
        metric_name="smtp_test_ping",
        current_value=1.0,
        threshold_value=1.0,
        details="This is a test notification confirming that the InfraPulse SMTP email alerting channel is active.",
        timestamp_str=now_str,
    )
    return {
        "status": "ok" if success else "failed",
        "recipient": recipient_email,
        "delivered": success,
    }
