import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class TimeRange(BaseModel):
    start: datetime
    end: datetime


class UFGIndexResult(BaseModel):
    model_config = ConfigDict(frozen=True)

    asset_id: uuid.UUID
    period_start: datetime
    period_end: datetime
    receipts_m3: float
    dispatches_m3: float
    tank_variance_m3: float
    ufg_m3: float
    ufg_pct: float
    node_breakdown: list[dict] = []


class LeakProbabilityResult(BaseModel):
    model_config = ConfigDict(frozen=True)

    asset_id: uuid.UUID
    segment_id: str | None
    score: float  # 0-100
    delta_pressure: float | None
    delta_flow: float | None
    acoustic_signal: float | None
    row_patrol_flag: bool = False
    computed_at: datetime


class MeterDriftResult(BaseModel):
    model_config = ConfigDict(frozen=True)

    tag_id: uuid.UUID
    drift_pct: float
    reference_value: float
    actual_value: float
    control_chart_status: str  # IN_CONTROL, WARNING, OUT_OF_CONTROL
    computed_at: datetime


class FraudScoreResult(BaseModel):
    model_config = ConfigDict(frozen=True)

    trip_id: uuid.UUID
    score: float  # 0-100
    flags: list[str]  # e.g., ["SHORT_LOAD", "OFF_ROUTE"]
    short_load_detected: bool
    ghost_trip_detected: bool
    duplicate_ticket: bool
    off_route: bool
    computed_at: datetime


class IntegrityHealthResult(BaseModel):
    model_config = ConfigDict(frozen=True)

    asset_id: uuid.UUID
    segment_id: str | None
    cp_compliance_pct: float
    corrosion_risk_score: float
    wall_thickness_mm: float | None
    last_inspection_date: datetime | None
    risk_category: str  # LOW, MEDIUM, HIGH, CRITICAL
    computed_at: datetime


class PredictiveMaintenanceResult(BaseModel):
    model_config = ConfigDict(frozen=True)

    asset_id: uuid.UUID
    equipment_tag: str
    remaining_useful_life_hours: float
    confidence_pct: float
    vibration_trend: str  # STABLE, INCREASING, CRITICAL
    temperature_trend: str
    runtime_hours: float
    computed_at: datetime


class AnalyticsSummary(BaseModel):
    model_config = ConfigDict(frozen=True)

    ufg_index: UFGIndexResult | None = None
    leak_probability: list[LeakProbabilityResult] = []
    meter_drift: list[MeterDriftResult] = []
    fraud_scores: list[FraudScoreResult] = []
    integrity_health: list[IntegrityHealthResult] = []
    predictive_maintenance: list[PredictiveMaintenanceResult] = []
