"""
InfraPulse Sliding-Window Rate Limiting Engine
==============================================

Thread-safe, memory-efficient in-memory sliding window rate limiter
to guard against ingestion floods, brute-force attacks, and rogue agents.
"""

import time
import threading
from typing import Dict, List, Tuple
from fastapi import Request, HTTPException, status


class SlidingWindowRateLimiter:
    """
    Sliding window rate limiter tracking request timestamps per client key.
    Automatically purges expired window entries to prevent memory growth.
    """

    def __init__(self, requests_per_minute: int = 120):
        self.requests_per_minute = requests_per_minute
        self.window_seconds = 60.0
        self._history: Dict[str, List[float]] = {}
        self._lock = threading.Lock()

    def _get_client_key(self, request: Request) -> str:
        # Prioritize agent token header if present, otherwise client IP
        token = request.headers.get("X-Agent-Token")
        if token:
            return f"token:{token[:16]}"
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return f"ip:{forwarded.split(',')[0].strip()}"
        return f"ip:{request.client.host if request.client else 'unknown'}"

    def __call__(self, request: Request):
        if self.requests_per_minute <= 0:
            return

        client_key = self._get_client_key(request)
        now = time.monotonic()
        cutoff = now - self.window_seconds

        with self._lock:
            # Clean expired timestamps
            timestamps = self._history.get(client_key, [])
            valid_timestamps = [ts for ts in timestamps if ts > cutoff]

            if len(valid_timestamps) >= self.requests_per_minute:
                retry_after = int(valid_timestamps[0] + self.window_seconds - now) + 1
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Rate limit exceeded. Maximum {self.requests_per_minute} requests/minute allowed.",
                    headers={"Retry-After": str(max(1, retry_after))},
                )

            valid_timestamps.append(now)
            self._history[client_key] = valid_timestamps

            # Periodic cleanup of idle clients if dictionary grows large
            if len(self._history) > 1000:
                idle_keys = [k for k, v in self._history.items() if not v or v[-1] <= cutoff]
                for k in idle_keys:
                    del self._history[k]


# Standard Rate Limiter instances
metric_ingest_rate_limiter = SlidingWindowRateLimiter(requests_per_minute=240)
general_api_rate_limiter = SlidingWindowRateLimiter(requests_per_minute=300)
simulation_rate_limiter = SlidingWindowRateLimiter(requests_per_minute=60)
