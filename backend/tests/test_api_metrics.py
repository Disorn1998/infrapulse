"""
Tests for Metrics Ingestion & Telemetry Query APIs
=================================================
"""


def test_ingest_metric_unauthorized(client):
    """Ingestion without valid token should return 401 Unauthorized."""
    payload = {
        "hostname": "prod-server-01",
        "cpu_percent": 45.2,
        "ram_percent": 60.1,
        "disk_percent": 75.0,
        "os_type": "ubuntu",
    }
    response = client.post("/api/v1/metrics", json=payload)
    assert response.status_code == 401


def test_ingest_metric_authorized(client, auth_headers):
    """Ingestion with valid token should succeed and calculate power."""
    payload = {
        "hostname": "prod-server-01",
        "ip_address": "10.0.0.15",
        "os_type": "ubuntu",
        "os_version": "Ubuntu 24.04",
        "cpu_count": 16,
        "cpu_percent": 50.0,
        "cpu_temperature_celsius": 48.5,
        "ram_percent": 65.0,
        "disk_percent": 40.0,
        "net_sent_bytes_per_sec": 102400.0,
        "net_recv_bytes_per_sec": 204800.0,
        "uptime_seconds": 36000,
    }
    response = client.post("/api/v1/metrics", json=payload, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["host_id"] == "prod-server-01"
    assert data["cpu_percent"] == 50.0
    assert data["calculated_power_watts"] > 0
    assert data["cpu_temperature_celsius"] == 48.5


def test_query_host_metrics(client, auth_headers):
    """Querying metrics by host should return time-series telemetry array."""
    payload = {
        "hostname": "db-server-01",
        "os_type": "linux",
        "cpu_percent": 30.0,
        "ram_percent": 55.0,
        "disk_percent": 25.0,
    }
    client.post("/api/v1/metrics", json=payload, headers=auth_headers)

    res = client.get("/api/v1/metrics?host=db-server-01&range=1h")
    assert res.status_code == 200
    metrics = res.json()
    assert isinstance(metrics, list)
    assert len(metrics) >= 1
