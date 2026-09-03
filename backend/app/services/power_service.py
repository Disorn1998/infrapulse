"""
InfraPulse Critical Facilities & Power Management Service
=========================================================

This module implements the mathematical models for estimating dynamic IT power draw,
Total Facility Power, Dynamic PUE (with fixed baseline overhead), and Dual-Feed (A/B)
N+1 Redundancy Compliance adhering to electrical standards (e.g., NEC 80% continuous load derating).

Mathematical Formulation:
-------------------------
1. Dynamic Server Power Draw (Linear Interpolation Model):
   P_IT(t) = P_idle + (CPU_percent(t) / 100.0) * (P_rated - P_idle)
   
   Where:
     - P_idle  = Baseline power consumption of host at 0% CPU utilization (Watts)
     - P_rated = Maximum rated power consumption / TDP at 100% CPU utilization (Watts)
     - CPU_percent(t) = Instantaneous CPU utilization (0.0 to 100.0)

2. Total Facility Power with Fixed Baseline Overhead:
   P_Facility(t) = P_IT(t) + (k_c * P_IT(t)) + (lambda_pdu * P_IT(t)) + P_fixed
   
   Where:
     - P_fixed    = Baseline non-IT electrical consumption: CRAC fans, room lighting,
                    UPS idle losses, core network switches/routers (Watts)
     - k_c        = Variable cooling power coefficient (~0.25 = 25%)
     - lambda_pdu = Variable electrical distribution and transformer loss (~0.05 = 5%)

3. Dynamic Power Usage Effectiveness (PUE):
   PUE(t) = P_Facility(t) / P_IT(t)
          = 1.0 + k_c + lambda_pdu + (P_fixed / P_IT(t))

   Industry Insight:
   PUE naturally degrades at low/off-peak loads because P_fixed represents a constant baseline.
   As IT workload increases, PUE converges towards the optimal variable efficiency floor (1 + k_c + lambda_pdu).

4. Dual-Feed N+1 Redundancy (NEC 80% Continuous Rule):
   Continuous derated capacity = PDU_rated_watts * derate_factor (0.800)
   Under single-feed outage (Feed A or B failure), total load on surviving feed must satisfy:
   Sum(P_IT_failover) <= PDU_surviving_capacity * 0.800
"""

from typing import Optional, List, Dict
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.host import Host
from app.models.metric import Metric
from app.models.pdu import PDU
from app.models.power import PowerConfig
from app.models.facility import FacilitySettings
from app.schemas.facility import FacilityOverviewResponse, FeedStatus, RedundancyCheck


def calculate_node_power_watts(idle_watts: float, rated_watts: float, cpu_percent: float) -> float:
    """
    Computes real-time estimated power draw for a single host using linear interpolation
    based on instantaneous CPU utilization.

    Formula:
        P_node = idle_watts + (rated_watts - idle_watts) * (cpu_percent / 100.0)
    """
    clamped_cpu = max(0.0, min(100.0, cpu_percent))
    effective_idle = max(1.0, idle_watts)
    effective_rated = max(effective_idle, rated_watts)
    
    dynamic_draw = effective_idle + ((clamped_cpu / 100.0) * (effective_rated - effective_idle))
    return round(dynamic_draw, 2)


def get_facility_overview(db: Session, include_simulated: bool = True) -> FacilityOverviewResponse:
    """
    Aggregates active telemetry across all monitored nodes to produce real-time
    Data Center Facility metrics, Dynamic PUE index (with fixed baseline overhead),
    and Dual-Feed (A/B) N+1 redundancy analysis.
    """
    # 1. Retrieve Singleton Facility Settings
    facility = db.query(FacilitySettings).filter(FacilitySettings.id == 1).first()
    if not facility:
        facility_name = "Bangkok Edge DC - Zone A"
        total_capacity_w = 10000.0
        fixed_overhead_w = 45.0
        cooling_factor = 0.15
        pdu_loss = 0.03
        target_pue = 1.30
    else:
        facility_name = facility.facility_name
        total_capacity_w = facility.total_power_capacity_watts
        fixed_overhead_w = facility.fixed_overhead_watts
        cooling_factor = facility.cooling_overhead_factor
        pdu_loss = facility.pdu_loss_factor
        target_pue = facility.target_pue

    # 2. Query hosts and identify active hosts (heartbeat within last 3 minutes)
    query = db.query(Host)
    if not include_simulated:
        query = query.filter(Host.is_test == False)
    all_hosts = query.all()
    total_hosts_count = len(all_hosts)
    cutoff_time = datetime.now(timezone.utc) - timedelta(minutes=3)

    active_hosts_count = 0
    total_it_power_watts = 0.0
    
    # Track load per feed for N+1 analysis
    feed_a_load = 0.0
    feed_b_load = 0.0
    total_dual_corded_load = 0.0

    for host in all_hosts:
        is_active = host.last_seen and (
            (host.last_seen.tzinfo is None and host.last_seen > cutoff_time.replace(tzinfo=None))
            or (host.last_seen.tzinfo is not None and host.last_seen > cutoff_time)
        )
        
        latest_metric = (
            db.query(Metric)
            .filter(Metric.host_id == host.id)
            .order_by(Metric.timestamp.desc())
            .first()
        )
        
        if is_active and latest_metric:
            active_hosts_count += 1
            node_power = latest_metric.calculated_power_watts or 0.0
            total_it_power_watts += node_power

            # Distribute load according to host's PDU assignments
            power_cfg = host.power_config
            if power_cfg and power_cfg.pdu:
                pdu_a = power_cfg.pdu
                pdu_b = power_cfg.secondary_pdu

                if pdu_a and pdu_b:
                    # Dual-corded host: split load 50/50 across Feed A and Feed B
                    half_load = node_power / 2.0
                    feed_a_load += half_load
                    feed_b_load += half_load
                    total_dual_corded_load += node_power
                elif pdu_a.feed.upper() == "A":
                    feed_a_load += node_power
                elif pdu_a.feed.upper() == "B":
                    feed_b_load += node_power
            else:
                # Default fallback: assign to Feed A
                feed_a_load += node_power

    # 3. Dynamic Power & True Non-Constant PUE Calculation
    var_cooling_w = total_it_power_watts * cooling_factor
    var_pdu_w = total_it_power_watts * pdu_loss
    total_facility_power_watts = total_it_power_watts + var_cooling_w + var_pdu_w + fixed_overhead_w

    if total_it_power_watts > 0:
        # Dynamic PUE = 1 + k_c + lambda_pdu + (P_fixed / P_IT)
        current_pue = round(total_facility_power_watts / total_it_power_watts, 3)
    else:
        # If no IT load is online, facility still draws baseline fixed power
        current_pue = 9.99

    # 4. PUE Benchmark Status
    if current_pue <= target_pue:
        pue_status = "OPTIMAL"
    elif current_pue <= target_pue + 0.25:
        pue_status = "DEGRADED"
    else:
        pue_status = "CRITICAL"

    # 5. Capacity Utilization %
    power_utilization_pct = round((total_facility_power_watts / total_capacity_w) * 100.0, 2)

    # 6. PDU Feeds & N+1 Redundancy Failover Simulation
    pdus = db.query(PDU).all()
    pdus_a = [p for p in pdus if p.feed.upper() == "A"]
    pdus_b = [p for p in pdus if p.feed.upper() == "B"]

    cap_a_rated = sum(p.rated_watts for p in pdus_a) or 3680.0
    derated_cap_a = sum(p.rated_watts * p.derate_factor for p in pdus_a) or 2944.0

    cap_b_rated = sum(p.rated_watts for p in pdus_b) or 3680.0
    derated_cap_b = sum(p.rated_watts * p.derate_factor for p in pdus_b) or 2944.0

    feed_a_status = FeedStatus(
        feed_name="Feed A",
        pdu_names=[p.name for p in pdus_a] if pdus_a else ["PDU-A1 (default)"],
        rated_watts=round(cap_a_rated, 2),
        derated_capacity_watts=round(derated_cap_a, 2),
        current_load_watts=round(feed_a_load, 2),
        utilization_percent=round((feed_a_load / max(1.0, derated_cap_a)) * 100.0, 2),
        is_derate_safe=feed_a_load <= derated_cap_a,
    )

    feed_b_status = FeedStatus(
        feed_name="Feed B",
        pdu_names=[p.name for p in pdus_b] if pdus_b else ["PDU-B1 (default)"],
        rated_watts=round(cap_b_rated, 2),
        derated_capacity_watts=round(derated_cap_b, 2),
        current_load_watts=round(feed_b_load, 2),
        utilization_percent=round((feed_b_load / max(1.0, derated_cap_b)) * 100.0, 2),
        is_derate_safe=feed_b_load <= derated_cap_b,
    )

    # Failover Simulation: If one feed fails, all IT load must be absorbed by the surviving feed
    worst_case_failover_load = round(total_it_power_watts, 2)
    surviving_capacity = min(derated_cap_a, derated_cap_b)
    surviving_headroom = round(surviving_capacity - worst_case_failover_load, 2)

    is_n1_compliant = worst_case_failover_load <= surviving_capacity and power_utilization_pct < 80.0
    
    if is_n1_compliant:
        red_status = "HEALTHY"
        red_msg = (
            f"N+1 Redundancy Compliant. In total single-feed outage, surviving feed sustains "
            f"{worst_case_failover_load}W within NEC continuous limit with {surviving_headroom}W safety headroom."
        )
    elif worst_case_failover_load <= min(cap_a_rated, cap_b_rated):
        red_status = "AT_RISK"
        red_msg = (
            f"N+1 At Risk: Failover load ({worst_case_failover_load}W) exceeds NEC 80% continuous derating "
            f"limit ({surviving_capacity}W) but remains below nominal breaker rating."
        )
    else:
        red_status = "NON_COMPLIANT"
        red_msg = (
            f"N+1 Non-Compliant: Failover load ({worst_case_failover_load}W) exceeds surviving feed capacity. "
            f"A single feed outage will trigger circuit breaker trips."
        )

    redundancy_check = RedundancyCheck(
        is_n_plus_one_compliant=is_n1_compliant,
        status=red_status,
        feed_a=feed_a_status,
        feed_b=feed_b_status,
        worst_case_failover_load_watts=worst_case_failover_load,
        surviving_feed_headroom_watts=surviving_headroom,
        message=red_msg,
    )

    return FacilityOverviewResponse(
        facility_name=facility_name,
        total_power_capacity_watts=round(total_capacity_w, 2),
        fixed_overhead_watts=round(fixed_overhead_w, 2),
        total_it_power_watts=round(total_it_power_watts, 2),
        variable_cooling_power_watts=round(var_cooling_w, 2),
        variable_pdu_loss_watts=round(var_pdu_w, 2),
        total_facility_power_watts=round(total_facility_power_watts, 2),
        current_pue=current_pue,
        target_pue=target_pue,
        pue_status=pue_status,
        power_capacity_utilization_percent=power_utilization_pct,
        active_hosts_count=active_hosts_count,
        total_hosts_count=total_hosts_count,
        redundancy=redundancy_check,
    )
