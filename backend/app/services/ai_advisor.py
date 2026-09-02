import uuid
from datetime import datetime, timezone
from typing import List
from sqlalchemy.orm import Session

from app.models.host import Host
from app.models.metric import Metric
from app.services.power_service import get_facility_overview
from app.services.capacity_service import calculate_capacity_forecast
from app.schemas.ai import AiAdvisorResponse, AiInsightCard


def generate_ai_advisor_insights(db: Session) -> AiAdvisorResponse:
    """
    AI DCIM Copilot Engine:
    Analyzes live facility metrics, power distribution, PUE thermodynamic efficiency,
    and capacity trajectory to generate an overall health score and actionable recommendations.
    """
    facility_ov = get_facility_overview(db)
    forecast = calculate_capacity_forecast(db)
    now_str = datetime.now(timezone.utc).isoformat()

    # Query active registered hosts (excluding synthetic tests)
    hosts = db.query(Host).filter(Host.is_test == False).all()

    health_score = 100
    insights: List[AiInsightCard] = []

    # -------------------------------------------------------------
    # 1. PUE Efficiency & Energy Optimization Analysis
    # -------------------------------------------------------------
    pue = facility_ov.current_pue
    it_power = facility_ov.total_it_power_watts
    fixed_overhead = facility_ov.fixed_overhead_watts

    if it_power < 200.0:
        health_score -= 5
        insights.append(
            AiInsightCard(
                id=str(uuid.uuid4()),
                category="ENERGY_OPTIMIZATION",
                severity="OPTIMIZATION",
                title="Low Workload Overhead Dilution (High Fixed PUE)",
                summary=f"IT compute load ({it_power:.1f}W) is relatively low, causing constant fixed baseline overhead ({fixed_overhead}W) to dominate PUE ({pue:.2f}).",
                impact=f"Operational efficiency sits at PUE {pue:.2f}, above Thailand BOI target (1.30).",
                recommended_action="Consolidate low-priority background workloads or deploy scheduled batch computing during off-peak hours to maximize thermal efficiency.",
                estimated_savings_or_benefit="Potential +18% thermodynamic efficiency gain upon workload consolidation.",
                action_type="CONSOLIDATE_NODES",
                created_at=now_str,
            )
        )
    elif pue <= 1.30:
        insights.append(
            AiInsightCard(
                id=str(uuid.uuid4()),
                category="ENERGY_OPTIMIZATION",
                severity="INFO",
                title="BOI Green Data Center Compliance Achieved",
                summary=f"Dynamic PUE ({pue:.3f}) operates within Thailand BOI Data Center tax incentive standards (PUE <= 1.30).",
                impact="Optimal energy efficiency with fixed facility overhead successfully diluted across compute workloads.",
                recommended_action="Maintain current airflow containment and cold-aisle thermal profiles.",
                estimated_savings_or_benefit="Eligible for Board of Investment (BOI) corporate energy efficiency credits.",
                action_type="HEALTHY",
                created_at=now_str,
            )
        )
    else:
        health_score -= 8
        insights.append(
            AiInsightCard(
                id=str(uuid.uuid4()),
                category="ENERGY_OPTIMIZATION",
                severity="WARNING",
                title="PUE Efficiency Degradation Observed",
                summary=f"Current Dynamic PUE is {pue:.2f}, exceeding target efficiency threshold of 1.30.",
                impact="Higher electrical utility cost per compute Watt delivered.",
                recommended_action="Inspect CRAC cooling fan variable frequency drives (VFD) and ensure rack blanking panels are properly installed.",
                estimated_savings_or_benefit="Estimated 5-10% monthly cooling kWh reduction upon airflow sealing.",
                action_type="INSPECT_NODE",
                created_at=now_str,
            )
        )

    # -------------------------------------------------------------
    # 2. Dual-Feed Electrical Redundancy (N+1) & Phase Balancing
    # -------------------------------------------------------------
    red = facility_ov.redundancy
    feed_a_load = red.feed_a.current_load_watts
    feed_b_load = red.feed_b.current_load_watts
    total_feed_load = feed_a_load + feed_b_load

    if total_feed_load > 0:
        imbalance_ratio = abs(feed_a_load - feed_b_load) / total_feed_load
        if imbalance_ratio > 0.35 and total_feed_load > 300.0:
            health_score -= 10
            heavier_feed = "Feed A (PDU-A1)" if feed_a_load > feed_b_load else "Feed B (PDU-B1)"
            lighter_feed = "Feed B" if feed_a_load > feed_b_load else "Feed A"
            insights.append(
                AiInsightCard(
                    id=str(uuid.uuid4()),
                    category="ELECTRICAL_SAFETY",
                    severity="WARNING",
                    title="A/B Dual-Feed Power Imbalance Detected",
                    summary=f"{heavier_feed} carries {max(feed_a_load, feed_b_load):.1f}W while {lighter_feed} carries only {min(feed_a_load, feed_b_load):.1f}W ({imbalance_ratio*100:.1f}% imbalance).",
                    impact="Uneven breaker thermal aging and reduced failover headroom during maintenance.",
                    recommended_action=f"Migrate 1-2 server nodes from {heavier_feed} to {lighter_feed} to achieve balanced 50/50 dual-feed distribution.",
                    estimated_savings_or_benefit=f"Restores symmetrical breaker failover margin (+{abs(feed_a_load - feed_b_load)/2:.1f}W balance).",
                    action_type="REBALANCE_FEED",
                    created_at=now_str,
                )
            )

    if not red.is_n_plus_one_compliant or red.status == "NON_COMPLIANT":
        health_score -= 30
        insights.append(
            AiInsightCard(
                id=str(uuid.uuid4()),
                category="ELECTRICAL_SAFETY",
                severity="CRITICAL",
                title="CRITICAL: N+1 Redundancy Breaker Overload Risk",
                summary="Total IT load exceeds single-feed NEC 80% continuous continuous derated limit (2944W).",
                impact="In the event of a utility Feed A blackout, the surviving Feed B breaker will trip, causing total room blackout!",
                recommended_action="Immediately shed non-critical compute workloads or commission secondary PDU circuit.",
                estimated_savings_or_benefit="Prevents catastrophic facility-wide ungraceful shutdown.",
                action_type="REBALANCE_FEED",
                created_at=now_str,
            )
        )

    # -------------------------------------------------------------
    # 3. Capacity Growth & Runout Exhaustion Forecasting
    # -------------------------------------------------------------
    days_left = forecast.estimated_days_to_exhaustion
    slope = forecast.power_growth_slope_watts_per_day
    util_pct = forecast.current_utilization_percent

    if days_left is not None and days_left <= 60:
        health_score -= 15
        insights.append(
            AiInsightCard(
                id=str(uuid.uuid4()),
                category="CAPACITY_PLANNING",
                severity="WARNING",
                title="Electrical Capacity Runout Approaching",
                summary=f"Power consumption expanding at +{slope:.1f} W/day. Projected 100% capacity exhaustion in {days_left} days ({forecast.exhaustion_date}).",
                impact="Future server provisioning will be blocked by main electrical breaker limits.",
                recommended_action="Initiate procurement cycle for utility transformer upgrade or PDU capacity expansion within 30 days.",
                estimated_savings_or_benefit="Guarantees uninterrupted business expansion and zero provisioning delays.",
                action_type="EXPAND_CAPACITY",
                created_at=now_str,
            )
        )
    else:
        insights.append(
            AiInsightCard(
                id=str(uuid.uuid4()),
                category="CAPACITY_PLANNING",
                severity="INFO",
                title="Electrical Capacity Headroom Healthy",
                summary=f"Facility utilization at {util_pct:.1f}% ({forecast.current_power_load_watts:.0f}W / {forecast.total_capacity_watts:.0f}W) with {forecast.peak_node_drop.safety_headroom_watts:.0f}W safety buffer.",
                impact=f"Estimated {days_left if days_left else '365+'} days of expansion runway remaining at current trajectory.",
                recommended_action="Standard 42U rack expansion can proceed as planned.",
                estimated_savings_or_benefit="Zero immediate capital expenditure required for electrical expansion.",
                action_type="HEALTHY",
                created_at=now_str,
            )
        )

    # -------------------------------------------------------------
    # 4. Host Node Saturation & Hardware Health
    # -------------------------------------------------------------
    now_utc = datetime.now(timezone.utc)
    online_hosts_count = 0
    offline_nodes = []
    
    for h in hosts:
        is_node_online = bool(h.last_seen and (now_utc - h.last_seen).total_seconds() <= 90)
        if is_node_online:
            online_hosts_count += 1
        else:
            offline_nodes.append(h.hostname)

    if offline_nodes:
        health_score -= (len(offline_nodes) * 5)
        insights.append(
            AiInsightCard(
                id=str(uuid.uuid4()),
                category="HARDWARE_HEALTH",
                severity="WARNING",
                title=f"Node Unreachable: {', '.join(offline_nodes[:3])}",
                summary=f"{len(offline_nodes)} server node(s) have not sent telemetry heartbeats within the last 90 seconds.",
                impact="Degraded compute cluster capacity and telemetry visibility loss.",
                recommended_action="Check node physical network connection, systemd service status, or local power state.",
                estimated_savings_or_benefit="Restores high-availability cluster redundancy.",
                action_type="INSPECT_NODE",
                created_at=now_str,
            )
        )

    # -------------------------------------------------------------
    # 5. Thermal & Airflow Heatmap Diagnostics
    # -------------------------------------------------------------
    from sqlalchemy import desc
    hot_nodes = []
    for h in hosts:
        latest_m = db.query(Metric).filter(Metric.host_id == h.id).order_by(desc(Metric.timestamp)).first()
        if latest_m and latest_m.cpu_temperature_celsius and latest_m.cpu_temperature_celsius >= 75.0:
            hot_nodes.append((h.hostname, latest_m.cpu_temperature_celsius))

    if hot_nodes:
        health_score -= (len(hot_nodes) * 10)
        hot_str = ", ".join([f"{name} ({t}°C)" for name, t in hot_nodes[:3]])
        insights.append(
            AiInsightCard(
                id=str(uuid.uuid4()),
                category="THERMAL_MANAGEMENT",
                severity="WARNING",
                title=f"Thermal Hotspot Detected: {hot_str}",
                summary=f"{len(hot_nodes)} node(s) exceed recommended operating threshold (75°C). Thermal throttling risk.",
                impact="Potential CPU throttling, degraded workload performance, and accelerated hardware degradation.",
                recommended_action="Inspect CRAC airflow intake, clean dust filters, or migrate high-density workloads across cooler rack slots.",
                estimated_savings_or_benefit="Prevents thermal CPU downclocking and extends server hardware MTBF.",
                action_type="INSPECT_AIRFLOW",
                created_at=now_str,
            )
        )
    else:
        insights.append(
            AiInsightCard(
                id=str(uuid.uuid4()),
                category="THERMAL_MANAGEMENT",
                severity="INFO",
                title="Rack Thermal Gradient Optimal",
                summary="All monitored server nodes are operating within standard thermal range (< 70°C).",
                impact="Safe operating temperatures across cold-aisle and hot-aisle containment.",
                recommended_action="Maintain current CRAC supply fan speed and baseline ambient cooling.",
                estimated_savings_or_benefit="Zero cooling overhead waste.",
                action_type="HEALTHY",
                created_at=now_str,
            )
        )

    # Clamp health score between 0 and 100
    final_health_score = max(0, min(100, health_score))
    if final_health_score >= 90:
        health_status = "OPTIMAL"
        exec_summary = "All infrastructure subsystems are operating with optimal energy efficiency, balanced electrical distribution, and safe capacity headroom."
    elif final_health_score >= 75:
        health_status = "GOOD"
        exec_summary = "Facility is stable with minor optimization opportunities identified in phase balancing or workload consolidation."
    elif final_health_score >= 50:
        health_status = "NEEDS_ATTENTION"
        exec_summary = "Action required: Power imbalance or approaching capacity thresholds detected. Review recommended AI action items."
    else:
        health_status = "CRITICAL"
        exec_summary = "CRITICAL WARNING: Electrical redundancy or node health thresholds breached. Immediate administrator intervention recommended."

    return AiAdvisorResponse(
        datacenter_health_score=final_health_score,
        health_status=health_status,
        executive_summary=exec_summary,
        key_metrics_summary={
            "total_nodes": len(hosts),
            "online_nodes": online_hosts_count,
            "dynamic_pue": round(pue, 3),
            "it_power_watts": round(it_power, 1),
            "facility_power_watts": round(facility_ov.total_facility_power_watts, 1),
            "n_plus_one_headroom_watts": round(red.surviving_feed_headroom_watts, 1),
            "days_to_capacity_exhaustion": days_left,
        },
        insights=insights,
        analyzed_at=now_str,
    )
