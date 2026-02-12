"""Shared test fixtures."""

import asyncio
from collections.abc import AsyncGenerator
from uuid import uuid4

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.config import settings
from app.database import get_db
from app.main import app
from app.models.base import Base
from app.core.security import hash_password

# Use a test database
TEST_DATABASE_URL = settings.async_database_url.replace(
    settings.POSTGRES_DB, f"{settings.POSTGRES_DB}_test"
)

engine_test = create_async_engine(TEST_DATABASE_URL, echo=False)
async_session_test = async_sessionmaker(engine_test, class_=AsyncSession, expire_on_commit=False)


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_test() as session:
        yield session

    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def admin_token(client: AsyncClient, db_session: AsyncSession) -> str:
    """Create admin user and return JWT token."""
    from app.models.user import User

    user = User(
        id=uuid4(),
        email="admin@test.com",
        full_name="Test Admin",
        hashed_password=hash_password("testpass123"),
        role="platform_admin",
        is_active=True,
    )
    db_session.add(user)
    await db_session.commit()

    resp = await client.post("/api/v1/auth/login", json={
        "email": "admin@test.com",
        "password": "testpass123",
    })
    return resp.json()["data"]["access_token"]


@pytest_asyncio.fixture
async def operator_token(client: AsyncClient, db_session: AsyncSession) -> str:
    """Create operator user and return JWT token."""
    from app.models.user import User

    user = User(
        id=uuid4(),
        email="operator@test.com",
        full_name="Test Operator",
        hashed_password=hash_password("testpass123"),
        role="control_room_operator",
        is_active=True,
    )
    db_session.add(user)
    await db_session.commit()

    resp = await client.post("/api/v1/auth/login", json={
        "email": "operator@test.com",
        "password": "testpass123",
    })
    return resp.json()["data"]["access_token"]


@pytest_asyncio.fixture
async def sample_asset(db_session: AsyncSession):
    """Create a sample asset hierarchy."""
    from app.models.asset import Asset, System, Tag

    asset = Asset(
        id=uuid4(),
        name="Test Terminal",
        asset_type="terminal",
        location="Test Location",
        latitude=-6.8,
        longitude=39.28,
    )
    db_session.add(asset)
    await db_session.flush()

    system = System(
        id=uuid4(),
        asset_id=asset.id,
        name="Flow Metering",
        system_type="metering",
    )
    db_session.add(system)
    await db_session.flush()

    tag = Tag(
        id=uuid4(),
        system_id=system.id,
        name="FT-001",
        unit="m\u00b3/h",
        quality_flag="GOOD",
    )
    db_session.add(tag)
    await db_session.commit()

    return {"asset": asset, "system": system, "tag": tag}
