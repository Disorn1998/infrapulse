"""
InfraPulse Live Simulation Service & Sandbox Engine
==================================================

Manages virtual enterprise cluster nodes across Rack-01, Rack-02, and Rack-03,
keeping nodes continuously online, generating realistic fluctuating telemetry,
and balancing dual-feed power distribution (Feed A ~950W, Feed B ~820W, Total ~1,770W, PUE ~1.21).
"""

import math
import random
import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.models.host import Host
from app.models.metric import Metric
from app.models.power import PowerConfig
from app.models.pdu import PDU
from app.services.power_service import calculate_node_power_watts

logger = logging.getLogger("infrapulse.simulation")

# 5 Enterprise Nodes with calibrated electrical parameters for realistic Mini DC loads
# Feed A Target: ~949W (~950W) | Feed B Target: ~821W (~820W) | Total IT: ~1,770W
SIMULATED_SPECS = [
    {
        "hostname": "edge-proxy-01",
        "ip_address": "192.168.1.10",
        "os_type": "ubuntu",
        "os_version": "Ubuntu 24.04 LTS",
        "cpu_count": 4,
        "total_ram": 16000000000,
        "total_disk": 256000000000,
        "base_cpu": 35.0,
        "base_ram": 38.0,
        "disk": 22.0,
        "base_rx": 4500000.0,
        "base_tx": 6200000.0,
        "idle_w": 40.0,
        "rated_w": 220.0,
        "pdu_id": 1,            # Feed A (PDU-A1) -> 40 + 0.35 * 180 = ~103W
        "secondary_pdu_id": None,
        "rack_name": "Rack-01",
        "rack_unit": 1,
        "height": 2,
        "temp_c": 39.5,
    },
    {
        "hostname": "ai-inference-01",
        "ip_address": "192.168.1.12",
        "os_type": "ubuntu",
        "os_version": "Ubuntu 24.04 LTS",
        "cpu_count": 32,
        "total_ram": 128000000000,
        "total_disk": 4000000000000,
        "base_cpu": 70.0,
        "base_ram": 84.0,
        "disk": 65.0,
        "base_rx": 8500000.0,
        "base_tx": 12000000.0,
        "idle_w": 220.0,
        "rated_w": 900.0,
        "pdu_id": 1,            # Feed A (PDU-A1) -> 220 + 0.70 * 680 = ~696W
        "secondary_pdu_id": None,
        "rack_name": "Rack-03",
        "rack_unit": 1,
        "height": 6,
        "temp_c": 68.0,
    },
    {
        "hostname": "db-primary-01",
        "ip_address": "192.168.1.11",
        "os_type": "ubuntu",
        "os_version": "Ubuntu 24.04 LTS",
        "cpu_count": 16,
        "total_ram": 64000000000,
        "total_disk": 2000000000000,
        "base_cpu": 55.0,
        "base_ram": 72.0,
        "disk": 48.0,
        "base_rx": 1200000.0,
        "base_tx": 850000.0,
        "idle_w": 80.0,
        "rated_w": 480.0,
        "pdu_id": 1,            # Dual-Corded: Feed A (PDU-A1) & Feed B (PDU-B1)
        "secondary_pdu_id": 2,  # 80 + 0.55 * 400 = 300W -> 150W Feed A, 150W Feed B
        "rack_name": "Rack-02",
        "rack_unit": 1,
        "height": 4,
        "temp_c": 52.0,
    },
    {
        "hostname": "web-frontend-01",
        "ip_address": "192.168.1.14",
        "os_type": "ubuntu",
        "os_version": "Ubuntu 24.04 LTS",
        "cpu_count": 8,
        "total_ram": 32000000000,
        "total_disk": 512000000000,
        "base_cpu": 42.0,
        "base_ram": 48.0,
        "disk": 35.0,
        "base_rx": 8200000.0,
        "base_tx": 11500000.0,
        "idle_w": 45.0,
        "rated_w": 250.0,
        "pdu_id": 2,            # Feed B (PDU-B1) -> 45 + 0.42 * 205 = ~131W
        "secondary_pdu_id": None,
        "rack_name": "Rack-01",
        "rack_unit": 4,
        "height": 2,
        "temp_c": 44.0,
    },
    {
        "hostname": "storage-nas-01",
        "ip_address": "192.168.1.13",
        "os_type": "ubuntu",
        "os_version": "Ubuntu 24.04 LTS",
        "cpu_count": 8,
        "total_ram": 32000000000,
        "total_disk": 16000000000000,
        "base_cpu": 78.0,
        "base_ram": 55.0,
        "disk": 78.0,
        "base_rx": 15000000.0,
        "base_tx": 22000000.0,
        "idle_w": 150.0,
        "rated_w": 650.0,
        "pdu_id": 2,            # Feed B (PDU-B1) -> 150 + 0.78 * 500 = ~540W
        "secondary_pdu_id": None,
        "rack_name": "Rack-03",
        "rack_unit": 8,
        "height": 4,
        "temp_c": 46.0,
    },
]

SIMULATED_HOST_IDS = [n["hostname"].lower() for n in SIMULATED_SPECS]


class SimulationEngine:
    """State manager for interactive Mini Data Center scenarios."""

    def __init__(self):
        self.mode: str = "normal"  # "normal" | "stress" | "outage_feed_a"
        self.tick_count: int = 0

    def set_mode(self, new_mode: str):
        self.mode = new_mode
        logger.info(f"Simulation mode changed to: {new_mode}")

    def get_mode(self) -> str:
        return self.mode


simulation_engine = SimulationEngine()


def ensure_simulated_cluster(db: Session) -> int:
    """
    Ensures that the 5 simulated enterprise cluster nodes exist and are configured with
    dual-feed PDUs (Feed A/B) and physical rack coordinates.
    """
    now = datetime.now(timezone.utc)
    provisioned_count = 0

    for spec in SIMULATED_SPECS:
        host = db.query(Host).filter(Host.id == spec["hostname"].lower()).first()
        if not host:
            host = Host(
                id=spec["hostname"].lower(),
                hostname=spec["hostname"],
                ip_address=spec["ip_address"],
                os_type=spec["os_type"],
                os_version=spec["os_version"],
                cpu_count=spec["cpu_count"],
                total_ram_bytes=spec["total_ram"],
                total_disk_bytes=spec["total_disk"],
                agent_version="1.0.0-sim",
                status="online",
                is_test=True,
                is_simulated=True,
                last_seen=now,
            )
            db.add(host)
            db.flush()
            provisioned_count += 1
        else:
            host.is_test = True
            host.is_simulated = True
            host.status = "online"
            host.last_seen = now

        # Configure or update Dual-Feed Power specs
        p_cfg = db.query(PowerConfig).filter(PowerConfig.host_id == host.id).first()
        if not p_cfg:
            p_cfg = PowerConfig(
                id=str(uuid.uuid4()),
                host_id=host.id,
                idle_watts=spec["idle_w"],
                rated_watts=spec["rated_w"],
                pdu_id=spec["pdu_id"],
                secondary_pdu_id=spec.get("secondary_pdu_id"),
                rack_name=spec["rack_name"],
                rack_unit_start=spec["rack_unit"],
                rack_unit_height=spec["height"],
            )
            db.add(p_cfg)
        else:
            p_cfg.idle_watts = spec["idle_w"]
            p_cfg.rated_watts = spec["rated_w"]
            p_cfg.pdu_id = spec["pdu_id"]
            p_cfg.secondary_pdu_id = spec.get("secondary_pdu_id")
            p_cfg.rack_name = spec["rack_name"]
            p_cfg.rack_unit_start = spec["rack_unit"]
            p_cfg.rack_unit_height = spec["height"]

    db.commit()
    return provisioned_count


def tick_simulation_cycle(db: Session) -> int:
    """
    Executes a single periodic simulation tick.
    Injects dynamic telemetry, updates last_seen to keep nodes ONLINE,
    and calculates power draw corresponding to current scenario mode.
    """
    sim_hosts = db.query(Host).filter(Host.id.in_(SIMULATED_HOST_IDS)).all()
    if not sim_hosts:
        return 0

    now = datetime.now(timezone.utc)
    simulation_engine.tick_count += 1
    t = simulation_engine.tick_count
    current_mode = simulation_engine.get_mode()

    spec_map = {s["hostname"].lower(): s for s in SIMULATED_SPECS}

    for host in sim_hosts:
        spec = spec_map.get(host.id)
        if not spec:
            continue

        # Keep host online with fresh heartbeat
        host.last_seen = now
        host.status = "online"
        host.is_test = True
        host.is_simulated = True

        # Base CPU with realistic sine-wave breathing (period ~60s) + subtle noise
        phase_offset = hash(host.id) % 10
        oscillation = math.sin((t * 0.3) + phase_offset) * 2.5
        jitter = random.uniform(-1.0, 1.0)

        if current_mode == "stress":
            cpu_val = min(96.0, max(88.0, 92.0 + random.uniform(-2.0, 3.0)))
            ram_pct = min(95.0, spec["base_ram"] + 20.0 + random.uniform(-1.0, 2.0))
            temp_val = round(spec["temp_c"] + 12.0 + random.uniform(-0.5, 1.0), 1)
        elif current_mode == "outage_feed_a" and spec["pdu_id"] == 1 and not spec.get("secondary_pdu_id"):
            # Single-corded node on Feed A suffers blackout if Feed A is down without ATS
            # Here we demonstrate failover: db-primary-01 survives, single-corded edge proxy sheds load
            cpu_val = 0.0
            ram_pct = spec["base_ram"]
            temp_val = round(max(24.0, spec["temp_c"] - 10.0), 1)
        else:
            cpu_val = min(98.0, max(5.0, spec["base_cpu"] + oscillation + jitter))
            ram_pct = min(95.0, max(10.0, spec["base_ram"] + (oscillation * 0.3)))
            temp_val = round(spec["temp_c"] + (oscillation * 0.4), 1)

        # Calculate live power consumption
        if cpu_val == 0.0 and current_mode == "outage_feed_a" and spec["pdu_id"] == 1 and not spec.get("secondary_pdu_id"):
            calc_w = 0.0
        else:
            calc_w = calculate_node_power_watts(idle_watts=spec["idle_w"], rated_watts=spec["rated_w"], cpu_percent=cpu_val)

        # Dynamic Network I/O jitter
        rx_val = max(1000.0, spec["base_rx"] * (1.0 + (oscillation * 0.1) + random.uniform(-0.05, 0.05)))
        tx_val = max(1000.0, spec["base_tx"] * (1.0 + (oscillation * 0.1) + random.uniform(-0.05, 0.05)))

        metric = Metric(
            host_id=host.id,
            timestamp=now,
            received_at=now,
            cpu_percent=round(cpu_val, 1),
            ram_percent=round(ram_pct, 1),
            ram_used_bytes=int(spec["total_ram"] * (ram_pct / 100.0)),
            disk_percent=spec["disk"],
            disk_used_bytes=int(spec["total_disk"] * (spec["disk"] / 100.0)),
            net_recv_bytes_per_sec=round(rx_val, 1),
            net_sent_bytes_per_sec=round(tx_val, 1),
            uptime_seconds=86400 * 5 + (t * 10),
            calculated_power_watts=round(calc_w, 1),
            cpu_temperature_celsius=temp_val,
        )
        db.add(metric)

    # Clean simulated metrics older than 1 hour to prevent SQLite/PostgreSQL bloat
    cutoff = now - timedelta(hours=1)
    db.query(Metric).filter(Metric.host_id.in_(SIMULATED_HOST_IDS), Metric.timestamp < cutoff).delete(synchronize_session=False)

    db.commit()
    return len(sim_hosts)
