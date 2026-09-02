"""
InfraPulse WebSocket Real-Time Telemetry Connection Manager
==========================================================

Manages active browser WebSocket connections and broadcasts live telemetry
and facility updates instantaneously without waiting for polling intervals.
"""

import logging
from typing import List, Dict, Any
from fastapi import WebSocket

logger = logging.getLogger("infrapulse.websocket")


class ConnectionManager:
    """Manages active WebSocket connections for live telemetry push."""

    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Active clients: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Active clients: {len(self.active_connections)}")

    async def broadcast(self, message: Dict[str, Any]):
        """Broadcasts JSON payload to all connected clients. Cleans dead sockets automatically."""
        dead_connections = []
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                dead_connections.append(connection)

        for dead in dead_connections:
            self.disconnect(dead)


ws_manager = ConnectionManager()
