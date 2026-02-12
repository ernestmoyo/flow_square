import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import AdminUser, CurrentUser, DbSession
from app.core.security import hash_password
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserUpdate

router = APIRouter()


@router.get("", response_model=dict)
async def list_users(
    db: DbSession,
    current_user: AdminUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
) -> dict:
    offset = (page - 1) * per_page
    count_result = await db.execute(select(func.count(User.id)).where(User.deleted_at.is_(None)))
    total = count_result.scalar_one()

    result = await db.execute(
        select(User)
        .where(User.deleted_at.is_(None))
        .order_by(User.created_at.desc())
        .offset(offset)
        .limit(per_page)
    )
    users = result.scalars().all()

    return {
        "data": [UserResponse.model_validate(u) for u in users],
        "meta": {"page": page, "per_page": per_page, "total": total},
        "errors": None,
    }


@router.get("/{user_id}", response_model=dict)
async def get_user(user_id: uuid.UUID, db: DbSession, current_user: CurrentUser) -> dict:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return {"data": UserResponse.model_validate(user), "meta": None, "errors": None}


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_user(body: UserCreate, db: DbSession, current_user: AdminUser) -> dict:
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"User with email '{body.email}' already exists",
        )

    user = User(
        email=body.email,
        hashed_password=hash_password(body.password),
        full_name=body.full_name,
        role=body.role,
        phone=body.phone,
        department=body.department,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return {"data": UserResponse.model_validate(user), "meta": None, "errors": None}


@router.patch("/{user_id}", response_model=dict)
async def update_user(
    user_id: uuid.UUID, body: UserUpdate, db: DbSession, current_user: AdminUser
) -> dict:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    await db.flush()
    await db.refresh(user)
    return {"data": UserResponse.model_validate(user), "meta": None, "errors": None}


@router.delete("/{user_id}", response_model=dict)
async def delete_user(
    user_id: uuid.UUID, db: DbSession, current_user: AdminUser
) -> dict:
    from datetime import datetime, timezone

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.deleted_at = datetime.now(timezone.utc)
    await db.flush()
    return {"data": {"message": "User soft-deleted"}, "meta": None, "errors": None}
