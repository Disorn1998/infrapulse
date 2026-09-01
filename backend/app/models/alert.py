import uuid
from sqlalchemy import Column, String, Float, Integer, Boolean, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class AlertConfig(Base):
    """
    Alert Configuration:
    Stores threshold alerting rules for CPU, RAM, Disk, Host Offline, and PUE.
    Includes state machine tracking (OK -> PENDING -> FIRING) for Phase 4 alert dispatcher.
    """
    __tablename__ = "alert_config"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    host_id = Column(String(100), ForeignKey("hosts.id", ondelete="CASCADE"), nullable=True, index=True)
    metric_name = Column(String(50), nullable=False)  # 'cpu_percent', 'ram_percent', 'disk_percent', 'host_offline', 'pue_exceeded'
    operator = Column(String(10), nullable=False, default=">=")  # '>=', '>', '<=', '<', '=='
    threshold_value = Column(Float, nullable=False)
    recipient_email = Column(String(255), nullable=False)
    cooldown_minutes = Column(Integer, nullable=False, default=15)
    is_active = Column(Boolean, nullable=False, default=True)
    
    # Alert State Machine Columns
    current_state = Column(String(20), nullable=False, default="OK")       # 'OK', 'PENDING', 'FIRING'
    consecutive_breaches = Column(Integer, nullable=False, default=0)      # Counter for threshold breaches before firing
    state_changed_at = Column(DateTime(timezone=True), nullable=True)     # Timestamp when state transitioned
    last_notified_at = Column(DateTime(timezone=True), nullable=True)     # Timestamp of last dispatched email notification

    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    # Relationship
    host = relationship("Host", back_populates="alerts")


class AlertHistory(Base):
    """
    Alert History Table:
    Immutable audit log of all triggered email alerts and notification events.
    """
    __tablename__ = "alert_history"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    alert_config_id = Column(String(36), ForeignKey("alert_config.id", ondelete="SET NULL"), nullable=True)
    host_id = Column(String(100), ForeignKey("hosts.id", ondelete="CASCADE"), nullable=True)
    metric_name = Column(String(50), nullable=False)
    triggered_value = Column(Float, nullable=True)
    threshold_value = Column(Float, nullable=True)
    message = Column(Text, nullable=False)
    status = Column(String(20), nullable=False, default="TRIGGERED")  # 'TRIGGERED', 'SENT', 'FAILED'
    sent_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), index=True)
