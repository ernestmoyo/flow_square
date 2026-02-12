import uuid

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select

from app.api.deps import CurrentUser, DbSession
from app.models.reconciliation import ReconciliationRun, VarianceRecord
from app.schemas.reconciliation import (
    ReconciliationRunResponse,
    ReconciliationTriggerRequest,
    VarianceRecordResponse,
)
from app.services.reconciliation_service import ReconciliationService

router = APIRouter()


@router.get("", response_model=dict)
async def list_reconciliation_runs(
    db: DbSession,
    current_user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
    status_filter: str | None = Query(None, alias="status"),
) -> dict:
    offset = (page - 1) * per_page
    query = select(ReconciliationRun)
    count_query = select(func.count(ReconciliationRun.id))

    if status_filter:
        query = query.where(ReconciliationRun.status == status_filter)
        count_query = count_query.where(ReconciliationRun.status == status_filter)

    total = (await db.execute(count_query)).scalar_one()
    result = await db.execute(
        query.order_by(ReconciliationRun.created_at.desc()).offset(offset).limit(per_page)
    )
    runs = result.scalars().unique().all()

    return {
        "data": [ReconciliationRunResponse.model_validate(r) for r in runs],
        "meta": {"page": page, "per_page": per_page, "total": total},
        "errors": None,
    }


@router.get("/{run_id}", response_model=dict)
async def get_reconciliation_run(
    run_id: uuid.UUID, db: DbSession, current_user: CurrentUser
) -> dict:
    result = await db.execute(
        select(ReconciliationRun).where(ReconciliationRun.id == run_id)
    )
    run = result.scalar_one_or_none()
    if run is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Reconciliation run not found"
        )
    return {"data": ReconciliationRunResponse.model_validate(run), "meta": None, "errors": None}


@router.post("/trigger", response_model=dict, status_code=status.HTTP_201_CREATED)
async def trigger_reconciliation(
    body: ReconciliationTriggerRequest, db: DbSession, current_user: CurrentUser
) -> dict:
    service = ReconciliationService(db)
    run = await service.trigger_reconciliation(
        name=body.name,
        period_start=body.period_start,
        period_end=body.period_end,
        asset_id=body.asset_id,
        tolerance_threshold_pct=body.tolerance_threshold_pct,
        triggered_by_id=current_user.id,
    )
    return {"data": ReconciliationRunResponse.model_validate(run), "meta": None, "errors": None}


@router.get("/{run_id}/variances", response_model=dict)
async def list_variances(
    run_id: uuid.UUID,
    db: DbSession,
    current_user: CurrentUser,
    exceptions_only: bool = Query(False),
) -> dict:
    query = select(VarianceRecord).where(VarianceRecord.reconciliation_run_id == run_id)
    if exceptions_only:
        query = query.where(VarianceRecord.is_exception.is_(True))

    result = await db.execute(query.order_by(VarianceRecord.created_at))
    records = result.scalars().all()

    return {
        "data": [VarianceRecordResponse.model_validate(r) for r in records],
        "meta": None,
        "errors": None,
    }
