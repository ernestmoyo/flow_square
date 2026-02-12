import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import ReconciliationNode, ReconciliationStatus
from app.models.base import Base, PortableJSON, TimestampMixin, UUIDMixin, UUIDType


class ReconciliationRun(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "reconciliation_runs"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[ReconciliationStatus] = mapped_column(
        String(30), nullable=False, default=ReconciliationStatus.PENDING
    )
    run_type: Mapped[str] = mapped_column(String(50), nullable=False)
    period_start: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    period_end: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    asset_id: Mapped[uuid.UUID | None] = mapped_column(
        UUIDType, ForeignKey("assets.id"), nullable=True
    )
    triggered_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUIDType, ForeignKey("users.id"), nullable=True
    )
    total_expected_m3: Mapped[float | None] = mapped_column(Float, nullable=True)
    total_actual_m3: Mapped[float | None] = mapped_column(Float, nullable=True)
    total_variance_pct: Mapped[float | None] = mapped_column(Float, nullable=True)
    tolerance_threshold_pct: Mapped[float] = mapped_column(Float, nullable=False, default=1.5)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    variance_records: Mapped[list["VarianceRecord"]] = relationship(
        back_populates="reconciliation_run", lazy="selectin"
    )


class VarianceRecord(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "variance_records"

    reconciliation_run_id: Mapped[uuid.UUID] = mapped_column(
        UUIDType, ForeignKey("reconciliation_runs.id"), nullable=False
    )
    node: Mapped[ReconciliationNode] = mapped_column(String(30), nullable=False)
    expected_volume_m3: Mapped[float] = mapped_column(Float, nullable=False)
    actual_volume_m3: Mapped[float] = mapped_column(Float, nullable=False)
    variance_m3: Mapped[float] = mapped_column(Float, nullable=False)
    variance_pct: Mapped[float] = mapped_column(Float, nullable=False)
    is_exception: Mapped[bool] = mapped_column(nullable=False, default=False)
    asset_id: Mapped[uuid.UUID | None] = mapped_column(
        UUIDType, ForeignKey("assets.id"), nullable=True
    )
    reference_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    fraud_checks: Mapped[dict | None] = mapped_column(PortableJSON, nullable=True)

    reconciliation_run: Mapped[ReconciliationRun] = relationship(
        back_populates="variance_records"
    )
