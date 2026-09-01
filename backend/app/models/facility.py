import uuid
from sqlalchemy import Column, String, Float, Integer, DateTime, CheckConstraint, func
from app.core.database import Base


class FacilitySettings(Base):
    """
    Facility Settings Table (Singleton):
    Encapsulates room-level parameters for Power Capacity Planning and Dynamic PUE Calculation.
    """
    __tablename__ = "facility_settings"

    id = Column(Integer, primary_key=True, default=1)
    facility_name = Column(String(100), nullable=False, default="Bangkok Edge DC - Zone A")
    
    # Power Infrastructure Capacity (Unified to Watts internally)
    total_power_capacity_watts = Column(Float, nullable=False, default=10000.0)  # 10 kW Main Breaker limit
    
    # Fixed Baseline Overhead (Watts) — CRAC baseline fan power, room lighting, UPS idle losses, core switch
    fixed_overhead_watts = Column(Float, nullable=False, default=35.0)
    
    # Variable Facility Overhead Multipliers
    cooling_overhead_factor = Column(Float, nullable=False, default=0.15)
    pdu_loss_factor = Column(Float, nullable=False, default=0.03)
    
    # Regulatory & SLA Benchmarks
    target_pue = Column(Float, nullable=False, default=1.30)

    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        CheckConstraint("id = 1", name="ck_facility_settings_single_row"),
    )


class FacilityPowerLog(Base):
    """
    Facility Power Log Table:
    Stores monthly energy audits (kWh) and historical utility bill tracking for long-term PUE analysis.
    """
    __tablename__ = "facility_power_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    log_month = Column(String(7), nullable=False, unique=True, index=True)  # 'YYYY-MM'
    total_facility_kwh = Column(Float, nullable=False)
    it_equipment_kwh = Column(Float, nullable=False)
    calculated_pue = Column(Float, nullable=False)
    cooling_kwh = Column(Float, nullable=True, default=0.0)
    notes = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
