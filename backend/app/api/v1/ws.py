import json
import uuid

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core.logging import get_logger

router = APIRouter()
logger = get_logger(__name__)


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, channel: str) -> None:
        await websocket.accept()
        if channel not in self.active_connections:
            self.active_connections[channel] = []
        self.active_connections[channel].append(websocket)

    def disconnect(self, websocket: WebSocket, channel: str) -> None:
        if channel in self.active_connections:
            self.active_connections[channel].remove(websocket)
            if not self.active_connections[channel]:
                del self.active_connections[channel]

    async def broadcast(self, channel: str, message: dict) -> None:
        if channel in self.active_connections:
            disconnected = []
            for connection in self.active_connections[channel]:
                try:
                    await connection.send_json(message)
                except Exception:
                    disconnected.append(connection)
            for conn in disconnected:
                self.disconnect(conn, channel)


manager = ConnectionManager()


@router.websocket("/telemetry/{asset_id}")
async def telemetry_stream(websocket: WebSocket, asset_id: uuid.UUID) -> None:
    channel = f"telemetry:{asset_id}"
    await manager.connect(websocket, channel)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            await manager.broadcast(channel, message)
    except WebSocketDisconnect:
        manager.disconnect(websocket, channel)


@router.websocket("/alerts")
async def alerts_stream(websocket: WebSocket) -> None:
    channel = "alerts:global"
    await manager.connect(websocket, channel)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, channel)


@router.websocket("/fleet/{vehicle_id}")
async def fleet_tracking_stream(websocket: WebSocket, vehicle_id: uuid.UUID) -> None:
    channel = f"fleet:{vehicle_id}"
    await manager.connect(websocket, channel)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            await manager.broadcast(channel, message)
    except WebSocketDisconnect:
        manager.disconnect(websocket, channel)
