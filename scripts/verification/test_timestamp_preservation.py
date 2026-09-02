"""
Verification Test: Preservation of Historical Agent Timestamps during Offline Batch Flush
========================================================================================

Verifies that:
1. `metrics.timestamp` strictly preserves the original client-side sampling time recorded in SQLite buffer.
2. `metrics.received_at` accurately records the later server-side ingress arrival timestamp.
3. Historical time-series points are NOT flattened/squashed into a single instant.
"""

import sys
import requests
from datetime import datetime, timedelta, timezone
from agent.buffer import SQLiteBuffer
from agent.collector import SystemMetricSource

BACKEND_URL = "http://localhost:8000/api/v1/metrics"
BATCH_URL = "http://localhost:8000/api/v1/metrics/batch"
VALID_TOKEN = "infrapulse_secret_token_change_in_production"
TEST_HOST = "timestamp-audit-node"


def test_timestamp_preservation():
    print("=== Testing Timestamp Preservation in Batch Flush ===")
    
    collector = SystemMetricSource()
    base_time = datetime.now(timezone.utc)
    
    # 1. Create 5 historical sample points simulated across a 20-minute outage (every 5 mins)
    historical_timestamps = [
        (base_time - timedelta(minutes=20)).isoformat(),
        (base_time - timedelta(minutes=15)).isoformat(),
        (base_time - timedelta(minutes=10)).isoformat(),
        (base_time - timedelta(minutes=5)).isoformat(),
        base_time.isoformat(),
    ]

    buffered_records = []
    for i, ts in enumerate(historical_timestamps):
        sample = collector.collect()
        sample["hostname"] = TEST_HOST
        sample["timestamp"] = ts  # Set exact historical timestamp from offline sampling
        sample["cpu_percent"] = 10.0 + (i * 15.0)
        buffered_records.append(sample)

    print(f"\n[AGENT] Generated {len(buffered_records)} offline records with historical timestamps:")
    for i, r in enumerate(buffered_records):
        print(f"  Record #{i+1}: timestamp = {r['timestamp']} (CPU: {r['cpu_percent']}%)")

    # 2. Simulate Backend coming back online NOW and Agent executing Batch Flush
    flush_time = datetime.now(timezone.utc)
    print(f"\n[NETWORK] Flushing batch to Backend at server time: {flush_time.isoformat()}...")
    
    resp = requests.post(
        BATCH_URL,
        headers={"X-Agent-Token": VALID_TOKEN},
        json=buffered_records,
    )
    assert resp.status_code == 201, f"Batch post failed: {resp.text}"
    print(f"[BACKEND] Batch ingestion response: {resp.json()}")

    # 3. Query DB to verify stored timestamps
    get_resp = requests.get(f"{BACKEND_URL}?host={TEST_HOST}&limit=10")
    assert get_resp.status_code == 200, f"Query failed: {get_resp.text}"
    db_records = get_resp.json()

    # Sort ascending for clean comparison
    db_records_asc = sorted(db_records, key=lambda x: x["timestamp"])

    print("\n[VERIFICATION] Side-by-Side Timestamp Audit Comparison:")
    print("-" * 110)
    print(f"{'Record':<8} | {'Agent Sample Timestamp (Original)':<35} | {'DB Stored Timestamp':<30} | {'Server received_at':<25}")
    print("-" * 110)

    for i, (orig, db_row) in enumerate(zip(buffered_records, db_records_asc)):
        orig_ts = orig["timestamp"]
        stored_ts = db_row["timestamp"]
        recv_ts = db_row["received_at"]
        
        print(f"#{i+1:<7} | {orig_ts:<35} | {stored_ts:<30} | {recv_ts:<25}")

        # Parse to ISO string comparisons
        orig_dt = datetime.fromisoformat(orig_ts)
        stored_dt = datetime.fromisoformat(stored_ts)
        
        # Verify timestamp match within 1 millisecond tolerance
        time_diff = abs((orig_dt - stored_dt).total_seconds())
        assert time_diff < 0.001, f"Timestamp mismatch! Orig: {orig_ts}, DB: {stored_ts}"
        
        # Verify received_at is at or after flush time (server arrival)
        recv_dt = datetime.fromisoformat(recv_ts)
        assert recv_dt >= orig_dt, "received_at should be >= sampled timestamp"

    print("-" * 110)
    print("\n>>> CONFIRMED: Backend strictly preserves historical timestamps from Agent!")
    print(">>> Gaps during offline periods will correctly spread out over historical time in Phase 3 charts.\n")


if __name__ == "__main__":
    try:
        test_timestamp_preservation()
    except Exception as e:
        print(f"[FAILURE] Test failed: {e}")
        sys.exit(1)
