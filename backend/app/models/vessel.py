import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import VesselStatus
from app.models.base import Base, SoftDeleteMixin, TimestampMixin, UUIDMixin, UUIDType


class Vessel(UUIDMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "vessels"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    imo_number: Mapped[str | None] = mapped_column(String(20), unique=True, nullable=True)
    dwt: Mapped[float | None] = mapped_column(Float, nullable=True)
    flag: Mapped[str | None] = mapped_column(String(100), nullable=True)
    vessel_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    status: Mapped[VesselStatus] = mapped_column(
        String(50), nullable=False, default=VesselStatus.APPROACHING
    )

    berth_schedules: Mapped[list["BerthSchedule"]] = relationship(
        back_populates="vessel", lazy="selectin"
    )
    demurrage_records: Mapped[list["DemurrageRecord"]] = relationship(
        back_populates="vessel", lazy="selectin"
    )


class BerthSchedule(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "berth_schedules"

    vessel_id: Mapped[uuid.UUID] = mapped_column(
        UUIDType, ForeignKey("vessels.id"), nullable=False
    )
    berth_name: Mapped[str] = mapped_column(String(100), nullable=False)
    eta: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    ata: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    etd: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    atd: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    cargo_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    cargo_volume_m3: Mapped[float | None] = mapped_column(Float, nullable=True)
    bill_of_lading_volume_m3: Mapped[float | None] = mapped_column(Float, nullable=True)
    metered_volume_m3: Mapped[float | None] = mapped_column(Float, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    vessel: Mapped[Vessel] = relationship(back_populates="berth_schedules")


class DemurrageRecord(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "demurrage_records"

    vessel_id: Mapped[uuid.UUID] = mapped_column(
        UUIDType, ForeignKey("vessels.id"), nullable=False
    )
    berth_schedule_id: Mapped[uuid.UUID | None] = mapped_column(
        UUIDType, ForeignKey("berth_schedules.id"), nullable=True
    )
    laytime_hours_allowed: Mapped[float] = mapped_column(Float, nullable=False)
    laytime_hours_used: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    demurrage_rate_usd_per_day: Mapped[float] = mapped_column(Float, nullable=False)
    total_demurrage_usd: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    vessel: Mapped[Vessel] = relationship(back_populates="demurrage_records")
