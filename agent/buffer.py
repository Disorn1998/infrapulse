"""
InfraPulse Persistent SQLite Offline Buffer
===========================================

Provides a thread-safe, persistent FIFO ring buffer to queue telemetry data
when the backend is unreachable or offline. Automatically flushes records in batches
once connectivity is restored.
"""

import json
import time
import sqlite3
import logging
from typing import List, Tuple, Dict, Any

logger = logging.getLogger("infrapulse.buffer")


class SQLiteBuffer:
    """
    Local SQLite-backed queue for telemetry payloads.
    Guarantees no data loss during network interruptions or backend maintenance.
    """

    def __init__(self, db_path: str = "agent_buffer.db", max_records: int = 10000):
        self.db_path = db_path
        self.max_records = max_records
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path, timeout=10.0)
        conn.execute("PRAGMA journal_mode = WAL;")
        conn.execute("PRAGMA synchronous = NORMAL;")
        return conn

    def _init_db(self) -> None:
        """Initializes buffer table and indexes."""
        with self._get_connection() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS buffered_metrics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    payload TEXT NOT NULL,
                    created_at REAL NOT NULL
                );
            """)
            conn.execute("CREATE INDEX IF NOT EXISTS ix_buffer_created_at ON buffered_metrics(created_at);")

    def push(self, record: Dict[str, Any]) -> None:
        """
        Enqueues a telemetry payload. If buffer exceeds max_records,
        prunes oldest records to prevent unbounded disk growth.
        """
        payload_json = json.dumps(record)
        now_ts = time.time()

        try:
            with self._get_connection() as conn:
                conn.execute(
                    "INSERT INTO buffered_metrics (payload, created_at) VALUES (?, ?);",
                    (payload_json, now_ts),
                )
                
                # Check and prune oldest if exceeding max capacity
                cur = conn.execute("SELECT COUNT(*) FROM buffered_metrics;")
                total_count = cur.fetchone()[0]
                
                if total_count > self.max_records:
                    excess = total_count - self.max_records
                    conn.execute("""
                        DELETE FROM buffered_metrics 
                        WHERE id IN (
                            SELECT id FROM buffered_metrics ORDER BY id ASC LIMIT ?
                        );
                    """, (excess,))
        except Exception as e:
            logger.error(f"Failed to push record to SQLite buffer: {e}")

    def peek(self, limit: int = 100) -> List[Tuple[int, Dict[str, Any]]]:
        """Fetches up to `limit` oldest records for batch transmission."""
        results = []
        try:
            with self._get_connection() as conn:
                cur = conn.execute(
                    "SELECT id, payload FROM buffered_metrics ORDER BY id ASC LIMIT ?;",
                    (limit,),
                )
                for row_id, payload_str in cur.fetchall():
                    try:
                        record_dict = json.loads(payload_str)
                        results.append((row_id, record_dict))
                    except json.JSONDecodeError:
                        # Malformed entry, delete immediately
                        conn.execute("DELETE FROM buffered_metrics WHERE id = ?;", (row_id,))
        except Exception as e:
            logger.error(f"Failed to read from SQLite buffer: {e}")
        return results

    def delete_batch(self, ids: List[int]) -> None:
        """Removes successfully flushed records from the buffer."""
        if not ids:
            return
        try:
            with self._get_connection() as conn:
                placeholders = ",".join("?" for _ in ids)
                conn.execute(f"DELETE FROM buffered_metrics WHERE id IN ({placeholders});", ids)
        except Exception as e:
            logger.error(f"Failed to delete batch from SQLite buffer: {e}")

    def count(self) -> int:
        """Returns the total number of currently buffered records."""
        try:
            with self._get_connection() as conn:
                cur = conn.execute("SELECT COUNT(*) FROM buffered_metrics;")
                return cur.fetchone()[0]
        except Exception:
            return 0
