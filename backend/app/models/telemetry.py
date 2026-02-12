import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.constants import QualityFlag, TelemetrySource
from app.models.base import Base, UUIDType


class TelemetryReading(Base):
    __tablename__ = "telemetry_readings"

    # Composite primary key: (tag_id, time) for TimescaleDB hypertable
    tag_id: Mapped[uuid.UUID] = mapped_column(
        UUIDType, primary_key=True, nullable=False
    )
    time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), primary_key=True, nullable=False
    )
    value: Mapped[float] = mapped_column(Float, nullable=False)
    quality: Mapped[QualityFlag] = mapped_column(
        String(20), nullable=False, default=QualityFlag.GOOD
    )
    raw_value: Mapped[float | None] = mapped_column(Float, nullable=True)
    source: Mapped[str | None] = mapped_column(String(50), nullable=True)
