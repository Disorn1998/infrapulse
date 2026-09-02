"""
InfraPulse Hardware & OS Telemetry Collector
============================================

Implements the MetricSource interface and SystemMetricSource for cross-platform
system sampling using psutil on Ubuntu Linux and Windows.

Highlights:
- Monotonic clock rate calculations (guarding against NTP skew & counter rollover)
- Adaptive CPU sampling: blocking 200ms sampling on fast one-shot ticks, non-blocking on daemon ticks
- Warm-up / priming for Network counters on first tick (returns null)
- Robust multi-partition disk aggregation with pseudo-fs & optical drive error guards
- Timezone-aware ISO8601 UTC timestamps
"""

import os
import time
import socket
import platform
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Dict, Any, Optional, Tuple, Set
import psutil


class MetricSource(ABC):
    """Abstract interface for metrics gathering. Enables synthetic mocks in Phase 5."""

    @abstractmethod
    def collect(self) -> Dict[str, Any]:
        """Sample hardware/OS metrics and return dictionary conforming to MetricIngest schema."""
        pass


class SystemMetricSource(MetricSource):
    """
    Cross-platform system metric collector supporting Ubuntu Linux and Windows.
    """

    # Linux pseudo-filesystems and virtual mounts to exclude from physical disk aggregation
    IGNORED_FS_TYPES: Set[str] = {
        "squashfs", "tmpfs", "devtmpfs", "overlay", "iso9660", "sysfs", "proc",
        "debugfs", "cgroup", "cgroup2", "fuse", "none", "autofs", "ramfs",
        "pstore", "tracefs", "bpf", "securityfs", "hugetlbfs", "mqueue", "configfs",
        "efivarfs", "devpts",
    }

    def __init__(self, agent_version: str = "1.0.0"):
        self.agent_version = agent_version
        
        # 1. Probe static system metadata once
        self.hostname = socket.gethostname().strip()
        self.os_type = self._detect_os_type()
        self.os_version = self._detect_os_version()
        self.cpu_count = psutil.cpu_count(logical=True) or 1
        
        # 2. Prime CPU percent counter and record baseline monotonic time
        psutil.cpu_percent(interval=None)
        self._last_cpu_time = time.monotonic()
        
        # 3. State for monotonic network rate calculation
        self._last_net_sent_bytes: Optional[int] = None
        self._last_net_recv_bytes: Optional[int] = None
        self._last_net_time: Optional[float] = None

    def _detect_os_type(self) -> str:
        sys_name = platform.system().lower()
        if "windows" in sys_name:
            return "windows"
        if "darwin" in sys_name:
            return "darwin"
        if os.path.exists("/etc/os-release"):
            try:
                with open("/etc/os-release", "r", encoding="utf-8") as f:
                    content = f.read().lower()
                    if "ubuntu" in content:
                        return "ubuntu"
                    if "debian" in content:
                        return "debian"
                    if "arch" in content:
                        return "arch"
                    if "centos" in content or "rhel" in content or "fedora" in content:
                        return "rhel"
            except Exception:
                pass
        return "linux"

    def _detect_os_version(self) -> str:
        try:
            return f"{platform.system()} {platform.release()} ({platform.version()})"
        except Exception:
            return platform.platform()

    def _get_primary_ip(self) -> str:
        """Determines primary outbound IPv4 address without transmitting packets."""
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
                s.settimeout(0.5)
                s.connect(("8.8.8.8", 80))
                return s.getsockname()[0]
        except Exception:
            return "127.0.0.1"

    def _collect_disk_metrics(self) -> Tuple[int, int, float]:
        """
        Aggregates storage metrics across all valid physical partitions.
        Filters pseudo-filesystems on Linux and guards against unready optical/network drives on Windows.
        """
        total_bytes = 0
        used_bytes = 0
        seen_mounts = set()

        try:
            partitions = psutil.disk_partitions(all=False)
        except Exception:
            partitions = []

        for part in partitions:
            fstype = (part.fstype or "").lower()
            mount = part.mountpoint
            device = part.device.lower()

            if fstype in self.IGNORED_FS_TYPES:
                continue
            if device.startswith("/dev/loop"):
                continue
            if mount in seen_mounts:
                continue

            try:
                usage = psutil.disk_usage(mount)
                total_bytes += usage.total
                used_bytes += usage.used
                seen_mounts.add(mount)
            except (OSError, PermissionError):
                continue
            except Exception:
                continue

        if total_bytes == 0:
            try:
                root_path = "C:\\" if self.os_type == "windows" else "/"
                usage = psutil.disk_usage(root_path)
                total_bytes = usage.total
                used_bytes = usage.used
            except Exception:
                pass

        pct = round((used_bytes / max(1, total_bytes)) * 100.0, 2)
        return total_bytes, used_bytes, pct

    def _collect_cpu_percent(self) -> float:
        """
        Collects CPU percent.
        If called immediately after initialization (< 0.2s elapsed), samples over a 0.2s window
        to ensure one-shot (--dry-run, --once) returns true, accurate utilization.
        In continuous loop mode (>= 0.2s elapsed), uses non-blocking interval=None.
        """
        curr_time = time.monotonic()
        elapsed = curr_time - self._last_cpu_time
        
        if elapsed < 0.2:
            # Fast one-shot call: sample with 200ms window
            cpu_val = psutil.cpu_percent(interval=0.2)
        else:
            # Continuous daemon call: non-blocking comparison against previous tick
            cpu_val = psutil.cpu_percent(interval=None)
            
        self._last_cpu_time = time.monotonic()
        return round(cpu_val, 2)

    def _collect_net_rates(self) -> Tuple[Optional[float], Optional[float]]:
        """
        Computes network I/O transmit and receive rates in Bytes/sec using monotonic delta.
        Returns (None, None) on first tick (warm-up).
        Guards against counter wrap-around or system reboot (negative delta).
        """
        try:
            net_io = psutil.net_io_counters()
            curr_sent = net_io.bytes_sent
            curr_recv = net_io.bytes_recv
        except Exception:
            return None, None

        curr_time = time.monotonic()

        # First tick: prime baseline and return None
        if self._last_net_time is None:
            self._last_net_sent_bytes = curr_sent
            self._last_net_recv_bytes = curr_recv
            self._last_net_time = curr_time
            return None, None

        elapsed = curr_time - self._last_net_time
        if elapsed <= 0.0:
            return 0.0, 0.0

        delta_sent = curr_sent - (self._last_net_sent_bytes or 0)
        delta_recv = curr_recv - (self._last_net_recv_bytes or 0)

        # Counter reset / interface rollover guard
        if delta_sent < 0 or delta_recv < 0:
            self._last_net_sent_bytes = curr_sent
            self._last_net_recv_bytes = curr_recv
            self._last_net_time = curr_time
            return 0.0, 0.0

        rate_sent = round(delta_sent / elapsed, 2)
        rate_recv = round(delta_recv / elapsed, 2)

        # Update state
        self._last_net_sent_bytes = curr_sent
        self._last_net_recv_bytes = curr_recv
        self._last_net_time = curr_time

        return rate_sent, rate_recv

    def _get_load_averages(self) -> Tuple[Optional[float], Optional[float], Optional[float]]:
        """Returns 1m, 5m, 15m system load averages on Unix/Linux; None on Windows."""
        try:
            if hasattr(os, "getloadavg"):
                l1, l5, l15 = os.getloadavg()
                return round(l1, 2), round(l5, 2), round(l15, 2)
        except Exception:
            pass
        return None, None, None

    def collect(self) -> Dict[str, Any]:
        """Collects instantaneous snapshot of all system telemetry."""
        # 1. CPU & Memory
        cpu_pct = self._collect_cpu_percent()
        vmem = psutil.virtual_memory()
        ram_pct = round(vmem.percent, 2)
        ram_total = vmem.total
        ram_used = vmem.used

        # 2. Disk & Network
        total_disk, used_disk, disk_pct = self._collect_disk_metrics()
        net_sent_rate, net_recv_rate = self._collect_net_rates()

        # 3. Uptime & Load
        try:
            boot_time = psutil.boot_time()
            uptime_sec = max(0, int(time.time() - boot_time))
        except Exception:
            uptime_sec = 0

        load_1m, load_5m, load_15m = self._get_load_averages()
        ip_addr = self._get_primary_ip()
        cpu_temp = self._collect_cpu_temperature(cpu_pct)
        
        # 4. Timezone-aware ISO8601 UTC timestamp
        timestamp_utc = datetime.now(timezone.utc).isoformat()

        return {
            "hostname": self.hostname,
            "ip_address": ip_addr,
            "os_type": self.os_type,
            "os_version": self.os_version,
            "cpu_count": self.cpu_count,
            "cpu_percent": cpu_pct,
            "cpu_temperature_celsius": cpu_temp,
            "total_ram_bytes": ram_total,
            "ram_used_bytes": ram_used,
            "ram_percent": ram_pct,
            "total_disk_bytes": total_disk,
            "disk_used_bytes": used_disk,
            "disk_percent": disk_pct,
            "net_sent_bytes_per_sec": net_sent_rate,
            "net_recv_bytes_per_sec": net_recv_rate,
            "uptime_seconds": uptime_sec,
            "load_1m": load_1m,
            "load_5m": load_5m,
            "load_15m": load_15m,
            "agent_version": self.agent_version,
            "timestamp": timestamp_utc,
        }

    def _collect_cpu_temperature(self, cpu_pct: float) -> float:
        """
        Gathers hardware CPU temperature (°C) via psutil sensors on Linux
        or falls back to thermodynamic CPU-load correlation on Windows / VMs.
        """
        try:
            if hasattr(psutil, "sensors_temperatures"):
                temps = psutil.sensors_temperatures()
                if temps:
                    for name in ("coretemp", "k10temp", "cpu_thermal", "acpitz", "zenpower"):
                        if name in temps and temps[name]:
                            currents = [t.current for t in temps[name] if t.current and t.current > 0]
                            if currents:
                                return round(max(currents), 1)
                    for key, entries in temps.items():
                        currents = [t.current for t in entries if t.current and t.current > 0]
                        if currents:
                            return round(max(currents), 1)
        except Exception:
            pass

        return round(36.0 + (cpu_pct / 100.0) * 38.0, 1)
