import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import IncidentSeverity, IncidentStatus, IncidentType
from app.models.base import Base, PortableJSON, TimestampMixin, UUIDMixin, UUIDType


class Incident(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "incidents"

    title: Mapped[str] = mapped_column(String(500), nullable=False)
    incident_type: Mapped[IncidentType] = mapped_column(String(50), nullable=False)
    severity: Mapped[IncidentSeverity] = mapped_column(
        String(20), nullable=False, default=IncidentSeverity.MEDIUM
    )
    status: Mapped[IncidentStatus] = mapped_column(
        String(30), nullable=False, default=IncidentStatus.DETECTED
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    asset_id: Mapped[uuid.UUID | None] = mapped_column(
        UUIDType, ForeignKey("assets.id"), nullable=True
    )
    location_lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    location_lon: Mapped[float | None] = mapped_column(Float, nullable=True)
    assigned_to_id: Mapped[uuid.UUID | None] = mapped_column(
        UUIDType, ForeignKey("users.id"), nullable=True
    )
    detected_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    sla_deadline: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    closed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    root_cause: Mapped[str | None] = mapped_column(Text, nullable=True)
    corrective_action: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_data: Mapped[dict | None] = mapped_column(PortableJSON, nullable=True)

    checklists: Mapped[list["SOPChecklist"]] = relationship(
        back_populates="incident", lazy="selectin"
    )
    evidence: Mapped[list["EvidenceAttachment"]] = relationship(
        back_populates="incident", lazy="selectin"
    )


class SOPChecklist(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "sop_checklists"

    incident_id: Mapped[uuid.UUID] = mapped_column(
        UUIDType, ForeignKey("incidents.id"), nullable=False
    )
    step_number: Mapped[int] = mapped_column(Integer, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    completed_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUIDType, ForeignKey("users.id"), nullable=True
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    incident: Mapped[Incident] = relationship(back_populates="checklists")


class EvidenceAttachment(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "evidence_attachments"

    incident_id: Mapped[uuid.UUID] = mapped_column(
        UUIDType, ForeignKey("incidents.id"), nullable=False
    )
    file_url: Mapped[str] = mapped_column(String(500), nullable=False)
    file_type: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    uploaded_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUIDType, ForeignKey("users.id"), nullable=True
    )

    incident: Mapped[Incident] = relationship(back_populates="evidence")
