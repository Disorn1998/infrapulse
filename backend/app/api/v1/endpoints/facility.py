from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.models.facility import FacilitySettings, FacilityPowerLog
from app.schemas.facility import (
    FacilityOverviewResponse,
    FacilitySettingsResponse,
    FacilitySettingsUpdate,
    FacilityPowerLogCreate,
    FacilityPowerLogResponse,
    CapacityForecastResponse,
)
from app.services.power_service import get_facility_overview
from app.services.capacity_service import calculate_capacity_forecast, seed_default_power_logs

router = APIRouter()


@router.get("/overview", response_model=FacilityOverviewResponse)
def get_dcim_overview(db: Session = Depends(get_db)):
    """
    Retrieve real-time Data Center Facility overview:
    - Dynamic PUE (Power Usage Effectiveness with fixed baseline overhead)
    - Total IT Power vs Total Facility Power (Watts)
    - Capacity Utilization against rated electrical infrastructure
    - Dual-Feed (A/B) N+1 Redundancy compliance with NEC 80% continuous derate check
    """
    return get_facility_overview(db)


@router.get("/forecast", response_model=CapacityForecastResponse)
def get_capacity_forecast(db: Session = Depends(get_db)):
    """
    Retrieve predictive capacity forecasting:
    - Power growth slope (Watts/day) via linear regression
    - Estimated days until 100% capacity exhaustion
    - Peak-node drop failover simulation & electrical headroom impact
    - Historical and projected trend points
    """
    return calculate_capacity_forecast(db)


@router.get("/power-logs", response_model=List[FacilityPowerLogResponse])
def list_facility_power_logs(db: Session = Depends(get_db)):
    """Retrieve monthly facility energy audit logs and calculated PUE history."""
    seed_default_power_logs(db)
    return db.query(FacilityPowerLog).order_by(FacilityPowerLog.log_month.asc()).all()


@router.post("/power-logs", response_model=FacilityPowerLogResponse, status_code=status.HTTP_201_CREATED)
def create_facility_power_log(
    log_in: FacilityPowerLogCreate,
    db: Session = Depends(get_db),
):
    """Record a monthly energy audit entry (Total kWh, IT Load kWh, and calculated PUE)."""
    if log_in.it_equipment_kwh <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="IT Equipment kWh must be greater than 0.")
    
    calculated_pue = round(log_in.total_facility_kwh / log_in.it_equipment_kwh, 3)

    existing = db.query(FacilityPowerLog).filter(FacilityPowerLog.log_month == log_in.log_month).first()
    if existing:
        existing.total_facility_kwh = log_in.total_facility_kwh
        existing.it_equipment_kwh = log_in.it_equipment_kwh
        existing.calculated_pue = calculated_pue
        existing.cooling_kwh = log_in.cooling_kwh or 0.0
        existing.notes = log_in.notes
        db.commit()
        db.refresh(existing)
        return existing

    new_log = FacilityPowerLog(
        log_month=log_in.log_month,
        total_facility_kwh=log_in.total_facility_kwh,
        it_equipment_kwh=log_in.it_equipment_kwh,
        calculated_pue=calculated_pue,
        cooling_kwh=log_in.cooling_kwh or 0.0,
        notes=log_in.notes,
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log


@router.delete("/power-logs/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_facility_power_log(log_id: str, db: Session = Depends(get_db)):
    """Delete a monthly power log audit entry."""
    entry = db.query(FacilityPowerLog).filter(FacilityPowerLog.id == log_id).first()
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Log '{log_id}' not found.")
    db.delete(entry)
    db.commit()
    return None


@router.get("/settings", response_model=FacilitySettingsResponse)
def get_facility_settings(db: Session = Depends(get_db)):
    """Retrieve facility room capacity, fixed overhead, and PUE configuration."""
    facility = db.query(FacilitySettings).filter(FacilitySettings.id == 1).first()
    if not facility:
        facility = FacilitySettings(
            id=1,
            facility_name="Bangkok Edge DC - Zone A",
            total_power_capacity_watts=10000.0,
            fixed_overhead_watts=35.0,
            cooling_overhead_factor=0.15,
            pdu_loss_factor=0.03,
            target_pue=1.30,
        )
        db.add(facility)
        db.commit()
        db.refresh(facility)
    return facility


@router.put("/settings", response_model=FacilitySettingsResponse)
def update_facility_settings(
    settings_in: FacilitySettingsUpdate,
    db: Session = Depends(get_db),
):
    """Update facility parameters (total capacity, fixed baseline watts, cooling factor, PDU loss, target PUE)."""
    facility = db.query(FacilitySettings).filter(FacilitySettings.id == 1).first()
    if not facility:
        facility = FacilitySettings(id=1)
        db.add(facility)

    update_data = settings_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(facility, field, value)

    db.commit()
    db.refresh(facility)
    return facility
