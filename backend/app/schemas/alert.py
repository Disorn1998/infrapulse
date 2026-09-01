from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class AlertConfigBase(BaseModel):
    host_id: Optional[str] = Field(None, description="Host ID to apply rule to. If None, applies as global rule.")
    metric_name: str = Field(..., description="'cpu_percent' | 'ram_percent' | 'disk_percent' | 'host_offline' | 'pue_exceeded'")
    operator: str = Field(default=">=", description="'>=' | '>' | '<=' | '<' | '=='")
    threshold_value: float = Field(..., description="Threshold numeric value (e.g. 85.0 for 85%)")
    recipient_email: str = Field(..., description="Destination email for SMTP alert notifications")
    cooldown_minutes: int = Field(default=15, ge=1, description="Minimum quiet time in minutes between alerts")
    is_active: bool = Field(default=True, description="Whether alert rule is enabled")


class AlertConfigCreate(AlertConfigBase):
    pass


class AlertConfigUpdate(BaseModel):
    metric_name: Optional[str] = None
    operator: Optional[str] = None
    threshold_value: Optional[float] = None
    recipient_email: Optional[str] = None
    cooldown_minutes: Optional[int] = None
    is_active: Optional[bool] = None
    current_state: Optional[str] = None


class AlertConfigResponse(AlertConfigBase):
    id: str
    current_state: str
    consecutive_breaches: int
    state_changed_at: Optional[datetime] = None
    last_notified_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AlertHistoryResponse(BaseModel):
    id: str
    alert_config_id: Optional[str] = None
    host_id: Optional[str] = None
    metric_name: str
    triggered_value: Optional[float] = None
    threshold_value: Optional[float] = None
    message: str
    status: str
    sent_at: datetime

    model_config = ConfigDict(from_attributes=True)
