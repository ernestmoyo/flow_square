import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.core.constants import QualityFlag


class TelemetryPoint(BaseModel):
    tag_id: uuid.UUID
    time: datetime
    value: float
    quality: QualityFlag = QualityFlag.GOOD
    raw_value: float | None = None
    source: str | None = None


class TelemetryIngestRequest(BaseModel):
    readings: list[TelemetryPoint] = Field(max_length=10000)


class TelemetryIngestResponse(BaseModel):
    model_config = ConfigDict(frozen=True)

    ingested: int
    rejected: int
    errors: list[str] = []


class TelemetryQueryParams(BaseModel):
    tag_ids: list[uuid.UUID]
    start: datetime
    end: datetime
    downsample: str | None = None  # e.g., "1m", "5m", "1h"
    quality_filter: QualityFlag | None = None


class TelemetryReadingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, frozen=True)

    tag_id: uuid.UUID
    time: datetime
    value: float
    quality: QualityFlag
    raw_value: float | None
    source: str | None


class TelemetryQueryResponse(BaseModel):
    model_config = ConfigDict(frozen=True)

    tag_id: uuid.UUID
    readings: list[TelemetryReadingResponse]
    count: int
