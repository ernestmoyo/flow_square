from fastapi import APIRouter

from app.api.v1 import (
    analytics,
    assets,
    auth,
    compliance,
    fleet,
    incidents,
    reconciliation,
    telemetry,
    terminals,
    users,
    vessels,
    ws,
)

api_v1_router = APIRouter()

api_v1_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_v1_router.include_router(users.router, prefix="/users", tags=["Users"])
api_v1_router.include_router(assets.router, prefix="/assets", tags=["Assets"])
api_v1_router.include_router(telemetry.router, prefix="/telemetry", tags=["Telemetry"])
api_v1_router.include_router(vessels.router, prefix="/vessels", tags=["Vessels"])
api_v1_router.include_router(terminals.router, prefix="/terminals", tags=["Terminals"])
api_v1_router.include_router(fleet.router, prefix="/fleet", tags=["Fleet"])
api_v1_router.include_router(incidents.router, prefix="/incidents", tags=["Incidents"])
api_v1_router.include_router(
    reconciliation.router, prefix="/reconciliation", tags=["Reconciliation"]
)
api_v1_router.include_router(compliance.router, prefix="/compliance", tags=["Compliance"])
api_v1_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_v1_router.include_router(ws.router, prefix="/ws", tags=["WebSocket"])
