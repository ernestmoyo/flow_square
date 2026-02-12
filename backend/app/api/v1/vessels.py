import uuid

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select

from app.api.deps import CurrentUser, DbSession
from app.models.vessel import BerthSchedule, DemurrageRecord, Vessel
from app.schemas.vessel import (
    BerthScheduleCreate,
    BerthScheduleResponse,
    BerthScheduleUpdate,
    DemurrageRecordResponse,
    VesselCreate,
    VesselResponse,
    VesselUpdate,
)

router = APIRouter()


@router.get("", response_model=dict)
async def list_vessels(
    db: DbSession,
    current_user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
    status_filter: str | None = Query(None, alias="status"),
) -> dict:
    offset = (page - 1) * per_page
    query = select(Vessel).where(Vessel.deleted_at.is_(None))
    count_query = select(func.count(Vessel.id)).where(Vessel.deleted_at.is_(None))

    if status_filter:
        query = query.where(Vessel.status == status_filter)
        count_query = count_query.where(Vessel.status == status_filter)

    total = (await db.execute(count_query)).scalar_one()
    result = await db.execute(query.order_by(Vessel.created_at.desc()).offset(offset).limit(per_page))
    vessels = result.scalars().unique().all()

    return {
        "data": [VesselResponse.model_validate(v) for v in vessels],
        "meta": {"page": page, "per_page": per_page, "total": total},
        "errors": None,
    }


@router.get("/{vessel_id}", response_model=dict)
async def get_vessel(vessel_id: uuid.UUID, db: DbSession, current_user: CurrentUser) -> dict:
    result = await db.execute(select(Vessel).where(Vessel.id == vessel_id))
    vessel = result.scalar_one_or_none()
    if vessel is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vessel not found")
    return {"data": VesselResponse.model_validate(vessel), "meta": None, "errors": None}


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_vessel(body: VesselCreate, db: DbSession, current_user: CurrentUser) -> dict:
    vessel = Vessel(**body.model_dump())
    db.add(vessel)
    await db.flush()
    await db.refresh(vessel)
    return {"data": VesselResponse.model_validate(vessel), "meta": None, "errors": None}


@router.patch("/{vessel_id}", response_model=dict)
async def update_vessel(
    vessel_id: uuid.UUID, body: VesselUpdate, db: DbSession, current_user: CurrentUser
) -> dict:
    result = await db.execute(select(Vessel).where(Vessel.id == vessel_id))
    vessel = result.scalar_one_or_none()
    if vessel is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vessel not found")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(vessel, field, value)
    await db.flush()
    await db.refresh(vessel)
    return {"data": VesselResponse.model_validate(vessel), "meta": None, "errors": None}


# --- Berth Schedules ---
@router.get("/{vessel_id}/berths", response_model=dict)
async def list_berth_schedules(
    vessel_id: uuid.UUID, db: DbSession, current_user: CurrentUser
) -> dict:
    result = await db.execute(
        select(BerthSchedule).where(BerthSchedule.vessel_id == vessel_id)
    )
    schedules = result.scalars().all()
    return {
        "data": [BerthScheduleResponse.model_validate(s) for s in schedules],
        "meta": None,
        "errors": None,
    }


@router.post("/berths", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_berth_schedule(
    body: BerthScheduleCreate, db: DbSession, current_user: CurrentUser
) -> dict:
    schedule = BerthSchedule(**body.model_dump())
    db.add(schedule)
    await db.flush()
    await db.refresh(schedule)
    return {"data": BerthScheduleResponse.model_validate(schedule), "meta": None, "errors": None}


@router.patch("/berths/{schedule_id}", response_model=dict)
async def update_berth_schedule(
    schedule_id: uuid.UUID, body: BerthScheduleUpdate, db: DbSession, current_user: CurrentUser
) -> dict:
    result = await db.execute(select(BerthSchedule).where(BerthSchedule.id == schedule_id))
    schedule = result.scalar_one_or_none()
    if schedule is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Berth schedule not found")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(schedule, field, value)
    await db.flush()
    await db.refresh(schedule)
    return {"data": BerthScheduleResponse.model_validate(schedule), "meta": None, "errors": None}


# --- Demurrage ---
@router.get("/{vessel_id}/demurrage", response_model=dict)
async def list_demurrage(
    vessel_id: uuid.UUID, db: DbSession, current_user: CurrentUser
) -> dict:
    result = await db.execute(
        select(DemurrageRecord).where(DemurrageRecord.vessel_id == vessel_id)
    )
    records = result.scalars().all()
    return {
        "data": [DemurrageRecordResponse.model_validate(r) for r in records],
        "meta": None,
        "errors": None,
    }
