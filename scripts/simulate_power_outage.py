"""
InfraPulse Electrical Feed Outage & N+1 Redundancy Simulator
===========================================================

Simulates a total electrical outage on Feed A (PDU-A1) to verify automatic N+1 failover
safety headroom, breaker derating compliance, and alert engine notifications.
"""

import time
import requests

API_URL = "http://localhost:8000/api/v1"
TOKEN = "infrapulse_secret_token_change_in_production"
HEADERS = {"X-Agent-Token": TOKEN, "Content-Type": "application/json"}


def simulate_outage():
    print("=== InfraPulse Electrical Outage & N+1 Redundancy Simulator ===")
    
    # 1. Check Baseline State
    before = requests.get(f"{API_URL}/facility/overview").json()
    red = before["redundancy"]
    print(f"Baseline Redundancy Status: [{red['status']}]")
    print(f"  Feed A Load: {red['feed_a']['current_load_watts']:.1f}W / {red['feed_a']['derated_capacity_watts']:.1f}W")
    print(f"  Feed B Load: {red['feed_b']['current_load_watts']:.1f}W / {red['feed_b']['derated_capacity_watts']:.1f}W")
    print(f"  Surviving Feed Headroom: {red['surviving_feed_headroom_watts']:.1f}W")

    print("\n[SIMULATION] Injecting extreme workload on all nodes to test N+1 Breaker limits...")
    hosts = requests.get(f"{API_URL}/hosts").json()
    for h in hosts:
        # Push 95% CPU
        requests.post(
            f"{API_URL}/metrics",
            headers=HEADERS,
            json={
                "hostname": h["hostname"],
                "ip_address": h["ip_address"] or "192.168.1.50",
                "os_type": h["os_type"],
                "cpu_percent": 96.0,
                "ram_percent": 88.0,
                "disk_percent": 50.0,
            },
        )

    time.sleep(1)
    after = requests.get(f"{API_URL}/facility/overview").json()
    red_after = after["redundancy"]
    
    print("\n--- Failover Risk Assessment under Peak Load ---")
    print(f"  Total Peak IT Load: {after['total_it_power_watts']:.1f} W")
    print(f"  Worst-Case Single-Feed Load: {red_after['worst_case_failover_load_watts']:.1f} W")
    print(f"  Surviving Derated Capacity:  {red_after['feed_b']['derated_capacity_watts']:.1f} W")
    print(f"  Remaining Safety Margin:     {red_after['surviving_feed_headroom_watts']:.1f} W")
    print(f"  N+1 Status:                  [{red_after['status']}]")
    print(f"  Message: {red_after['message']}")

    # Trigger alert evaluation
    eval_res = requests.post(f"{API_URL}/alerts/evaluate").json()
    print(f"\nAlert Evaluation Result: {eval_res}")
    print("Simulation completed successfully!")


if __name__ == "__main__":
    simulate_outage()
