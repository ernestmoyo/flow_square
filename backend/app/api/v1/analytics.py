import uuid
from datetime import datetime

from fastapi import APIRouter, Query

from app.api.deps import CurrentUser, DbSession
from app.schemas.analytics import TimeRange
from app.services.analytics.ufg_index import UFGIndexService
from app.services.analytics.leak_probability import LeakProbabilityService
from app.services.analytics.meter_drift import MeterDriftService
from app.services.analytics.fraud_detection import FraudDetectionService
from app.services.analytics.integrity_health import IntegrityHealthService
from app.services.analytics.predictive_maintenance import PredictiveMaintenanceService

router = APIRouter()


@router.get("/ufg", response_model=dict)
async def get_ufg_index(
    db: DbSession,
    current_user: CurrentUser,
    asset_id: uuid.UUID = Query(...),
    start: datetime = Query(...),
    end: datetime = Query(...),
) -> dict:
    service = UFGIndexService(db)
    result = await service.compute(asset_id, TimeRange(start=start, end=end))
    return {"data": result, "meta": None, "errors": None}


@router.get("/leak-probability", response_model=dict)
async def get_leak_probability(
    db: DbSession,
    current_user: CurrentUser,
    asset_id: uuid.UUID = Query(...),
    start: datetime = Query(...),
    end: datetime = Query(...),
) -> dict:
    service = LeakProbabilityService(db)
    result = await service.compute(asset_id, TimeRange(start=start, end=end))
    return {"data": result, "meta": None, "errors": None}


@router.get("/meter-drift", response_model=dict)
async def get_meter_drift(
    db: DbSession,
    current_user: CurrentUser,
    tag_id: uuid.UUID = Query(...),
    start: datetime = Query(...),
    end: datetime = Query(...),
) -> dict:
    service = MeterDriftService(db)
    result = await service.compute(tag_id, TimeRange(start=start, end=end))
    return {"data": result, "meta": None, "errors": None}


@router.get("/fraud-score", response_model=dict)
async def get_fraud_score(
    db: DbSession,
    current_user: CurrentUser,
    trip_id: uuid.UUID = Query(...),
) -> dict:
    service = FraudDetectionService(db)
    result = await service.compute_for_trip(trip_id)
    return {"data": result, "meta": None, "errors": None}


@router.get("/integrity", response_model=dict)
async def get_integrity_health(
    db: DbSession,
    current_user: CurrentUser,
    asset_id: uuid.UUID = Query(...),
    start: datetime = Query(...),
    end: datetime = Query(...),
) -> dict:
    service = IntegrityHealthService(db)
    result = await service.compute(asset_id, TimeRange(start=start, end=end))
    return {"data": result, "meta": None, "errors": None}


@router.get("/predictive-maintenance", response_model=dict)
async def get_predictive_maintenance(
    db: DbSession,
    current_user: CurrentUser,
    asset_id: uuid.UUID = Query(...),
    start: datetime = Query(...),
    end: datetime = Query(...),
) -> dict:
    service = PredictiveMaintenanceService(db)
    result = await service.compute(asset_id, TimeRange(start=start, end=end))
    return {"data": result, "meta": None, "errors": None}
