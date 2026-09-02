"""
InfraPulse Phase 2 Verification & Stress Test Suite
===================================================

Automated tests for:
1. Authentication Token Validation (Missing, Wrong, Valid -> 401 vs 201)
2. SQLite Ring Buffer FIFO Eviction & Capacity Pruning
3. Multi-Record Offline Ingestion & Batch Flush to Backend
4. Continuous CPU sampling fluctuation under synthetic load
"""

import os
import gc
import sys
import time
import requests
from agent.buffer import SQLiteBuffer
from agent.collector import SystemMetricSource

BACKEND_URL = "http://localhost:8000/api/v1/metrics"
BATCH_URL = "http://localhost:8000/api/v1/metrics/batch"
VALID_TOKEN = "infrapulse_secret_token_change_in_production"
INVALID_TOKEN = "wrong_fake_unauthorized_token_123"


def test_token_validation():
    print("\n--- 1. Testing Token Validation & Security Guard ---")
    
    sample_payload = {
        "hostname": "security-test-node",
        "os_type": "linux",
        "cpu_percent": 25.0,
        "ram_percent": 50.0,
        "disk_percent": 40.0,
    }

    # Test A: Missing Token -> Must return 401
    resp_missing = requests.post(BACKEND_URL, json=sample_payload)
    print(f"[TEST] Missing Header -> HTTP {resp_missing.status_code} (Expected: 401)")
    assert resp_missing.status_code == 401, f"Expected 401, got {resp_missing.status_code}"

    # Test B: Invalid/Wrong Token -> Must return 401
    resp_wrong = requests.post(
        BACKEND_URL,
        headers={"X-Agent-Token": INVALID_TOKEN},
        json=sample_payload,
    )
    print(f"[TEST] Wrong Token -> HTTP {resp_wrong.status_code} (Expected: 401)")
    assert resp_wrong.status_code == 401, f"Expected 401, got {resp_wrong.status_code}"

    # Test C: Valid Token -> Must return 201
    resp_valid = requests.post(
        BACKEND_URL,
        headers={"X-Agent-Token": VALID_TOKEN},
        json=sample_payload,
    )
    print(f"[TEST] Valid Token -> HTTP {resp_valid.status_code} (Expected: 201)")
    assert resp_valid.status_code == 201, f"Expected 201, got {resp_valid.status_code}"

    # Test D: Batch Endpoint Missing Token -> Must return 401
    resp_batch_missing = requests.post(BATCH_URL, json=[sample_payload])
    print(f"[TEST] Batch Missing Header -> HTTP {resp_batch_missing.status_code} (Expected: 401)")
    assert resp_batch_missing.status_code == 401, f"Expected 401, got {resp_batch_missing.status_code}"

    print(">>> Token Validation Tests: ALL PASSED (100% Security Guard Verified)\n")


def test_buffer_stress_and_eviction():
    print("--- 2. Testing SQLite Ring Buffer Cap & FIFO Eviction ---")
    
    test_db = "test_stress_buffer.db"
    if os.path.exists(test_db):
        try:
            os.remove(test_db)
        except Exception:
            pass

    # Set small cap of 5 records
    cap = 5
    buf = SQLiteBuffer(db_path=test_db, max_records=cap)

    # Push 15 records with sequential index
    for i in range(15):
        buf.push({"index": i, "hostname": "stress-node", "cpu_percent": float(i)})

    total_count = buf.count()
    print(f"[TEST] Pushed 15 records with max_records={cap}. Current count in DB: {total_count} (Expected: {cap})")
    assert total_count == cap, f"Expected buffer count {cap}, got {total_count}"

    # Peek all records in buffer: oldest 10 should have been evicted, remaining should be indices 10..14
    peeked = buf.peek(limit=10)
    indices = [item[1]["index"] for item in peeked]
    print(f"[TEST] Remaining record indices: {indices} (Expected: [10, 11, 12, 13, 14])")
    assert indices == [10, 11, 12, 13, 14], f"FIFO order mismatch: {indices}"

    del buf
    gc.collect()

    print(">>> Buffer FIFO & Eviction Tests: ALL PASSED\n")


def test_batch_flush_to_backend():
    print("--- 3. Testing 30-Record Offline Batch Ingestion & Flush ---")
    
    collector = SystemMetricSource()
    batch_records = []
    
    # Generate 30 timestamped snapshots
    for i in range(30):
        data = collector.collect()
        data["hostname"] = "offline-flush-host"
        data["cpu_percent"] = 10.0 + (i % 20)
        batch_records.append(data)

    # Ingest batch
    resp = requests.post(
        BATCH_URL,
        headers={"X-Agent-Token": VALID_TOKEN},
        json=batch_records,
    )
    print(f"[TEST] Batch POST /batch HTTP status: {resp.status_code} (Expected: 201)")
    assert resp.status_code == 201, f"Expected 201, got {resp.status_code}"
    print(f"[TEST] Backend response: {resp.json()}")
    assert resp.json().get("ingested_count") == 30

    # Query metrics for host to verify all 30 records saved
    get_resp = requests.get("http://localhost:8000/api/v1/metrics?host=offline-flush-host&limit=50")
    assert get_resp.status_code == 200
    saved_records = get_resp.json()
    print(f"[TEST] Queried metrics for 'offline-flush-host': {len(saved_records)} records found.")
    assert len(saved_records) >= 30

    print(">>> Batch Flush Ingestion Tests: ALL PASSED\n")


def test_dynamic_cpu_sampling():
    print("--- 4. Testing Multi-Tick Continuous CPU Sampling ---")
    collector = SystemMetricSource()
    
    readings = []
    for tick in range(3):
        # Generate some CPU work
        _ = sum(x * x for x in range(2_000_000))
        sample = collector.collect()
        readings.append(sample["cpu_percent"])
        time.sleep(0.3)

    print(f"[TEST] 3-sample CPU readings under active load: {readings}")
    assert any(r > 0.0 for r in readings), "Expected non-zero CPU utilization under load"
    print(">>> Dynamic CPU Sampling Tests: ALL PASSED\n")


if __name__ == "__main__":
    try:
        test_token_validation()
        test_buffer_stress_and_eviction()
        test_batch_flush_to_backend()
        test_dynamic_cpu_sampling()
        print("==================================================")
        print("ALL 4 PHASE 2 CHECKS PASSED WITH 100% VERIFICATION")
        print("==================================================")
    except Exception as e:
        print(f"[FAILURE] Test failed: {e}")
        sys.exit(1)
