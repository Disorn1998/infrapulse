from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class PDUBase(BaseModel):
    name: str = Field(..., description="Unique PDU Name (e.g. PDU-A1, PDU-B1)")
    feed: str = Field(..., description="Power Feed Phase ('A' | 'B')")
    rack_name: Optional[str] = Field(default="Rack-01", description="Associated 42U Rack")
    rated_watts: float = Field(default=3680.0, ge=1.0, description="Nominal Circuit Rating (Watts)")
    derate_factor: float = Field(default=0.800, ge=0.1, le=1.0, description="NEC 80% continuous load factor")


class PDUCreate(PDUBase):
    pass


class PDUUpdate(BaseModel):
    name: Optional[str] = None
    feed: Optional[str] = None
    rack_name: Optional[str] = None
    rated_watts: Optional[float] = None
    derate_factor: Optional[float] = None


class PDUResponse(PDUBase):
    id: int
    created_at: datetime
    updated_at: datetime

    @property
    def continuous_capacity_watts(self) -> float:
        """Effective continuous capacity adhering to NEC 80% derating."""
        return round(self.rated_watts * self.derate_factor, 2)

    model_config = ConfigDict(from_attributes=True)
