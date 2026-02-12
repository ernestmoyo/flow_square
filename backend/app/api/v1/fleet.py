import uuid

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select

from app.api.deps import CurrentUser, DbSession
from app.models.fleet import EPod, GeofenceZone, Trip, Vehicle
from app.schemas.fleet import (
    EPodCreate,
    EPodResponse,
    GeofenceZoneCreate,
    GeofenceZoneResponse,
    TripCreate,
    TripResponse,
    TripUpdate,
    VehicleCreate,
    VehicleResponse,
    VehicleUpdate,
)

router = APIRouter()


# --- Vehicles ---
@router.get("/vehicles", response_model=dict)
async def list_vehicles(
    db: DbSession,
    current_user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
    status_filter: str | None = Query(None, alias="status"),
) -> dict:
    offset = (page - 1) * per_page
    query = select(Vehicle).where(Vehicle.deleted_at.is_(None))
    count_query = select(func.count(Vehicle.id)).where(Vehicle.deleted_at.is_(None))

    if status_filter:
        query = query.where(Vehicle.status == status_filter)
        count_query = count_query.where(Vehicle.status == status_filter)

    total = (await db.execute(count_query)).scalar_one()
    result = await db.execute(
        query.order_by(Vehicle.registration_number).offset(offset).limit(per_page)
    )
    vehicles = result.scalars().unique().all()

    return {
        "data": [VehicleResponse.model_validate(v) for v in vehicles],
        "meta": {"page": page, "per_page": per_page, "total": total},
        "errors": None,
    }


@router.get("/vehicles/{vehicle_id}", response_model=dict)
async def get_vehicle(
    vehicle_id: uuid.UUID, db: DbSession, current_user: CurrentUser
) -> dict:
    result = await db.execute(select(Vehicle).where(Vehicle.id == vehicle_id))
    vehicle = result.scalar_one_or_none()
    if vehicle is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
    return {"data": VehicleResponse.model_validate(vehicle), "meta": None, "errors": None}


@router.post("/vehicles", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_vehicle(
    body: VehicleCreate, db: DbSession, current_user: CurrentUser
) -> dict:
    vehicle = Vehicle(**body.model_dump())
    db.add(vehicle)
    await db.flush()
    await db.refresh(vehicle)
    return {"data": VehicleResponse.model_validate(vehicle), "meta": None, "errors": None}


@router.patch("/vehicles/{vehicle_id}", response_model=dict)
async def update_vehicle(
    vehicle_id: uuid.UUID, body: VehicleUpdate, db: DbSession, current_user: CurrentUser
) -> dict:
    result = await db.execute(select(Vehicle).where(Vehicle.id == vehicle_id))
    vehicle = result.scalar_one_or_none()
    if vehicle is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(vehicle, field, value)
    await db.flush()
    await db.refresh(vehicle)
    return {"data": VehicleResponse.model_validate(vehicle), "meta": None, "errors": None}


# --- Trips ---
@router.get("/trips", response_model=dict)
async def list_trips(
    db: DbSession,
    current_user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
    status_filter: str | None = Query(None, alias="status"),
    vehicle_id: uuid.UUID | None = None,
) -> dict:
    offset = (page - 1) * per_page
    query = select(Trip)
    count_query = select(func.count(Trip.id))

    if status_filter:
        query = query.where(Trip.status == status_filter)
        count_query = count_query.where(Trip.status == status_filter)
    if vehicle_id:
        query = query.where(Trip.vehicle_id == vehicle_id)
        count_query = count_query.where(Trip.vehicle_id == vehicle_id)

    total = (await db.execute(count_query)).scalar_one()
    result = await db.execute(
        query.order_by(Trip.created_at.desc()).offset(offset).limit(per_page)
    )
    trips = result.scalars().all()

    return {
        "data": [TripResponse.model_validate(t) for t in trips],
        "meta": {"page": page, "per_page": per_page, "total": total},
        "errors": None,
    }


@router.post("/trips", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_trip(body: TripCreate, db: DbSession, current_user: CurrentUser) -> dict:
    trip = Trip(**body.model_dump())
    db.add(trip)
    await db.flush()
    await db.refresh(trip)
    return {"data": TripResponse.model_validate(trip), "meta": None, "errors": None}


@router.patch("/trips/{trip_id}", response_model=dict)
async def update_trip(
    trip_id: uuid.UUID, body: TripUpdate, db: DbSession, current_user: CurrentUser
) -> dict:
    result = await db.execute(select(Trip).where(Trip.id == trip_id))
    trip = result.scalar_one_or_none()
    if trip is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(trip, field, value)
    await db.flush()
    await db.refresh(trip)
    return {"data": TripResponse.model_validate(trip), "meta": None, "errors": None}


# --- ePOD ---
@router.post("/epod", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_epod(body: EPodCreate, db: DbSession, current_user: CurrentUser) -> dict:
    epod = EPod(**body.model_dump())
    db.add(epod)
    await db.flush()
    await db.refresh(epod)
    return {"data": EPodResponse.model_validate(epod), "meta": None, "errors": None}


@router.get("/epod/{trip_id}", response_model=dict)
async def get_epod(trip_id: uuid.UUID, db: DbSession, current_user: CurrentUser) -> dict:
    result = await db.execute(select(EPod).where(EPod.trip_id == trip_id))
    epod = result.scalar_one_or_none()
    if epod is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="ePOD not found")
    return {"data": EPodResponse.model_validate(epod), "meta": None, "errors": None}


# --- Geofence Zones ---
@router.get("/geofences", response_model=dict)
async def list_geofences(db: DbSession, current_user: CurrentUser) -> dict:
    result = await db.execute(
        select(GeofenceZone).where(GeofenceZone.is_active.is_(True))
    )
    zones = result.scalars().all()
    return {
        "data": [GeofenceZoneResponse.model_validate(z) for z in zones],
        "meta": None,
        "errors": None,
    }


@router.post("/geofences", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_geofence(
    body: GeofenceZoneCreate, db: DbSession, current_user: CurrentUser
) -> dict:
    zone = GeofenceZone(**body.model_dump())
    db.add(zone)
    await db.flush()
    await db.refresh(zone)
    return {"data": GeofenceZoneResponse.model_validate(zone), "meta": None, "errors": None}
