from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.power import PowerConfigResponse


class HostBase(BaseModel):
    hostname: str = Field(..., description="Unique hostname of the monitored node")
    ip_address: Optional[str] = Field(None, description="Primary network IP address")
    os_type: str = Field(..., description="Operating system family (e.g. ubuntu, windows, linux)")
    os_version: Optional[str] = Field(None, description="Detailed OS distribution / build version")
    cpu_count: Optional[int] = Field(1, ge=1, description="Number of logical CPU cores")
    total_ram_bytes: Optional[int] = Field(0, ge=0, description="Total installed RAM in bytes")
    total_disk_bytes: Optional[int] = Field(0, ge=0, description="Total root disk capacity in bytes")
    agent_version: Optional[str] = Field("1.0.0", description="InfraPulse Agent version string")


class HostCreate(HostBase):
    pass


class HostResponse(HostBase):
    id: str
    status: str
    is_online: bool = Field(default=True, description="True if last heartbeat received within 90 seconds")
    seconds_since_last_seen: int = Field(default=0, description="Seconds elapsed since last agent heartbeat")
    last_seen: datetime
    created_at: datetime
    updated_at: datetime
    power_config: Optional[PowerConfigResponse] = None

    model_config = ConfigDict(from_attributes=True)
