import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.core.constants import ReconciliationNode, ReconciliationStatus


class ReconciliationRunCreate(BaseModel):
    name: str = Field(max_length=255)
    run_type: str = "MANUAL"
    period_start: datetime
    period_end: datetime
    asset_id: uuid.UUID | None = None
    tolerance_threshold_pct: float = 1.5


class ReconciliationRunResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, frozen=True)

    id: uuid.UUID
    name: str
    status: ReconciliationStatus
    run_type: str
    period_start: datetime
    period_end: datetime
    asset_id: uuid.UUID | None
    triggered_by_id: uuid.UUID | None
    total_expected_m3: float | None
    total_actual_m3: float | None
    total_variance_pct: float | None
    tolerance_threshold_pct: float
    summary: str | None
    completed_at: datetime | None
    created_at: datetime
    updated_at: datetime
    variance_records: list["VarianceRecordResponse"] = []


class VarianceRecordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, frozen=True)

    id: uuid.UUID
    reconciliation_run_id: uuid.UUID
    node: ReconciliationNode
    expected_volume_m3: float
    actual_volume_m3: float
    variance_m3: float
    variance_pct: float
    is_exception: bool
    asset_id: uuid.UUID | None
    reference_id: str | None
    notes: str | None
    fraud_checks: dict | None
    created_at: datetime


class ReconciliationTriggerRequest(BaseModel):
    name: str
    period_start: datetime
    period_end: datetime
    asset_id: uuid.UUID | None = None
    tolerance_threshold_pct: float = 1.5
