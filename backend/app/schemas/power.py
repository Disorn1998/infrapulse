from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.pdu import PDUResponse


class PowerConfigBase(BaseModel):
    idle_watts: float = Field(default=15.0, description="Baseline power consumption at 0% load (Watts)")
    rated_watts: float = Field(default=65.0, description="Max rated power consumption at 100% load (Watts)")
    pdu_id: Optional[int] = Field(None, description="Primary PDU ID (Feed A)")
    secondary_pdu_id: Optional[int] = Field(None, description="Secondary PDU ID for dual-corded servers (Feed B)")
    pdu_outlet: Optional[str] = Field(default="Outlet-01", description="PDU socket label")
    rack_name: str = Field(default="Rack-01", description="42U Rack Identifier")
    rack_unit_start: int = Field(default=1, ge=1, le=42, description="Bottom U-slot occupied in rack (1-42)")
    rack_unit_height: int = Field(default=1, ge=1, le=42, description="Height in rack units (U)")


class PowerConfigCreate(PowerConfigBase):
    pass


class PowerConfigUpdate(BaseModel):
    idle_watts: Optional[float] = None
    rated_watts: Optional[float] = None
    pdu_id: Optional[int] = None
    secondary_pdu_id: Optional[int] = None
    pdu_outlet: Optional[str] = None
    rack_name: Optional[str] = None
    rack_unit_start: Optional[int] = None
    rack_unit_height: Optional[int] = None


class PowerConfigResponse(PowerConfigBase):
    id: str
    host_id: str
    created_at: datetime
    updated_at: datetime
    pdu: Optional[PDUResponse] = None
    secondary_pdu: Optional[PDUResponse] = None

    model_config = ConfigDict(from_attributes=True)
