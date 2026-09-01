from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class FacilitySettingsBase(BaseModel):
    facility_name: str = Field(default="Bangkok Edge DC - Zone A", description="Data Center site/zone name")
    total_power_capacity_watts: float = Field(default=10000.0, ge=100.0, description="Total electrical utility capacity (Watts)")
    fixed_overhead_watts: float = Field(default=35.0, ge=0.0, description="Fixed baseline non-IT power: CRAC fans, lighting, UPS idle loss, core networking (Watts)")
    cooling_overhead_factor: float = Field(default=0.15, ge=0.0, description="Variable cooling coefficient k_c (e.g., 0.15 = 15%)")
    pdu_loss_factor: float = Field(default=0.03, ge=0.0, description="Variable distribution loss lambda_pdu (e.g., 0.03 = 3%)")
    target_pue: float = Field(default=1.30, ge=1.0, description="Target PUE benchmark (e.g., Thailand BOI standard 1.30)")


class FacilitySettingsUpdate(BaseModel):
    facility_name: Optional[str] = None
    total_power_capacity_watts: Optional[float] = None
    fixed_overhead_watts: Optional[float] = None
    cooling_overhead_factor: Optional[float] = None
    pdu_loss_factor: Optional[float] = None
    target_pue: Optional[float] = None


class FacilitySettingsResponse(FacilitySettingsBase):
    id: int
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FeedStatus(BaseModel):
    feed_name: str                        # 'Feed A' | 'Feed B'
    pdu_names: List[str]
    rated_watts: float
    derated_capacity_watts: float         # 80% NEC continuous load limit
    current_load_watts: float
    utilization_percent: float
    is_derate_safe: bool


class RedundancyCheck(BaseModel):
    is_n_plus_one_compliant: bool
    status: str                           # 'HEALTHY', 'AT_RISK', 'NON_COMPLIANT'
    feed_a: Optional[FeedStatus] = None
    feed_b: Optional[FeedStatus] = None
    worst_case_failover_load_watts: float # Total load shifted to single surviving feed
    surviving_feed_headroom_watts: float
    message: str


class FacilityOverviewResponse(BaseModel):
    """
    Comprehensive DCIM Overview response aggregating real-time dynamic power,
    dynamic PUE metrics, capacity utilization, and Feed A/B N+1 redundancy analysis.
    """
    facility_name: str
    total_power_capacity_watts: float
    fixed_overhead_watts: float
    
    # Power Calculations (Watts)
    total_it_power_watts: float
    variable_cooling_power_watts: float
    variable_pdu_loss_watts: float
    total_facility_power_watts: float
    
    # Dynamic PUE Benchmark
    current_pue: float
    target_pue: float
    pue_status: str                       # 'OPTIMAL', 'DEGRADED', 'CRITICAL'
    
    # Capacity Utilization
    power_capacity_utilization_percent: float
    
    # Node Status
    active_hosts_count: int
    total_hosts_count: int
    
    # N+1 Feed Redundancy Assessment
    redundancy: RedundancyCheck

    model_config = ConfigDict(from_attributes=True)


# --- Phase 5: Facility Power Log Schemas ---
class FacilityPowerLogCreate(BaseModel):
    log_month: str = Field(..., description="Month identifier format 'YYYY-MM' (e.g. '2026-03')")
    total_facility_kwh: float = Field(..., ge=0.0, description="Total facility energy in kWh (from utility meter)")
    it_equipment_kwh: float = Field(..., ge=0.0, description="Total IT load energy in kWh (from rack/PDU meters)")
    cooling_kwh: Optional[float] = Field(default=0.0, ge=0.0, description="HVAC/CRAC cooling energy in kWh")
    notes: Optional[str] = Field(None, description="Optional audit notes or reference")


class FacilityPowerLogResponse(BaseModel):
    id: str
    log_month: str
    total_facility_kwh: float
    it_equipment_kwh: float
    calculated_pue: float
    cooling_kwh: Optional[float] = 0.0
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Phase 5: Capacity Forecasting Schemas ---
class PeakNodeDropAnalysis(BaseModel):
    peak_node_hostname: str
    peak_node_watts: float
    surviving_it_load_watts: float
    total_capacity_watts: float
    is_surviving_capacity_safe: bool
    safety_headroom_watts: float
    impact_summary: str


class TrendDataPoint(BaseModel):
    timestamp: str
    actual_power_watts: Optional[float] = None
    projected_power_watts: Optional[float] = None


class CapacityForecastResponse(BaseModel):
    current_power_load_watts: float
    total_capacity_watts: float
    current_utilization_percent: float
    power_growth_slope_watts_per_day: float
    estimated_days_to_exhaustion: Optional[int] = None
    exhaustion_date: Optional[str] = None
    growth_trend: str                      # 'STABLE', 'MODERATE_GROWTH', 'RAPID_GROWTH', 'DECLINING'
    peak_node_drop: PeakNodeDropAnalysis
    historical_trend: List[TrendDataPoint]
    recommendation: str

    model_config = ConfigDict(from_attributes=True)
