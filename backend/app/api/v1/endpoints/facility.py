from typing import List
from datetime import datetime, timezone
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


@router.get("/racks")
def get_multi_rack_topology(db: Session = Depends(get_db)):
    """
    Retrieve Multi-Rack Data Center Topology (Rack-01, Rack-02, Rack-03)
    including occupied U-slots, electrical draw per feed, and thermal heatmap index.
    """
    from app.models.host import Host
    from app.models.power import PowerConfig
    from app.models.metric import Metric
    from sqlalchemy import desc

    racks_meta = [
        {"id": "Rack-01", "name": "Rack-01 (Compute Row A)", "zone": "Zone A - Web & App", "max_power_kw": 5.0},
        {"id": "Rack-02", "name": "Rack-02 (Database Row B)", "zone": "Zone B - High-IOPS DB", "max_power_kw": 8.0},
        {"id": "Rack-03", "name": "Rack-03 (AI/HPC Row C)", "zone": "Zone C - GPU Supercompute", "max_power_kw": 15.0},
    ]

    hosts = db.query(Host).filter(Host.is_test == False).all()
    results = []

    for r_meta in racks_meta:
        r_id = r_meta["id"]
        rack_hosts = []
        rack_total_power = 0.0
        rack_temps = []
        occupied_u_count = 0

        for h in hosts:
            p_cfg = db.query(PowerConfig).filter(PowerConfig.host_id == h.id).first()
            host_rack = p_cfg.rack_name if p_cfg and p_cfg.rack_name else "Rack-01"
            
            # Match rack or default to Rack-01
            if host_rack == r_id or (r_id == "Rack-01" and host_rack not in ["Rack-02", "Rack-03"]):
                latest_m = db.query(Metric).filter(Metric.host_id == h.id).order_by(desc(Metric.timestamp)).first()
                p_watts = latest_m.calculated_power_watts if latest_m else (p_cfg.idle_watts if p_cfg else 45.0)
                temp_c = (latest_m.cpu_temperature_celsius if latest_m and latest_m.cpu_temperature_celsius else 42.0)
                u_start = p_cfg.rack_unit_start if p_cfg and p_cfg.rack_unit_start else 1
                u_height = p_cfg.rack_unit_height if p_cfg and p_cfg.rack_unit_height else 1
                feed = p_cfg.pdu.feed if p_cfg and p_cfg.pdu else "A"

                occupied_u_count += u_height
                rack_total_power += p_watts
                rack_temps.append(temp_c)

                rack_hosts.append({
                    "host_id": h.id,
                    "hostname": h.hostname,
                    "status": h.status,
                    "is_online": (latest_m is not None),
                    "u_start": u_start,
                    "u_height": u_height,
                    "power_watts": round(p_watts, 1),
                    "temperature_celsius": round(temp_c, 1),
                    "feed": feed,
                    "rated_watts": p_cfg.rated_watts if p_cfg else 200.0,
                })

        avg_temp = round(sum(rack_temps) / len(rack_temps), 1) if rack_temps else 24.0

        results.append({
            "rack_id": r_id,
            "name": r_meta["name"],
            "zone": r_meta["zone"],
            "total_u": 42,
            "occupied_u": occupied_u_count,
            "available_u": max(0, 42 - occupied_u_count),
            "total_power_watts": round(rack_total_power, 1),
            "max_power_kw": r_meta["max_power_kw"],
            "power_utilization_pct": round((rack_total_power / (r_meta["max_power_kw"] * 1000.0)) * 100, 1),
            "avg_temperature_celsius": avg_temp,
            "thermal_status": "OPTIMAL" if avg_temp < 50 else ("WARM" if avg_temp < 70 else "HOTSPOT"),
            "hosts": rack_hosts,
        })

    return results


@router.get("/export/audit-csv")
def export_audit_csv(db: Session = Depends(get_db)):
    """Generate and stream a full CSV audit export for facility energy & inventory."""
    import io
    import csv
    from fastapi.responses import StreamingResponse
    from app.models.host import Host
    from app.models.power import PowerConfig
    from app.models.metric import Metric
    from app.services.power_service import get_facility_overview
    from sqlalchemy import desc

    output = io.StringIO()
    # Write UTF-8 BOM for Microsoft Excel compatibility
    output.write('\ufeff')
    writer = csv.writer(output)

    # 1. Header & Overview
    overview = get_facility_overview(db)
    writer.writerow(["INFRAPULSE DCIM FACILITY AUDIT REPORT"])
    writer.writerow(["Facility Name", overview.facility_name])
    writer.writerow(["Generated At (UTC)", datetime.now(timezone.utc).isoformat()])
    writer.writerow(["Dynamic PUE", overview.current_pue])
    writer.writerow(["BOI PUE Compliance (<= 1.30)", "COMPLIANT" if overview.current_pue <= 1.30 else "NON_COMPLIANT"])
    writer.writerow(["Total IT Power (W)", overview.total_it_power_watts])
    writer.writerow(["Total Facility Power (W)", overview.total_facility_power_watts])
    writer.writerow(["N+1 Redundancy Status", overview.redundancy.status])
    writer.writerow([])

    # 2. Host Telemetry & Power Allocation
    writer.writerow(["MONITORED NODE INVENTORY & ELECTRICAL ALLOCATION"])
    writer.writerow(["Hostname", "IP Address", "OS", "Cores", "Rack Location", "Feed", "Power (W)", "CPU Temp (C)", "Status"])
    
    hosts = db.query(Host).filter(Host.is_test == False).all()
    for h in hosts:
        p_cfg = db.query(PowerConfig).filter(PowerConfig.host_id == h.id).first()
        latest_m = db.query(Metric).filter(Metric.host_id == h.id).order_by(desc(Metric.timestamp)).first()
        p_watts = latest_m.calculated_power_watts if latest_m else (p_cfg.idle_watts if p_cfg else 45.0)
        temp_c = latest_m.cpu_temperature_celsius if latest_m and latest_m.cpu_temperature_celsius else 42.0
        feed = p_cfg.pdu.feed if p_cfg and p_cfg.pdu else "A"
        rack = p_cfg.rack_name if p_cfg else "Rack-01"
        u_pos = f"U{p_cfg.rack_unit_start}" if p_cfg else "U1"

        writer.writerow([
            h.hostname,
            h.ip_address or "-",
            f"{h.os_type} {h.os_version or ''}".strip(),
            h.cpu_count,
            f"{rack} ({u_pos})",
            f"Feed {feed}",
            round(p_watts, 1),
            round(temp_c, 1),
            h.status,
        ])
    writer.writerow([])

    # 3. Monthly Power Logs
    writer.writerow(["HISTORICAL MONTHLY POWER & PUE AUDITS"])
    writer.writerow(["Month", "Total Facility (kWh)", "IT Equipment (kWh)", "Calculated PUE", "Notes"])
    logs = db.query(FacilityPowerLog).order_by(FacilityPowerLog.log_month.desc()).all()
    for l in logs:
        writer.writerow([l.log_month, l.total_facility_kwh, l.it_equipment_kwh, l.calculated_pue, l.notes or ""])

    output.seek(0)
    filename = f"infrapulse_audit_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
