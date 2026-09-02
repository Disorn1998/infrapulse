"""
InfraPulse Backend Unit Test Suite
==================================

Unit tests for DCIM power modeling, alert conditions, and host telemetry logic.
Run with: pytest backend/tests/
"""

from app.services.power_service import calculate_node_power_watts
from app.services.alert_service import evaluate_condition
from app.api.v1.endpoints.hosts import OFFLINE_THRESHOLD_SECONDS


def test_calculate_node_power_watts_idle():
    """At 0% CPU, power draw should equal idle watts."""
    power = calculate_node_power_watts(idle_watts=50.0, rated_watts=200.0, cpu_percent=0.0)
    assert power == 50.0


def test_calculate_node_power_watts_full_load():
    """At 100% CPU, power draw should equal rated watts."""
    power = calculate_node_power_watts(idle_watts=50.0, rated_watts=200.0, cpu_percent=100.0)
    assert power == 200.0


def test_calculate_node_power_watts_half_load():
    """At 50% CPU, power draw should be midpoint between idle and rated."""
    power = calculate_node_power_watts(idle_watts=50.0, rated_watts=200.0, cpu_percent=50.0)
    assert power == 125.0


def test_calculate_node_power_watts_clamping():
    """Values below 0% or above 100% CPU should be clamped safely."""
    p_under = calculate_node_power_watts(idle_watts=50.0, rated_watts=200.0, cpu_percent=-10.0)
    assert p_under == 50.0
    p_over = calculate_node_power_watts(idle_watts=50.0, rated_watts=200.0, cpu_percent=150.0)
    assert p_over == 200.0


def test_evaluate_condition_operators():
    """Test mathematical threshold evaluation operators."""
    assert evaluate_condition(85.0, ">=", 85.0) is True
    assert evaluate_condition(84.9, ">=", 85.0) is False
    assert evaluate_condition(90.0, ">", 85.0) is True
    assert evaluate_condition(85.0, ">", 85.0) is False
    assert evaluate_condition(40.0, "<=", 50.0) is True
    assert evaluate_condition(50.0, "<=", 50.0) is True
    assert evaluate_condition(50.1, "<=", 50.0) is False
    assert evaluate_condition(30.0, "<", 50.0) is True
    assert evaluate_condition(1.0, "==", 1.0) is True
    assert evaluate_condition(0.0, "==", 1.0) is False


def test_offline_threshold():
    """Offline threshold should be at least 60 seconds to prevent jitter."""
    assert OFFLINE_THRESHOLD_SECONDS >= 60
