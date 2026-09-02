"""
InfraPulse Capacity Forecasting & Linear Regression Engine
==========================================================

Performs predictive analytics on facility electrical capacity, historical power growth,
runout trajectory (Days until 100% Exhaustion), and single-peak-node drop resilience.
"""

import math
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.host import Host
from app.models.metric import Metric
from app.models.facility import FacilitySettings, FacilityPowerLog
from app.schemas.facility import (
    CapacityForecastResponse,
    PeakNodeDropAnalysis,
    TrendDataPoint,
)
from app.services.power_service import get_facility_overview


def calculate_capacity_forecast(db: Session) -> CapacityForecastResponse:
    """
    Computes capacity utilization, linear growth regression,
    estimated days to exhaustion, and peak-node drop impact analysis.
    """
    # 1. Fetch current facility overview
    overview = get_facility_overview(db)
    total_capacity = overview.total_power_capacity_watts
    current_power = overview.total_facility_power_watts
    current_util_pct = overview.power_capacity_utilization_percent

    facility_settings = db.query(FacilitySettings).filter(FacilitySettings.id == 1).first()
    fixed_overhead = facility_settings.fixed_overhead_watts if facility_settings else 250.0
    cooling_factor = facility_settings.cooling_overhead_factor if facility_settings else 0.25
    pdu_loss = facility_settings.pdu_loss_factor if facility_settings else 0.05

    # 2. Query active hosts and find peak power consumer
    active_hosts = db.query(Host).filter(Host.is_test == False).all()
    
    peak_hostname = "N/A"
    peak_watts = 0.0
    
    for h in active_hosts:
        latest = (
            db.query(Metric)
            .filter(Metric.host_id == h.id)
            .order_by(Metric.timestamp.desc())
            .first()
        )
        if latest and latest.calculated_power_watts:
            if latest.calculated_power_watts > peak_watts:
                peak_watts = latest.calculated_power_watts
                peak_hostname = h.hostname

    surviving_it = max(0.0, overview.total_it_power_watts - peak_watts)
    surviving_facility_power = max(0.0, current_power - peak_watts)
    headroom = max(0.0, total_capacity - surviving_facility_power)
    is_safe = surviving_facility_power < (total_capacity * 0.80)

    peak_drop = PeakNodeDropAnalysis(
        peak_node_hostname=peak_hostname,
        peak_node_watts=round(peak_watts, 2),
        surviving_it_load_watts=round(surviving_it, 2),
        total_capacity_watts=round(total_capacity, 2),
        is_surviving_capacity_safe=is_safe,
        safety_headroom_watts=round(headroom, 2),
        impact_summary=(
            f"If peak node '{peak_hostname}' ({peak_watts:.1f}W) trips, cluster load reduces to "
            f"{surviving_it:.1f}W with {headroom:.1f}W utility headroom remaining."
        ),
    )

    # 3. Time-Series Trend & Linear Regression using REAL historical data
    bind = db.get_bind()
    is_sqlite = bind is not None and "sqlite" in bind.dialect.name
    if is_sqlite:
        day_bucket = func.strftime('%Y-%m-%d', Metric.timestamp)
    else:
        day_bucket = func.date_trunc('day', Metric.timestamp)
    
    # Get average IT power per host per day, then sum them up per day in python
    daily_host_avg = (
        db.query(
            day_bucket.label('day'),
            Metric.host_id,
            func.avg(Metric.calculated_power_watts).label('avg_power')
        )
        .join(Host, Host.id == Metric.host_id)
        .filter(Host.is_test == False)
        .filter(Metric.calculated_power_watts.isnot(None))
        .group_by(day_bucket, Metric.host_id)
        .order_by(day_bucket.asc())
        .all()
    )

    daily_totals: Dict[datetime, float] = {}
    for row in daily_host_avg:
        day_raw, host_id, avg_power = row
        if isinstance(day_raw, str):
            try:
                day_ts = datetime.strptime(day_raw[:10], "%Y-%m-%d").replace(tzinfo=timezone.utc)
            except Exception:
                day_ts = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        elif isinstance(day_raw, datetime):
            day_ts = day_raw if day_raw.tzinfo else day_raw.replace(tzinfo=timezone.utc)
        else:
            day_ts = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
            
        if day_ts not in daily_totals:
            daily_totals[day_ts] = 0.0
        daily_totals[day_ts] += float(avg_power)

    # Convert IT power to Facility power
    historical_points = []
    for day_ts, it_power in sorted(daily_totals.items()):
        fac_power = it_power + (it_power * cooling_factor) + (it_power * pdu_loss) + fixed_overhead
        historical_points.append((day_ts, fac_power))

    trend_points: List[TrendDataPoint] = []
    slope = 0.0
    intercept = current_power

    if len(historical_points) >= 2:
        start_time = historical_points[0][0]
        x_vals = []
        y_vals = []
        for ts, fac_power in historical_points:
            days_diff = (ts - start_time).total_seconds() / 86400.0
            x_vals.append(days_diff)
            y_vals.append(fac_power)

        n = len(x_vals)
        sum_x = sum(x_vals)
        sum_y = sum(y_vals)
        sum_xy = sum(x * y for x, y in zip(x_vals, y_vals))
        sum_x2 = sum(x * x for x in x_vals)
        denom = (n * sum_x2) - (sum_x * sum_x)
        
        if abs(denom) > 1e-6:
            slope = ((n * sum_xy) - (sum_x * sum_y)) / denom
            intercept = (sum_y - (slope * sum_x)) / n

    # Calculate days to 100% capacity exhaustion
    remaining_watts = total_capacity - current_power
    days_to_exhaustion = None
    exhaustion_date_str = None
    
    if slope > 0.05:
        days_to_exhaustion = max(1, int(remaining_watts / slope))
        target_date = datetime.now(timezone.utc) + timedelta(days=days_to_exhaustion)
        exhaustion_date_str = target_date.strftime("%Y-%m-%d")
        growth_trend = "RAPID_GROWTH" if slope > 40.0 else "MODERATE_GROWTH"
        recommendation = (
            f"Power consumption expanding at +{slope:.2f} W/day. Projected runout date: {exhaustion_date_str} "
            f"({days_to_exhaustion} days remaining). Current facility headroom is healthy."
        )
    elif slope < -0.05:
        growth_trend = "DECLINING"
        recommendation = "Power consumption is decreasing or optimizing. No capacity exhaustion risk."
    else:
        growth_trend = "STABLE"
        recommendation = f"Power consumption is highly stable (+{slope:.2f} W/day). Headroom: {remaining_watts:.1f}W."

    # Build trend points based on real data + 3 days future projection
    now = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Add real historical points
    last_real_ts = now
    for ts, fac_power in historical_points:
        # Calculate regression projection for this timestamp
        days_from_start = (ts - historical_points[0][0]).total_seconds() / 86400.0 if len(historical_points) > 0 else 0
        proj = intercept + (slope * days_from_start)
        
        trend_points.append(
            TrendDataPoint(
                timestamp=ts.strftime("%b %d"),
                actual_power_watts=round(fac_power, 1),
                projected_power_watts=round(proj, 1),
            )
        )
        last_real_ts = ts

    # If no data, at least show current power
    if not trend_points:
        trend_points.append(
            TrendDataPoint(
                timestamp=now.strftime("%b %d"),
                actual_power_watts=round(current_power, 1),
                projected_power_watts=round(current_power, 1),
            )
        )
        last_real_ts = now

    # Add 3 days of future projections
    for i in range(1, 4):
        future_date = last_real_ts + timedelta(days=i)
        days_from_start = (future_date - historical_points[0][0]).total_seconds() / 86400.0 if len(historical_points) > 0 else i
        proj = intercept + (slope * days_from_start)
        trend_points.append(
            TrendDataPoint(
                timestamp=future_date.strftime("%b %d"),
                actual_power_watts=None,
                projected_power_watts=round(max(0, proj), 1),
            )
        )

    return CapacityForecastResponse(
        current_power_load_watts=round(current_power, 2),
        total_capacity_watts=round(total_capacity, 2),
        current_utilization_percent=round(current_util_pct, 2),
        power_growth_slope_watts_per_day=round(slope, 2),
        estimated_days_to_exhaustion=days_to_exhaustion,
        exhaustion_date=exhaustion_date_str,
        growth_trend=growth_trend,
        peak_node_drop=peak_drop,
        historical_trend=trend_points,
        recommendation=recommendation,
    )
