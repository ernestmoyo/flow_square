import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.constants import ComplianceReportType
from app.models.base import Base, PortableJSON, TimestampMixin, UUIDMixin, UUIDType


class ComplianceReport(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "compliance_reports"

    title: Mapped[str] = mapped_column(String(500), nullable=False)
    report_type: Mapped[ComplianceReportType] = mapped_column(String(50), nullable=False)
    period_start: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    period_end: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="DRAFT")
    generated_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUIDType, ForeignKey("users.id"), nullable=True
    )
    file_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    file_format: Mapped[str | None] = mapped_column(String(20), nullable=True)
    version: Mapped[int] = mapped_column(nullable=False, default=1)
    digital_signature: Mapped[str | None] = mapped_column(Text, nullable=True)
    metadata_json: Mapped[dict | None] = mapped_column(PortableJSON, nullable=True)


class AuditLog(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "audit_logs"

    action: Mapped[str] = mapped_column(String(100), nullable=False)
    resource_type: Mapped[str] = mapped_column(String(100), nullable=False)
    resource_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUIDType, ForeignKey("users.id"), nullable=True
    )
    ip_address: Mapped[str | None] = mapped_column(String(50), nullable=True)
    old_values: Mapped[dict | None] = mapped_column(PortableJSON, nullable=True)
    new_values: Mapped[dict | None] = mapped_column(PortableJSON, nullable=True)
    details: Mapped[str | None] = mapped_column(Text, nullable=True)


class CustodyTransfer(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "custody_transfers"

    batch_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    from_entity: Mapped[str] = mapped_column(String(255), nullable=False)
    to_entity: Mapped[str] = mapped_column(String(255), nullable=False)
    product_type: Mapped[str] = mapped_column(String(100), nullable=False)
    volume_m3: Mapped[float] = mapped_column(nullable=False)
    transfer_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    from_asset_id: Mapped[uuid.UUID | None] = mapped_column(
        UUIDType, ForeignKey("assets.id"), nullable=True
    )
    to_asset_id: Mapped[uuid.UUID | None] = mapped_column(
        UUIDType, ForeignKey("assets.id"), nullable=True
    )
    measurement_method: Mapped[str | None] = mapped_column(String(100), nullable=True)
    witness_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    document_ref: Mapped[str | None] = mapped_column(String(255), nullable=True)
