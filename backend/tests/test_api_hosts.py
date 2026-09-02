"""
Tests for Host Inventory & Power Configuration APIs
==================================================
"""

from app.models.host import Host
from app.models.power import PowerConfig


def test_list_hosts_empty(client):
    """List hosts should return empty list initially."""
    response = client.get("/api/v1/hosts")
    assert response.status_code == 200
    assert response.json() == []


def test_get_host_not_found(client):
    """Requesting non-existent host should return 404."""
    response = client.get("/api/v1/hosts/non-existent-node")
    assert response.status_code == 404


def test_host_lifecycle(client, db_session):
    """Test full host creation, retrieval, power update, and deletion lifecycle."""
    # Seed host
    host = Host(
        id="node-alpha",
        hostname="node-alpha",
        ip_address="192.168.1.50",
        os_type="linux",
        os_version="Ubuntu 22.04",
        cpu_count=8,
        status="online",
        is_test=False,
    )
    db_session.add(host)
    db_session.commit()

    # Get host
    res = client.get("/api/v1/hosts/node-alpha")
    assert res.status_code == 200
    data = res.json()
    assert data["hostname"] == "node-alpha"
    assert data["ip_address"] == "192.168.1.50"

    # Update power config
    power_payload = {
        "idle_watts": 45.0,
        "rated_watts": 250.0,
        "rack_name": "Rack-01",
        "rack_unit_start": 4,
        "rack_unit_height": 2,
    }
    p_res = client.put("/api/v1/hosts/node-alpha/power", json=power_payload)
    assert p_res.status_code == 200
    p_data = p_res.json()
    assert p_data["idle_watts"] == 45.0
    assert p_data["rated_watts"] == 250.0

    # Delete host
    del_res = client.delete("/api/v1/hosts/node-alpha")
    assert del_res.status_code == 204

    # Verify deleted
    get_after = client.get("/api/v1/hosts/node-alpha")
    assert get_after.status_code == 404
