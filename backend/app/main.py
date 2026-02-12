from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.core.exceptions import (
    FlowSquareException,
    flowsquare_exception_handler,
    http_exception_handler,
)
from app.core.logging import setup_logging
from app.api.v1.router import api_v1_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    setup_logging()

    # Redis is optional for local dev
    if settings.REDIS_ENABLED:
        import redis.asyncio as aioredis

        app.state.redis = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
    else:
        app.state.redis = None

    # Auto-create tables when using SQLite (dev convenience)
    if settings.DB_ENGINE == "sqlite":
        from app.database import engine
        from app.models.base import Base
        import app.models  # noqa: F401 — ensure all models are imported

        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    yield

    if settings.REDIS_ENABLED and app.state.redis:
        await app.state.redis.close()


app = FastAPI(
    title=settings.APP_NAME,
    description="Port-to-Pump Digital Platform for Oil & Gas Value Chain",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
app.add_exception_handler(FlowSquareException, flowsquare_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)

# API v1 routes
app.include_router(api_v1_router, prefix=settings.API_V1_PREFIX)


@app.get("/health")
async def health_check() -> dict:
    return {"status": "healthy", "service": settings.APP_NAME}


@app.get("/ready")
async def readiness_check() -> dict:
    checks: dict[str, str] = {}
    try:
        from app.database import engine

        async with engine.connect() as conn:
            await conn.execute(__import__("sqlalchemy").text("SELECT 1"))
        checks["database"] = "ok"
    except Exception:
        checks["database"] = "error"

    if settings.REDIS_ENABLED and app.state.redis:
        try:
            await app.state.redis.ping()
            checks["redis"] = "ok"
        except Exception:
            checks["redis"] = "error"
    else:
        checks["redis"] = "skipped"

    all_ok = all(v in ("ok", "skipped") for v in checks.values())
    return {"status": "ready" if all_ok else "degraded", "checks": checks}
