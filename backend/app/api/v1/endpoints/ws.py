"""
InfraPulse WebSocket Telemetry Endpoint
=======================================

Provides real-time bidirectional WebSocket stream for live dashboard telemetry.
"""

import asyncio
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.websocket import ws_manager

router = APIRouter()
logger = logging.getLogger("infrapulse.ws_endpoint")


@router.websocket("/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    """
    Live WebSocket stream for browser clients.
    Clients receive instantaneous telemetry broadcasts whenever new agent metrics arrive.
    """
    await ws_manager.connect(websocket)
    try:
        # Send initial connection acknowledgment
        await websocket.send_json({
            "event": "connected",
            "message": "InfraPulse Real-Time Telemetry Stream Connected",
            "protocol_version": "1.0",
        })

        while True:
            # Keep connection alive; handle client heartbeat pings
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_json({"event": "pong"})
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.warning(f"WebSocket connection closed unexpectedly: {e}")
        ws_manager.disconnect(websocket)
