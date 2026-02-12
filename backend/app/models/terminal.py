import uuid

from sqlalchemy import Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, SoftDeleteMixin, TimestampMixin, UUIDMixin, UUIDType


class Terminal(UUIDMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "terminals"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    asset_id: Mapped[uuid.UUID | None] = mapped_column(
        UUIDType, ForeignKey("assets.id"), nullable=True
    )
    location_lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    location_lon: Mapped[float | None] = mapped_column(Float, nullable=True)
    total_capacity_m3: Mapped[float | None] = mapped_column(Float, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    tanks: Mapped[list["Tank"]] = relationship(back_populates="terminal", lazy="selectin")
    loading_racks: Mapped[list["LoadingRack"]] = relationship(
        back_populates="terminal", lazy="selectin"
    )


class Tank(UUIDMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "tanks"

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    terminal_id: Mapped[uuid.UUID] = mapped_column(
        UUIDType, ForeignKey("terminals.id"), nullable=False
    )
    capacity_m3: Mapped[float] = mapped_column(Float, nullable=False)
    current_level_m3: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    product_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    tank_group: Mapped[str | None] = mapped_column(String(100), nullable=True)
    strapping_table_ref: Mapped[str | None] = mapped_column(String(255), nullable=True)

    terminal: Mapped[Terminal] = relationship(back_populates="tanks")


class LoadingRack(UUIDMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "loading_racks"

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    terminal_id: Mapped[uuid.UUID] = mapped_column(
        UUIDType, ForeignKey("terminals.id"), nullable=False
    )
    num_bays: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="ACTIVE")

    terminal: Mapped[Terminal] = relationship(back_populates="loading_racks")
    gantry_bays: Mapped[list["GantryBay"]] = relationship(
        back_populates="loading_rack", lazy="selectin"
    )


class GantryBay(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "gantry_bays"

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    loading_rack_id: Mapped[uuid.UUID] = mapped_column(
        UUIDType, ForeignKey("loading_racks.id"), nullable=False
    )
    totalizer_tag_id: Mapped[uuid.UUID | None] = mapped_column(
        UUIDType, ForeignKey("tags.id"), nullable=True
    )
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="AVAILABLE")

    loading_rack: Mapped[LoadingRack] = relationship(back_populates="gantry_bays")
