"""
InfraPulse Multi-Node Cluster Simulator (Demo & Portfolio Tool)
==============================================================

Instantly registers a realistic 4-server production datacenter cluster:
1. edge-proxy-01    (Nginx Reverse Proxy / Load Balancer) -> Feed A (PDU-A1) [Rack U1-U2]
2. db-primary-01    (PostgreSQL High-Availability Node)   -> Feed B (PDU-B1) [Rack U3-U4]
3. ai-inference-01  (GPU Worker Node - High Power)        -> Feed A (PDU-A1) [Rack U5-U8]
4. storage-nas-01   (ZFS Storage Vault)                   -> Feed B (PDU-B1) [Rack U9-U12]
"""

import os
import sys
import time
import requests

API_URL = os.getenv("API_URL", "http://localhost:8000/api/v1")
TOKEN = os.getenv("AGENT_SECRET_TOKEN", "infrapulse_secret_token_change_in_production")
HEADERS = {"X-Agent-Token": TOKEN, "Content-Type": "application/json"}

NODES = [
    {
        "hostname": "edge-proxy-01",
        "ip_address": "192.168.1.10",
        "os_type": "ubuntu",
        "os_version": "Ubuntu 24.04 LTS",
        "cpu_count": 4,
        "total_ram_bytes": 16000000000,
        "total_disk_bytes": 256000000000,
        "pdu_id": 1,
        "outlet": "Outlet-03",
        "rack_unit": 1,
        "height": 2,
        "idle_w": 25.0,
        "rated_w": 120.0,
        "cpu": 15.0,
        "ram": 38.0,
        "disk": 22.0,
    },
    {
        "hostname": "db-primary-01",
        "ip_address": "192.168.1.11",
        "os_type": "ubuntu",
        "os_version": "Ubuntu 24.04 LTS",
        "cpu_count": 16,
        "total_ram_bytes": 64000000000,
        "total_disk_bytes": 2000000000000,
        "pdu_id": 2,
        "outlet": "Outlet-03",
        "rack_unit": 3,
        "height": 2,
        "idle_w": 60.0,
        "rated_w": 350.0,
        "cpu": 45.0,
        "ram": 72.0,
        "disk": 58.0,
    },
    {
        "hostname": "ai-inference-01",
        "ip_address": "192.168.1.12",
        "os_type": "ubuntu",
        "os_version": "Ubuntu 24.04 LTS",
        "cpu_count": 32,
        "total_ram_bytes": 128000000000,
        "total_disk_bytes": 4000000000000,
        "pdu_id": 1,
        "outlet": "Outlet-04",
        "rack_unit": 5,
        "height": 4,
        "idle_w": 120.0,
        "rated_w": 850.0,
        "cpu": 68.0,
        "ram": 84.0,
        "disk": 45.0,
    },
    {
        "hostname": "storage-nas-01",
        "ip_address": "192.168.1.13",
        "os_type": "ubuntu",
        "os_version": "Ubuntu 24.04 LTS",
        "cpu_count": 8,
        "total_ram_bytes": 32000000000,
        "total_disk_bytes": 16000000000000,
        "pdu_id": 2,
        "outlet": "Outlet-04",
        "rack_unit": 9,
        "height": 4,
        "idle_w": 80.0,
        "rated_w": 400.0,
        "cpu": 28.0,
        "ram": 60.0,
        "disk": 74.0,
    },
]


def simulate_cluster():
    print("=== InfraPulse Datacenter Cluster Simulation ===")
    print("Injecting 4 enterprise server nodes across Feed A and Feed B...")

    for node in NODES:
        # 1. Ingest telemetry snapshot
        metric_payload = {
            "hostname": node["hostname"],
            "ip_address": node["ip_address"],
            "os_type": node["os_type"],
            "os_version": node["os_version"],
            "cpu_count": node["cpu_count"],
            "total_ram_bytes": node["total_ram_bytes"],
            "total_disk_bytes": node["total_disk_bytes"],
            "cpu_percent": node["cpu"],
            "ram_percent": node["ram"],
            "disk_percent": node["disk"],
            "net_sent_bytes_per_sec": 12500000.0,
            "net_recv_bytes_per_sec": 24800000.0,
            "uptime_seconds": 864000,
        }
        res = requests.post(f"{API_URL}/metrics", headers=HEADERS, json=metric_payload)
        if res.status_code != 201:
            print(f"Failed to ingest for {node['hostname']}: {res.text}")
            continue

        # 2. Configure Power Rating and Rack Layout
        power_payload = {
            "idle_watts": node["idle_w"],
            "rated_watts": node["rated_w"],
            "pdu_id": node["pdu_id"],
            "pdu_outlet": node["outlet"],
            "rack_name": "Rack-01",
            "rack_unit_start": node["rack_unit"],
            "rack_unit_height": node["height"],
        }
        res_p = requests.put(f"{API_URL}/hosts/{node['hostname']}/power", json=power_payload)
        feed_name = "Feed A (PDU-A1)" if node["pdu_id"] == 1 else "Feed B (PDU-B1)"
        print(f"  [OK] {node['hostname']:<16} | {feed_name:<16} | U{node['rack_unit']:02d}-U{node['rack_unit']+node['height']-1:02d} | CPU: {node['cpu']}%")

    # Fetch updated facility overview
    ov = requests.get(f"{API_URL}/facility/overview").json()
    print("\n--- Live Facility Overview After Cluster Provisioning ---")
    print(f"  Total IT Power:       {ov['total_it_power_watts']:.1f} W")
    print(f"  Total Facility Power: {ov['total_facility_power_watts']:.1f} W")
    print(f"  Current Dynamic PUE:  {ov['current_pue']:.3f} (Status: {ov['pue_status']})")
    print(f"  Feed A Load:          {ov['redundancy']['feed_a']['current_load_watts']:.1f} W")
    print(f"  Feed B Load:          {ov['redundancy']['feed_b']['current_load_watts']:.1f} W")
    print(f"  N+1 Status:           {ov['redundancy']['status']}")
    print("\nSimulation complete! Check your dashboard at http://localhost:3000")


if __name__ == "__main__":
    simulate_cluster()
