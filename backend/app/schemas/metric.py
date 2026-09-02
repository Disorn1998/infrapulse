from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class MetricIngest(BaseModel):
    """
    Schema sent by the Python agent (psutil) on Ubuntu/Windows nodes.
    Includes host identification metadata along with the telemetry snapshot.
    """
    # Host Metadata (allows automatic node discovery & registration)
    hostname: str = Field(..., description="Machine Hostname")
    ip_address: Optional[str] = Field(None, description="Current local/public IP")
    os_type: str = Field(..., description="'ubuntu' | 'windows' | 'linux'")
    os_version: Optional[str] = Field(None, description="OS distribution and version")
    cpu_count: Optional[int] = Field(1, description="Logical CPU Cores")
    total_ram_bytes: Optional[int] = Field(0, description="Installed RAM bytes")
    total_disk_bytes: Optional[int] = Field(0, description="Total Disk bytes")
    agent_version: Optional[str] = Field("1.0.0", description="Agent version")

    # High-Frequency System Metrics
    timestamp: Optional[datetime] = Field(None, description="Client-side sample timestamp with timezone (defaults to server now if omitted)")
    cpu_percent: float = Field(..., ge=0.0, le=100.0, description="Overall CPU usage percentage (0-100)")
    ram_percent: float = Field(..., ge=0.0, le=100.0, description="RAM utilization percentage (0-100)")
    ram_used_bytes: Optional[int] = Field(0, description="RAM consumed in bytes")
    disk_percent: float = Field(..., ge=0.0, le=100.0, description="Disk utilization percentage (0-100)")
    disk_used_bytes: Optional[int] = Field(0, description="Disk space used in bytes")
    net_sent_bytes_per_sec: Optional[float] = Field(0.0, description="Network transmit rate in B/s")
    net_recv_bytes_per_sec: Optional[float] = Field(0.0, description="Network receive rate in B/s")
    uptime_seconds: Optional[int] = Field(0, description="Host system uptime in seconds")

    # Optional System Load (Linux/Unix load averages)
    load_1m: Optional[float] = None
    load_5m: Optional[float] = None
    load_15m: Optional[float] = None

    # Thermal & Temperature Metric (°C)
    cpu_temperature_celsius: Optional[float] = Field(None, description="CPU package temperature in Celsius")


class MetricResponse(BaseModel):
    """Schema returned when querying metrics."""
    id: int
    host_id: str
    timestamp: datetime
    received_at: datetime
    cpu_percent: float
    ram_percent: float
    ram_used_bytes: Optional[int] = None
    disk_percent: float
    disk_used_bytes: Optional[int] = None
    net_sent_bytes_per_sec: Optional[float] = None
    net_recv_bytes_per_sec: Optional[float] = None
    uptime_seconds: Optional[int] = None
    calculated_power_watts: Optional[float] = None
    cpu_temperature_celsius: Optional[float] = 42.0
    load_1m: Optional[float] = None
    load_5m: Optional[float] = None
    load_15m: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)
