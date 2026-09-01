"""
InfraPulse Dynamic PUE & Power Stress Test Demonstration
========================================================

Demonstrates DCIM physics: As IT load scales up, fixed baseline overhead is diluted,
causing Dynamic PUE to improve from ~1.65 down toward the BOI target of 1.30.
"""

import os
import sys
import time
import requests

API_URL = os.getenv("API_URL", "http://localhost:8000/api/v1")
TOKEN = os.getenv("AGENT_SECRET_TOKEN", "infrapulse_secret_token_change_in_production")
HEADERS = {"X-Agent-Token": TOKEN, "Content-Type": "application/json"}

STAGES = [
    {"name": "Idle Baseline", "cpu_mult": 0.10, "desc": "10% CPU (Low server load, high relative fixed overhead)"},
    {"name": "Medium Workload", "cpu_mult": 0.50, "desc": "50% CPU (Standard business hours application compute)"},
    {"name": "Peak Compute Load", "cpu_mult": 0.92, "desc": "92% CPU (High-intensity AI inference & data batch processing)"},
]


def run_power_stress():
    print("=== InfraPulse Dynamic PUE Stress Test Simulation ===")
    print("Demonstrating fixed overhead dilution and dynamic PUE curve...\n")

    results = []

    for stage in STAGES:
        print(f"--- Stage: {stage['name']} ({stage['desc']}) ---")
        
        # Query existing hosts
        hosts = requests.get(f"{API_URL}/hosts").json()
        
        for h in hosts:
            target_cpu = min(98.0, max(5.0, 100.0 * stage["cpu_mult"]))
            metric_payload = {
                "hostname": h["hostname"],
                "ip_address": h["ip_address"] or "192.168.1.50",
                "os_type": h["os_type"],
                "cpu_percent": round(target_cpu, 1),
                "ram_percent": min(95.0, 30.0 + (stage["cpu_mult"] * 50.0)),
                "disk_percent": 45.0,
                "net_sent_bytes_per_sec": 5000000.0 * stage["cpu_mult"],
                "net_recv_bytes_per_sec": 10000000.0 * stage["cpu_mult"],
                "uptime_seconds": 900000,
            }
            requests.post(f"{API_URL}/metrics", headers=HEADERS, json=metric_payload)

        # Allow backend power calculation to aggregate
        time.sleep(1)
        ov = requests.get(f"{API_URL}/facility/overview").json()
        
        results.append({
            "stage": stage["name"],
            "it_power": ov["total_it_power_watts"],
            "facility_power": ov["total_facility_power_watts"],
            "pue": ov["current_pue"],
            "pue_status": ov["pue_status"],
            "utilization": ov["power_capacity_utilization_percent"],
        })
        print(f"  -> IT Power: {ov['total_it_power_watts']:.1f}W | Facility Power: {ov['total_facility_power_watts']:.1f}W | PUE: {ov['current_pue']:.3f} [{ov['pue_status']}]")
        print()

    print("=== SUMMARY: DYNAMIC PUE COMPARISON TABLE ===")
    print(f"{'Workload Stage':<20} | {'IT Power (W)':<14} | {'Facility (W)':<14} | {'PUE Index':<10} | {'Efficiency Status'}")
    print("-" * 75)
    for r in results:
        print(f"{r['stage']:<20} | {r['it_power']:<14.1f} | {r['facility_power']:<14.1f} | {r['pue']:<10.3f} | {r['pue_status']}")
    print("-" * 75)
    print("Notice: As IT power increases, PUE approaches 1.18 (ideal efficiency) because fixed 35W overhead is diluted!")


if __name__ == "__main__":
    run_power_stress()
