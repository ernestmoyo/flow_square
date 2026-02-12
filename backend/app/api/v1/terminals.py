import uuid

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select

from app.api.deps import CurrentUser, DbSession
from app.models.terminal import GantryBay, LoadingRack, Tank, Terminal
from app.schemas.terminal import (
    GantryBayResponse,
    LoadingRackResponse,
    TankCreate,
    TankResponse,
    TankUpdate,
    TerminalCreate,
    TerminalResponse,
    TerminalUpdate,
)

router = APIRouter()


@router.get("", response_model=dict)
async def list_terminals(
    db: DbSession,
    current_user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
) -> dict:
    offset = (page - 1) * per_page
    total = (
        await db.execute(
            select(func.count(Terminal.id)).where(Terminal.deleted_at.is_(None))
        )
    ).scalar_one()

    result = await db.execute(
        select(Terminal)
        .where(Terminal.deleted_at.is_(None))
        .order_by(Terminal.name)
        .offset(offset)
        .limit(per_page)
    )
    terminals = result.scalars().unique().all()

    return {
        "data": [TerminalResponse.model_validate(t) for t in terminals],
        "meta": {"page": page, "per_page": per_page, "total": total},
        "errors": None,
    }


@router.get("/{terminal_id}", response_model=dict)
async def get_terminal(
    terminal_id: uuid.UUID, db: DbSession, current_user: CurrentUser
) -> dict:
    result = await db.execute(select(Terminal).where(Terminal.id == terminal_id))
    terminal = result.scalar_one_or_none()
    if terminal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Terminal not found")
    return {"data": TerminalResponse.model_validate(terminal), "meta": None, "errors": None}


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_terminal(
    body: TerminalCreate, db: DbSession, current_user: CurrentUser
) -> dict:
    terminal = Terminal(**body.model_dump())
    db.add(terminal)
    await db.flush()
    await db.refresh(terminal)
    return {"data": TerminalResponse.model_validate(terminal), "meta": None, "errors": None}


@router.patch("/{terminal_id}", response_model=dict)
async def update_terminal(
    terminal_id: uuid.UUID, body: TerminalUpdate, db: DbSession, current_user: CurrentUser
) -> dict:
    result = await db.execute(select(Terminal).where(Terminal.id == terminal_id))
    terminal = result.scalar_one_or_none()
    if terminal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Terminal not found")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(terminal, field, value)
    await db.flush()
    await db.refresh(terminal)
    return {"data": TerminalResponse.model_validate(terminal), "meta": None, "errors": None}


# --- Tanks ---
@router.get("/{terminal_id}/tanks", response_model=dict)
async def list_tanks(
    terminal_id: uuid.UUID, db: DbSession, current_user: CurrentUser
) -> dict:
    result = await db.execute(
        select(Tank).where(Tank.terminal_id == terminal_id, Tank.deleted_at.is_(None))
    )
    tanks = result.scalars().all()
    return {
        "data": [TankResponse.model_validate(t) for t in tanks],
        "meta": None,
        "errors": None,
    }


@router.post("/tanks", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_tank(body: TankCreate, db: DbSession, current_user: CurrentUser) -> dict:
    tank = Tank(**body.model_dump())
    db.add(tank)
    await db.flush()
    await db.refresh(tank)
    return {"data": TankResponse.model_validate(tank), "meta": None, "errors": None}


@router.patch("/tanks/{tank_id}", response_model=dict)
async def update_tank(
    tank_id: uuid.UUID, body: TankUpdate, db: DbSession, current_user: CurrentUser
) -> dict:
    result = await db.execute(select(Tank).where(Tank.id == tank_id))
    tank = result.scalar_one_or_none()
    if tank is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tank not found")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(tank, field, value)
    await db.flush()
    await db.refresh(tank)
    return {"data": TankResponse.model_validate(tank), "meta": None, "errors": None}


# --- Loading Racks ---
@router.get("/{terminal_id}/racks", response_model=dict)
async def list_loading_racks(
    terminal_id: uuid.UUID, db: DbSession, current_user: CurrentUser
) -> dict:
    result = await db.execute(
        select(LoadingRack).where(
            LoadingRack.terminal_id == terminal_id, LoadingRack.deleted_at.is_(None)
        )
    )
    racks = result.scalars().unique().all()
    return {
        "data": [LoadingRackResponse.model_validate(r) for r in racks],
        "meta": None,
        "errors": None,
    }


# --- Gantry Bays ---
@router.get("/racks/{rack_id}/bays", response_model=dict)
async def list_gantry_bays(
    rack_id: uuid.UUID, db: DbSession, current_user: CurrentUser
) -> dict:
    result = await db.execute(
        select(GantryBay).where(GantryBay.loading_rack_id == rack_id)
    )
    bays = result.scalars().all()
    return {
        "data": [GantryBayResponse.model_validate(b) for b in bays],
        "meta": None,
        "errors": None,
    }
