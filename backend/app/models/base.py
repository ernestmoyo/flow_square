import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, JSON, String, TypeDecorator, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

from app.config import settings


class GUID(TypeDecorator):
    """Platform-independent UUID type.

    Uses PostgreSQL's UUID type when available, otherwise stores as String(36).
    Automatically converts between Python uuid.UUID and string representation.
    """

    impl = String(36)
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is not None:
            if isinstance(value, uuid.UUID):
                return str(value)
            return value
        return value

    def process_result_value(self, value, dialect):
        if value is not None:
            if not isinstance(value, uuid.UUID):
                return uuid.UUID(value)
        return value


# Portable types
if settings.DB_ENGINE == "sqlite":
    UUIDType = GUID()
    PortableJSON = JSON
else:
    from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID

    UUIDType = PG_UUID(as_uuid=True)
    PortableJSON = JSONB


class Base(DeclarativeBase):
    pass


class UUIDMixin:
    id: Mapped[uuid.UUID] = mapped_column(
        GUID() if settings.DB_ENGINE == "sqlite" else UUIDType,
        primary_key=True,
        default=uuid.uuid4,
    )


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class SoftDeleteMixin:
    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True, default=None
    )
