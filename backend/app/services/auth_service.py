import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AuthenticationException, DuplicateException, NotFoundException
from app.core.security import create_access_token, create_refresh_token, hash_password, verify_password
from app.models.user import User
from app.schemas.user import TokenResponse, UserCreate


class AuthService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def register(self, body: UserCreate) -> User:
        existing = await self.db.execute(select(User).where(User.email == body.email))
        if existing.scalar_one_or_none() is not None:
            raise DuplicateException("User", "email", body.email)

        user = User(
            email=body.email,
            hashed_password=hash_password(body.password),
            full_name=body.full_name,
            role=body.role,
            phone=body.phone,
            department=body.department,
        )
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)
        return user

    async def authenticate(self, email: str, password: str) -> TokenResponse:
        result = await self.db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

        if user is None or not verify_password(password, user.hashed_password):
            raise AuthenticationException("Invalid email or password")

        if not user.is_active:
            raise AuthenticationException("Account is disabled")

        access_token = create_access_token(
            subject=str(user.id), extra_claims={"role": user.role}
        )
        refresh_token = create_refresh_token(subject=str(user.id))

        return TokenResponse(access_token=access_token, refresh_token=refresh_token)

    async def get_user_by_id(self, user_id: uuid.UUID) -> User:
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if user is None:
            raise NotFoundException("User", str(user_id))
        return user
