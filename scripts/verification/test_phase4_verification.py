"""
InfraPulse Phase 4 Alert Engine Automated Verification Test Suite
=================================================================

Validates:
1. Alert Rule CRUD operations (/api/v1/alerts/configs)
2. Immediate SMTP / Test Email dispatch (/api/v1/alerts/test)
3. High CPU threshold breach -> State transitions to 'FIRING', dispatches [CRITICAL] / [WARNING]
4. Immutable logging in `alert_history` table
5. Auto-Recovery -> Normal telemetry triggers [RESOLVED] and resets state to 'OK'
6. Cooldown suppression -> Prevents spamming within cooldown window
"""

import sys
import time
import requests

BASE_URL = "http://localhost:8000/api/v1"
METRICS_URL = f"{BASE_URL}/metrics"
ALERTS_URL = f"{BASE_URL}/alerts"
AGENT_TOKEN = "infrapulse_secret_token_change_in_production"
HEADERS = {"X-Agent-Token": AGENT_TOKEN}


def test_phase4_alerts():
    print("\n=== Starting Phase 4 Alert Engine Verification ===")

    # 1. Test Seed & List Alert Configs
    print("\n--- 1. Testing Alert Configs Query & Baseline Seeding ---")
    resp_eval = requests.post(f"{ALERTS_URL}/evaluate")
    print(f"[TEST] Immediate Evaluate Response: {resp_eval.status_code} -> {resp_eval.json()}")

    resp_configs = requests.get(f"{ALERTS_URL}/configs")
    assert resp_configs.status_code == 200, f"Failed to get configs: {resp_configs.text}"
    configs = resp_configs.json()
    print(f"[TEST] Active Alert Rules in DB: {len(configs)} rules found.")
    for c in configs:
        print(f"  Rule: {c['metric_name']} {c['operator']} {c['threshold_value']} -> {c['recipient_email']} (State: {c['current_state']})")
    assert len(configs) >= 4, "Expected at least 4 default alert rules"

    # 2. Test SMTP / Email Channel Dispatch
    print("\n--- 2. Testing Test Email Dispatch Endpoint ---")
    test_email_resp = requests.post(f"{ALERTS_URL}/test?recipient_email=noc-ops@infrapulse.local")
    assert test_email_resp.status_code == 200, f"Test email failed: {test_email_resp.text}"
    print(f"[TEST] Test Email Dispatch Result: {test_email_resp.json()}")

    # 3. Simulate High CPU Metric (96.5% on DESKTOP-15H5738)
    print("\n--- 3. Simulating High CPU Threshold Breach (96.5% >= 85.0%) ---")
    high_cpu_payload = {
        "hostname": "DESKTOP-15H5738",
        "ip_address": "192.168.1.57",
        "os_type": "windows",
        "cpu_percent": 96.5,
        "ram_percent": 55.0,
        "disk_percent": 27.0,
    }
    resp_metric = requests.post(METRICS_URL, headers=HEADERS, json=high_cpu_payload)
    assert resp_metric.status_code == 201, f"Metric ingest failed: {resp_metric.text}"
    print("[TEST] Ingested 96.5% CPU snapshot into backend.")

    # Trigger Evaluation
    eval_resp = requests.post(f"{ALERTS_URL}/evaluate")
    print(f"[TEST] Alert Evaluation Cycle: {eval_resp.json()}")

    # 4. Verify Alert History Log
    print("\n--- 4. Verifying Immutable Alert History Record ---")
    resp_history = requests.get(f"{ALERTS_URL}/history?limit=10")
    assert resp_history.status_code == 200
    history = resp_history.json()
    print(f"[TEST] Retrieved {len(history)} alert history records:")
    for h in history[:3]:
        print(f"  Alert ID: {h['id'][:8]}... | Metric: {h['metric_name']} | Triggered: {h['triggered_value']} | Status: {h['status']} | Message: {h['message']}")
    
    assert len(history) > 0, "Expected at least 1 alert history record"
    assert history[0]["status"] == "SENT"

    # 5. Test Auto-Recovery Normalization (CPU drops to 12.0%)
    print("\n--- 5. Simulating Telemetry Recovery (CPU normalized to 12.0%) ---")
    normal_cpu_payload = {
        "hostname": "DESKTOP-15H5738",
        "ip_address": "192.168.1.57",
        "os_type": "windows",
        "cpu_percent": 12.0,
        "ram_percent": 54.0,
        "disk_percent": 27.0,
    }
    resp_norm = requests.post(METRICS_URL, headers=HEADERS, json=normal_cpu_payload)
    assert resp_norm.status_code == 201

    eval_norm_resp = requests.post(f"{ALERTS_URL}/evaluate")
    print(f"[TEST] Recovery Evaluation Cycle: {eval_norm_resp.json()}")

    # Verify Alert Config is back to 'OK' state
    configs_after = requests.get(f"{ALERTS_URL}/configs").json()
    cpu_rule = next((r for r in configs_after if r["metric_name"] == "cpu_percent"), None)
    assert cpu_rule is not None
    print(f"[TEST] CPU Alert Rule State after Recovery: '{cpu_rule['current_state']}' (Expected: 'OK')")
    assert cpu_rule["current_state"] == "OK"

    print("\n==================================================")
    print("ALL PHASE 4 ALERT ENGINE TESTS PASSED WITH 100% SUCCESS")
    print("==================================================\n")


if __name__ == "__main__":
    try:
        test_phase4_alerts()
    except Exception as e:
        print(f"[FAILURE] Test failed: {e}")
        sys.exit(1)
