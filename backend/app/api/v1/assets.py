import uuid

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select

from app.api.deps import CurrentUser, DbSession
from app.models.asset import Asset, System, Tag
from app.schemas.asset import (
    AssetCreate,
    AssetResponse,
    AssetUpdate,
    SystemCreate,
    SystemResponse,
    SystemUpdate,
    TagCreate,
    TagResponse,
    TagUpdate,
)

router = APIRouter()


# --- Assets ---
@router.get("", response_model=dict)
async def list_assets(
    db: DbSession,
    current_user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
    asset_type: str | None = None,
) -> dict:
    offset = (page - 1) * per_page
    query = select(Asset).where(Asset.deleted_at.is_(None))
    count_query = select(func.count(Asset.id)).where(Asset.deleted_at.is_(None))

    if asset_type:
        query = query.where(Asset.asset_type == asset_type)
        count_query = count_query.where(Asset.asset_type == asset_type)

    total = (await db.execute(count_query)).scalar_one()
    result = await db.execute(
        query.order_by(Asset.name).offset(offset).limit(per_page)
    )
    assets = result.scalars().unique().all()

    return {
        "data": [AssetResponse.model_validate(a) for a in assets],
        "meta": {"page": page, "per_page": per_page, "total": total},
        "errors": None,
    }


@router.get("/{asset_id}", response_model=dict)
async def get_asset(asset_id: uuid.UUID, db: DbSession, current_user: CurrentUser) -> dict:
    result = await db.execute(select(Asset).where(Asset.id == asset_id))
    asset = result.scalar_one_or_none()
    if asset is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")
    return {"data": AssetResponse.model_validate(asset), "meta": None, "errors": None}


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_asset(body: AssetCreate, db: DbSession, current_user: CurrentUser) -> dict:
    asset = Asset(**body.model_dump())
    db.add(asset)
    await db.flush()
    await db.refresh(asset)
    return {"data": AssetResponse.model_validate(asset), "meta": None, "errors": None}


@router.patch("/{asset_id}", response_model=dict)
async def update_asset(
    asset_id: uuid.UUID, body: AssetUpdate, db: DbSession, current_user: CurrentUser
) -> dict:
    result = await db.execute(select(Asset).where(Asset.id == asset_id))
    asset = result.scalar_one_or_none()
    if asset is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(asset, field, value)

    await db.flush()
    await db.refresh(asset)
    return {"data": AssetResponse.model_validate(asset), "meta": None, "errors": None}


@router.delete("/{asset_id}", response_model=dict)
async def delete_asset(
    asset_id: uuid.UUID, db: DbSession, current_user: CurrentUser
) -> dict:
    from datetime import datetime, timezone

    result = await db.execute(select(Asset).where(Asset.id == asset_id))
    asset = result.scalar_one_or_none()
    if asset is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")

    asset.deleted_at = datetime.now(timezone.utc)
    await db.flush()
    return {"data": {"message": "Asset soft-deleted"}, "meta": None, "errors": None}


# --- Systems ---
@router.get("/{asset_id}/systems", response_model=dict)
async def list_systems(
    asset_id: uuid.UUID, db: DbSession, current_user: CurrentUser
) -> dict:
    result = await db.execute(
        select(System).where(System.asset_id == asset_id, System.deleted_at.is_(None))
    )
    systems = result.scalars().unique().all()
    return {
        "data": [SystemResponse.model_validate(s) for s in systems],
        "meta": None,
        "errors": None,
    }


@router.post("/systems", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_system(body: SystemCreate, db: DbSession, current_user: CurrentUser) -> dict:
    system = System(**body.model_dump())
    db.add(system)
    await db.flush()
    await db.refresh(system)
    return {"data": SystemResponse.model_validate(system), "meta": None, "errors": None}


@router.patch("/systems/{system_id}", response_model=dict)
async def update_system(
    system_id: uuid.UUID, body: SystemUpdate, db: DbSession, current_user: CurrentUser
) -> dict:
    result = await db.execute(select(System).where(System.id == system_id))
    system = result.scalar_one_or_none()
    if system is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="System not found")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(system, field, value)

    await db.flush()
    await db.refresh(system)
    return {"data": SystemResponse.model_validate(system), "meta": None, "errors": None}


# --- Tags ---
@router.get("/tags/search", response_model=dict)
async def search_tags(
    db: DbSession,
    current_user: CurrentUser,
    q: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=100),
) -> dict:
    result = await db.execute(
        select(Tag)
        .where(Tag.name.ilike(f"%{q}%"), Tag.deleted_at.is_(None))
        .limit(limit)
    )
    tags = result.scalars().all()
    return {
        "data": [TagResponse.model_validate(t) for t in tags],
        "meta": None,
        "errors": None,
    }


@router.post("/tags", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_tag(body: TagCreate, db: DbSession, current_user: CurrentUser) -> dict:
    tag = Tag(**body.model_dump())
    db.add(tag)
    await db.flush()
    await db.refresh(tag)
    return {"data": TagResponse.model_validate(tag), "meta": None, "errors": None}


@router.patch("/tags/{tag_id}", response_model=dict)
async def update_tag(
    tag_id: uuid.UUID, body: TagUpdate, db: DbSession, current_user: CurrentUser
) -> dict:
    result = await db.execute(select(Tag).where(Tag.id == tag_id))
    tag = result.scalar_one_or_none()
    if tag is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(tag, field, value)

    await db.flush()
    await db.refresh(tag)
    return {"data": TagResponse.model_validate(tag), "meta": None, "errors": None}
