"""
Tests for Facility DCIM, PUE, Capacity, and Power Log APIs
==========================================================
"""


def test_facility_overview_empty(client):
    """Facility overview should return valid default PUE and redundancy status."""
    response = client.get("/api/v1/facility/overview")
    assert response.status_code == 200
    data = response.json()
    assert "current_pue" in data
    assert "total_facility_power_watts" in data
    assert "redundancy" in data


def test_capacity_forecast(client):
    """Capacity forecast should return linear regression slope and headroom."""
    response = client.get("/api/v1/facility/forecast")
    assert response.status_code == 200
    data = response.json()
    assert "current_utilization_percent" in data
    assert "historical_trend" in data
    assert "peak_node_drop" in data


def test_multi_rack_topology(client):
    """Multi-rack topology should return 3 default racks (Rack-01, Rack-02, Rack-03)."""
    response = client.get("/api/v1/facility/racks")
    assert response.status_code == 200
    racks = response.json()
    assert len(racks) == 3
    assert {r["rack_id"] for r in racks} == {"Rack-01", "Rack-02", "Rack-03"}


def test_power_logs_crud(client):
    """Test full CRUD lifecycle for monthly facility power audit logs."""
    # Create power log
    payload = {
        "log_month": "2026-05",
        "total_facility_kwh": 4000.0,
        "it_equipment_kwh": 3200.0,
        "cooling_kwh": 600.0,
        "notes": "Q2 BOI Audit Test",
    }
    create_res = client.post("/api/v1/facility/power-logs", json=payload)
    assert create_res.status_code == 201
    log = create_res.json()
    assert log["log_month"] == "2026-05"
    assert log["calculated_pue"] == round(4000.0 / 3200.0, 3)
    log_id = log["id"]

    # List logs
    list_res = client.get("/api/v1/facility/power-logs")
    assert list_res.status_code == 200
    logs = list_res.json()
    assert any(l["id"] == log_id for l in logs)

    # Delete log
    del_res = client.delete(f"/api/v1/facility/power-logs/{log_id}")
    assert del_res.status_code == 204
