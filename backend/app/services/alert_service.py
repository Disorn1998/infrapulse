"""
InfraPulse Automated Threshold Alerting & Hysteresis Engine
===========================================================

Evaluates real-time telemetry metrics and facility redundancy status against
configured thresholds, managing state transitions (OK -> FIRING -> RESOLVED),
cooldown windows, and immutable alert history auditing.
"""

import logging
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.host import Host
from app.models.metric import Metric
from app.models.alert import AlertConfig, AlertHistory
from app.services.power_service import get_facility_overview
from app.services.email_service import send_email_alert

logger = logging.getLogger("infrapulse.alerts")


def seed_default_alert_configs(db: Session) -> None:
    """Ensures all standard baseline alert threshold rules are present."""
    recipient = settings.DEFAULT_ALERT_RECIPIENT
    default_rules = [
        {"metric_name": "cpu_percent", "operator": ">=", "threshold_value": 85.0, "cooldown_minutes": 30},
        {"metric_name": "ram_percent", "operator": ">=", "threshold_value": 90.0, "cooldown_minutes": 30},
        {"metric_name": "disk_percent", "operator": ">=", "threshold_value": 85.0, "cooldown_minutes": 60},
        {"metric_name": "host_offline", "operator": "==", "threshold_value": 1.0, "cooldown_minutes": 30},
    ]

    added = False
    for r in default_rules:
        existing = db.query(AlertConfig).filter(AlertConfig.metric_name == r["metric_name"]).first()
        if not existing:
            new_rule = AlertConfig(
                metric_name=r["metric_name"],
                operator=r["operator"],
                threshold_value=r["threshold_value"],
                recipient_email=recipient,
                cooldown_minutes=r["cooldown_minutes"],
                is_active=True,
                current_state="OK",
            )
            db.add(new_rule)
            added = True

    if added:
        db.commit()
        logger.info("Updated baseline alert threshold rules.")


def evaluate_condition(current_val: float, operator: str, threshold: float) -> bool:
    """Evaluates mathematical condition against threshold."""
    if operator == ">=":
        return current_val >= threshold
    elif operator == ">":
        return current_val > threshold
    elif operator == "<=":
        return current_val <= threshold
    elif operator == "<":
        return current_val < threshold
    elif operator == "==":
        return abs(current_val - threshold) < 0.001
    return False


def evaluate_metric_alerts(db: Session) -> List[AlertHistory]:
    """
    Evaluates metric threshold rules for all non-test hosts.
    Handles hysteresis debouncing, cooldown timing, and auto-recovery.
    """
    triggered_events: List[AlertHistory] = []
    now = datetime.now(timezone.utc)
    
    # 1. Fetch active alert rules and active real hosts
    rules = db.query(AlertConfig).filter(AlertConfig.is_active == True).all()
    hosts = db.query(Host).filter(Host.is_test == False).all()

    for host in hosts:
        # Check host online status
        is_online = True
        if host.last_seen:
            last_seen_aware = host.last_seen if host.last_seen.tzinfo else host.last_seen.replace(tzinfo=timezone.utc)
            is_online = (now - last_seen_aware).total_seconds() <= 90
        else:
            is_online = False

        latest_metric = (
            db.query(Metric)
            .filter(Metric.host_id == host.id)
            .order_by(Metric.timestamp.desc())
            .first()
        )

        for rule in rules:
            # Match target host if specified, or global rule if host_id is None
            if rule.host_id and rule.host_id != host.id:
                continue

            current_val: Optional[float] = None
            is_breached = False

            # Check rule type
            if rule.metric_name == "host_offline":
                current_val = 1.0 if not is_online else 0.0
                is_breached = not is_online
            elif latest_metric:
                if rule.metric_name == "cpu_percent":
                    current_val = latest_metric.cpu_percent
                elif rule.metric_name == "ram_percent":
                    current_val = latest_metric.ram_percent
                elif rule.metric_name == "disk_percent":
                    current_val = latest_metric.disk_percent

                if current_val is not None:
                    is_breached = evaluate_condition(current_val, rule.operator, rule.threshold_value)

            # --- State Machine & Alert Firing Logic ---
            if is_breached:
                rule.consecutive_breaches += 1
                
                # Check cooldown: has it been at least cooldown_minutes since last email?
                can_notify = True
                if rule.last_notified_at:
                    last_notif_aware = rule.last_notified_at if rule.last_notified_at.tzinfo else rule.last_notified_at.replace(tzinfo=timezone.utc)
                    if (now - last_notif_aware) < timedelta(minutes=rule.cooldown_minutes):
                        can_notify = False

                if can_notify:
                    severity = "CRITICAL" if rule.metric_name == "host_offline" or (current_val and current_val >= 95.0) else "WARNING"
                    subject = f"[{severity}] InfraPulse Alert: {host.hostname} {rule.metric_name} is {current_val}"
                    title = f"Threshold Breach on {host.hostname}"
                    details = f"Host '{host.hostname}' ({host.ip_address or 'N/A'}) triggered rule: {rule.metric_name} {rule.operator} {rule.threshold_value}."

                    send_success = send_email_alert(
                        subject=subject,
                        recipient_email=rule.recipient_email,
                        title=title,
                        severity=severity,
                        target_name=host.hostname,
                        metric_name=rule.metric_name,
                        current_value=current_val,
                        threshold_value=rule.threshold_value,
                        details=details,
                        timestamp_str=now.strftime("%Y-%m-%d %H:%M:%S UTC"),
                    )

                    rule.current_state = "FIRING"
                    rule.state_changed_at = now
                    rule.last_notified_at = now

                    history_entry = AlertHistory(
                        alert_config_id=rule.id,
                        host_id=host.id,
                        metric_name=rule.metric_name,
                        triggered_value=current_val,
                        threshold_value=rule.threshold_value,
                        message=details,
                        status="SENT" if send_success else "FAILED",
                        sent_at=now,
                    )
                    db.add(history_entry)
                    triggered_events.append(history_entry)

            else:
                # Metric returned to normal: check for Auto-Recovery
                if rule.current_state == "FIRING":
                    resolved_subject = f"[RESOLVED] InfraPulse Alert: {host.hostname} {rule.metric_name} returned to normal"
                    resolved_details = f"Telemetry for '{host.hostname}' normalized. {rule.metric_name} is now {current_val} (below threshold {rule.threshold_value})."
                    
                    send_email_alert(
                        subject=resolved_subject,
                        recipient_email=rule.recipient_email,
                        title=f"Alert Resolved: {host.hostname}",
                        severity="RESOLVED",
                        target_name=host.hostname,
                        metric_name=rule.metric_name,
                        current_value=current_val,
                        threshold_value=rule.threshold_value,
                        details=resolved_details,
                        timestamp_str=now.strftime("%Y-%m-%d %H:%M:%S UTC"),
                    )

                    history_entry = AlertHistory(
                        alert_config_id=rule.id,
                        host_id=host.id,
                        metric_name=rule.metric_name,
                        triggered_value=current_val,
                        threshold_value=rule.threshold_value,
                        message=f"RESOLVED: {resolved_details}",
                        status="SENT",
                        sent_at=now,
                    )
                    db.add(history_entry)
                    triggered_events.append(history_entry)

                rule.current_state = "OK"
                rule.consecutive_breaches = 0

    return triggered_events


def evaluate_facility_alerts(db: Session) -> List[AlertHistory]:
    """
    Evaluates critical facility-level N+1 power redundancy state.
    Triggers [CRITICAL] for NON_COMPLIANT and [WARNING] for AT_RISK.
    """
    triggered_events: List[AlertHistory] = []
    now = datetime.now(timezone.utc)

    overview = get_facility_overview(db)
    redundancy = overview.redundancy

    if not redundancy or redundancy.status == "HEALTHY":
        return []

    severity = "CRITICAL" if redundancy.status == "NON_COMPLIANT" else "WARNING"
    subject = f"[{severity}] InfraPulse Facility Alert: N+1 Redundancy {redundancy.status}"
    title = f"Data Center Redundancy Alert ({overview.facility_name})"
    details = redundancy.message

    send_success = send_email_alert(
        subject=subject,
        recipient_email=settings.DEFAULT_ALERT_RECIPIENT,
        title=title,
        severity=severity,
        target_name=overview.facility_name,
        metric_name="n1_redundancy",
        current_value=redundancy.worst_case_failover_load_watts,
        threshold_value=redundancy.surviving_feed_headroom_watts,
        details=details,
        timestamp_str=now.strftime("%Y-%m-%d %H:%M:%S UTC"),
    )

    history_entry = AlertHistory(
        host_id=None,
        metric_name="n1_redundancy",
        triggered_value=redundancy.worst_case_failover_load_watts,
        threshold_value=redundancy.surviving_feed_headroom_watts,
        message=f"{redundancy.status}: {details}",
        status="SENT" if send_success else "FAILED",
        sent_at=now,
    )
    db.add(history_entry)
    triggered_events.append(history_entry)

    return triggered_events


def run_alert_evaluation_cycle(db: Session) -> Dict[str, Any]:
    """Executes a full evaluation cycle of both metric and facility alert rules."""
    seed_default_alert_configs(db)
    metric_alerts = evaluate_metric_alerts(db)
    facility_alerts = evaluate_facility_alerts(db)
    db.commit()

    total_triggered = len(metric_alerts) + len(facility_alerts)
    return {
        "status": "ok",
        "evaluated_at": datetime.now(timezone.utc).isoformat(),
        "total_alerts_dispatched": total_triggered,
        "metric_alerts_count": len(metric_alerts),
        "facility_alerts_count": len(facility_alerts),
    }
