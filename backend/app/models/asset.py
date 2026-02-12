import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import AssetType, QualityFlag, SystemType
from app.models.base import Base, SoftDeleteMixin, TimestampMixin, UUIDMixin, UUIDType


class Asset(UUIDMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "assets"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    asset_type: Mapped[AssetType] = mapped_column(String(50), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    location_lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    location_lon: Mapped[float | None] = mapped_column(Float, nullable=True)
    capacity_m3: Mapped[float | None] = mapped_column(Float, nullable=True)
    path: Mapped[str | None] = mapped_column(String(1000), nullable=True)  # ltree path

    systems: Mapped[list["System"]] = relationship(back_populates="asset", lazy="selectin")


class System(UUIDMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "systems"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    system_type: Mapped[SystemType] = mapped_column(String(50), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    asset_id: Mapped[uuid.UUID] = mapped_column(
        UUIDType, ForeignKey("assets.id"), nullable=False
    )
    path: Mapped[str | None] = mapped_column(String(1000), nullable=True)

    asset: Mapped[Asset] = relationship(back_populates="systems")
    tags: Mapped[list["Tag"]] = relationship(back_populates="system", lazy="selectin")


class Tag(UUIDMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "tags"

    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    unit: Mapped[str] = mapped_column(String(20), nullable=False)
    low_limit: Mapped[float | None] = mapped_column(Float, nullable=True)
    high_limit: Mapped[float | None] = mapped_column(Float, nullable=True)
    calibration_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    quality_flag: Mapped[QualityFlag] = mapped_column(
        String(20), nullable=False, default=QualityFlag.GOOD
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    system_id: Mapped[uuid.UUID] = mapped_column(
        UUIDType, ForeignKey("systems.id"), nullable=False
    )
    path: Mapped[str | None] = mapped_column(String(1000), nullable=True)

    system: Mapped[System] = relationship(back_populates="tags")
