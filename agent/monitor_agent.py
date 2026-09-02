#!/usr/bin/env python3
"""
InfraPulse Cross-Platform Monitoring Agent
==========================================

Collects real-time hardware telemetry and system metrics on Ubuntu Linux and Windows,
transmitting snapshots to the InfraPulse FastAPI backend with token authentication,
drift-free scheduling, and offline SQLite buffering.

Usage:
    python monitor_agent.py
    python monitor_agent.py --once
    python monitor_agent.py --dry-run
    python monitor_agent.py --config my_config.json --interval 15
"""

import os
import sys
import json
import time
import signal
import random
import logging
import argparse
from typing import Dict, Any, Optional
import requests

from collector import SystemMetricSource
from buffer import SQLiteBuffer

# Setup Structured Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("infrapulse.agent")


def mask_token(token: str) -> str:
    """Masks secret token for safe display in logs."""
    if not token or len(token) < 8:
        return "********"
    return f"{token[:4]}...{token[-4:]}"


class MonitorAgent:
    """
    Main Monitoring Agent Controller.
    Coordinates metric collection, HTTP transmission, offline buffering,
    and graceful daemon lifecycle.
    """

    def __init__(
        self,
        backend_url: str,
        agent_token: str,
        interval_seconds: int = 30,
        buffer_db_path: str = "agent_buffer.db",
        batch_flush_size: int = 100,
    ):
        clean_url = backend_url.rstrip("/")
        if clean_url.endswith("/metrics"):
            self.metrics_url = clean_url
            self.batch_url = f"{clean_url}/batch"
        elif clean_url.endswith("/api/v1"):
            self.metrics_url = f"{clean_url}/metrics"
            self.batch_url = f"{clean_url}/metrics/batch"
        else:
            self.metrics_url = f"{clean_url}/api/v1/metrics"
            self.batch_url = f"{clean_url}/api/v1/metrics/batch"

        self.backend_url = self.metrics_url
        self.agent_token = agent_token
        self.interval_seconds = max(5, interval_seconds)
        self.batch_flush_size = batch_flush_size
        self.is_running = True

        # Initialize Collector and Offline Buffer
        self.collector = SystemMetricSource(agent_version="1.0.0")
        self.buffer = SQLiteBuffer(db_path=buffer_db_path)

        # HTTP Session with Connection Pooling & Headers
        self.session = requests.Session()
        self.session.headers.update({
            "Content-Type": "application/json",
            "X-Agent-Token": self.agent_token,
            "User-Agent": f"InfraPulse-Agent/1.0.0 ({self.collector.os_type})",
        })

    def flush_offline_buffer(self) -> int:
        """
        Attempts to flush buffered historical records in batches to the backend.
        Returns total number of records successfully flushed.
        """
        total_flushed = 0
        buffered_count = self.buffer.count()
        if buffered_count == 0:
            return 0

        logger.info(f"Detected {buffered_count} buffered records. Initiating offline flush...")

        while self.is_running:
            batch = self.buffer.peek(limit=self.batch_flush_size)
            if not batch:
                break

            batch_ids = [item[0] for item in batch]
            batch_payloads = [item[1] for item in batch]

            try:
                resp = self.session.post(
                    self.batch_url,
                    json=batch_payloads,
                    timeout=(5.0, 10.0),
                )
                if resp.status_code in (200, 201):
                    self.buffer.delete_batch(batch_ids)
                    total_flushed += len(batch_ids)
                    logger.info(f"Flushed batch of {len(batch_ids)} records to backend.")
                else:
                    logger.warning(
                        f"Batch flush rejected with status {resp.status_code}: {resp.text[:100]}"
                    )
                    break
            except requests.RequestException as e:
                logger.warning(f"Batch flush paused due to network error: {e}")
                break

        return total_flushed

    def send_single_payload(self, payload: Dict[str, Any]) -> bool:
        """
        Sends telemetry payload directly to the backend.
        If offline, automatically queues into local SQLite buffer.
        """
        # 1. Attempt to flush any previously queued data first
        if self.buffer.count() > 0:
            self.flush_offline_buffer()

        # 2. Transmit current snapshot
        start_t = time.monotonic()
        try:
            resp = self.session.post(
                self.backend_url,
                json=payload,
                timeout=(5.0, 10.0),
            )
            elapsed_ms = round((time.monotonic() - start_t) * 1000, 1)

            if resp.status_code in (200, 201):
                logger.info(
                    f"Telemetry transmitted: CPU {payload['cpu_percent']}% | "
                    f"RAM {payload['ram_percent']}% | Disk {payload['disk_percent']}% "
                    f"(HTTP {resp.status_code}, {elapsed_ms}ms)"
                )
                return True
            elif resp.status_code == 401:
                logger.error("Authentication failed: X-Agent-Token rejected by backend. Check AGENT_SECRET_TOKEN.")
                self.buffer.push(payload)
                return False
            else:
                logger.warning(
                    f"Backend returned HTTP {resp.status_code}: {resp.text[:150]}. Queued to buffer."
                )
                self.buffer.push(payload)
                return False
        except requests.RequestException as err:
            logger.warning(f"Backend unreachable ({err.__class__.__name__}). Queued to local SQLite buffer.")
            self.buffer.push(payload)
            return False

    def run_once(self, dry_run: bool = False) -> bool:
        """Executes a single telemetry collection cycle."""
        logger.info(f"Collecting telemetry snapshot for host '{self.collector.hostname}'...")
        payload = self.collector.collect()

        if dry_run:
            print("\n" + "=" * 50)
            print("--- INFRAPULSE DRY-RUN TELEMETRY PAYLOAD ---")
            print("=" * 50)
            print(json.dumps(payload, indent=2))
            print("=" * 50 + "\n")
            logger.info("Dry-run complete. No data sent to network or buffer.")
            return True

        return self.send_single_payload(payload)

    def run_loop(self) -> None:
        """
        Runs continuous monitoring loop with drift-free monotonic scheduling
        and exponential backoff handling.
        """
        logger.info(
            f"Starting InfraPulse Agent Daemon for '{self.collector.hostname}' "
            f"({self.collector.os_type}) | Interval: {self.interval_seconds}s | "
            f"Target: {self.backend_url}"
        )
        logger.info(f"Agent Token: {mask_token(self.agent_token)}")

        while self.is_running:
            target_next_tick = time.monotonic() + self.interval_seconds
            
            try:
                payload = self.collector.collect()
                self.send_single_payload(payload)
            except Exception as e:
                logger.error(f"Unexpected error during collection cycle: {e}", exc_info=True)

            # Drift-free sleep calculation
            sleep_duration = max(0.0, target_next_tick - time.monotonic())
            
            # Sub-second sleep chunking for responsive SIGINT/SIGTERM handling
            sleep_end = time.monotonic() + sleep_duration
            while self.is_running and time.monotonic() < sleep_end:
                time.sleep(min(0.5, max(0.0, sleep_end - time.monotonic())))

        logger.info("Agent daemon loop stopped.")


def load_configuration(args: argparse.Namespace) -> Dict[str, Any]:
    """
    Loads configuration with precedence:
    CLI Args > Environment Variables > Config File > Defaults.
    """
    config = {
        "backend_url": "http://localhost:8000/api/v1/metrics",
        "agent_token": "infrapulse_secret_token_change_in_production",
        "collect_interval_seconds": 30,
        "buffer_db_path": "agent_buffer.db",
        "batch_flush_size": 100,
        "log_level": "INFO",
    }

    # 1. Load from file if specified or default exists
    config_file = args.config
    if not config_file and os.path.exists("config.json"):
        config_file = "config.json"

    if config_file and os.path.exists(config_file):
        try:
            with open(config_file, "r", encoding="utf-8") as f:
                file_cfg = json.load(f)
                config.update(file_cfg)
                logger.info(f"Loaded configuration from file: {config_file}")
        except Exception as e:
            logger.warning(f"Could not parse config file '{config_file}': {e}")

    # 2. Override with Environment Variables
    if os.getenv("INFRAPULSE_BACKEND_URL"):
        config["backend_url"] = os.getenv("INFRAPULSE_BACKEND_URL")
    if os.getenv("INFRAPULSE_AGENT_TOKEN"):
        config["agent_token"] = os.getenv("INFRAPULSE_AGENT_TOKEN")
    if os.getenv("INFRAPULSE_INTERVAL"):
        try:
            config["collect_interval_seconds"] = int(os.getenv("INFRAPULSE_INTERVAL"))
        except ValueError:
            pass

    # 3. Override with explicit CLI Arguments
    if args.backend_url:
        config["backend_url"] = args.backend_url
    if args.token:
        config["agent_token"] = args.token
    if args.interval:
        config["collect_interval_seconds"] = args.interval
    if args.buffer_db:
        config["buffer_db_path"] = args.buffer_db

    return config


def main():
    parser = argparse.ArgumentParser(
        description="InfraPulse Hardware & OS Telemetry Monitoring Agent",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument("--config", "-c", type=str, help="Path to JSON configuration file")
    parser.add_argument("--backend-url", "-u", type=str, help="Backend metrics endpoint URL")
    parser.add_argument("--token", "-t", type=str, help="X-Agent-Token authentication secret")
    parser.add_argument("--interval", "-i", type=int, help="Sampling interval in seconds")
    parser.add_argument("--buffer-db", type=str, help="Path to local SQLite buffer database")
    parser.add_argument("--once", action="store_true", help="Collect and send single metric snapshot, then exit")
    parser.add_argument("--dry-run", action="store_true", help="Sample and print JSON payload to stdout without transmitting")

    args = parser.parse_args()
    config = load_configuration(args)

    # Initialize Agent
    agent = MonitorAgent(
        backend_url=config["backend_url"],
        agent_token=config["agent_token"],
        interval_seconds=config["collect_interval_seconds"],
        buffer_db_path=config["buffer_db_path"],
        batch_flush_size=config.get("batch_flush_size", 100),
    )

    # Signal handlers for graceful shutdown (Unix SIGINT/SIGTERM, Windows CTRL_C_EVENT)
    def handle_shutdown(signum, frame):
        logger.info("Received termination signal. Flushing buffer and shutting down gracefully...")
        agent.is_running = False

    signal.signal(signal.SIGINT, handle_shutdown)
    if hasattr(signal, "SIGTERM"):
        signal.signal(signal.SIGTERM, handle_shutdown)

    # Execution Mode
    if args.dry_run:
        success = agent.run_once(dry_run=True)
        sys.exit(0 if success else 1)
    elif args.once:
        success = agent.run_once(dry_run=False)
        sys.exit(0 if success else 1)
    else:
        agent.run_loop()


if __name__ == "__main__":
    main()
