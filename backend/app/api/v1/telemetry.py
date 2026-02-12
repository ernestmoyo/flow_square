import uuid
from datetime import datetime

from fastapi import APIRouter, Query

from app.api.deps import CurrentUser, DbSession
from app.services.telemetry_service import TelemetryService
from app.schemas.telemetry import (
    TelemetryIngestRequest,
    TelemetryIngestResponse,
    TelemetryQueryResponse,
)

router = APIRouter()


@router.post("/ingest", response_model=dict)
async def ingest_telemetry(
    body: TelemetryIngestRequest, db: DbSession, current_user: CurrentUser
) -> dict:
    service = TelemetryService(db)
    result = await service.ingest(body.readings)
    return {"data": result, "meta": None, "errors": None}


@router.get("/query", response_model=dict)
async def query_telemetry(
    db: DbSession,
    current_user: CurrentUser,
    tag_ids: str = Query(..., description="Comma-separated tag UUIDs"),
    start: datetime = Query(...),
    end: datetime = Query(...),
    downsample: str | None = None,
) -> dict:
    parsed_tag_ids = [uuid.UUID(tid.strip()) for tid in tag_ids.split(",")]
    service = TelemetryService(db)
    results = await service.query(parsed_tag_ids, start, end, downsample)
    return {"data": results, "meta": None, "errors": None}


@router.get("/latest/{tag_id}", response_model=dict)
async def get_latest_reading(
    tag_id: uuid.UUID, db: DbSession, current_user: CurrentUser
) -> dict:
    service = TelemetryService(db)
    reading = await service.get_latest(tag_id)
    return {"data": reading, "meta": None, "errors": None}
