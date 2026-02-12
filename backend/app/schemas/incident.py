import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.core.constants import IncidentSeverity, IncidentStatus, IncidentType


class IncidentCreate(BaseModel):
    title: str = Field(max_length=500)
    incident_type: IncidentType
    severity: IncidentSeverity = IncidentSeverity.MEDIUM
    description: str | None = None
    asset_id: uuid.UUID | None = None
    location_lat: float | None = None
    location_lon: float | None = None
    detected_at: datetime
    sla_deadline: datetime | None = None


class IncidentUpdate(BaseModel):
    title: str | None = None
    severity: IncidentSeverity | None = None
    status: IncidentStatus | None = None
    description: str | None = None
    assigned_to_id: uuid.UUID | None = None
    root_cause: str | None = None
    corrective_action: str | None = None


class IncidentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, frozen=True)

    id: uuid.UUID
    title: str
    incident_type: IncidentType
    severity: IncidentSeverity
    status: IncidentStatus
    description: str | None
    asset_id: uuid.UUID | None
    location_lat: float | None
    location_lon: float | None
    assigned_to_id: uuid.UUID | None
    detected_at: datetime
    sla_deadline: datetime | None
    closed_at: datetime | None
    root_cause: str | None
    corrective_action: str | None
    created_at: datetime
    updated_at: datetime


class SOPChecklistResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, frozen=True)

    id: uuid.UUID
    incident_id: uuid.UUID
    step_number: int
    description: str
    is_completed: bool
    completed_by_id: uuid.UUID | None
    completed_at: datetime | None


class EvidenceAttachmentCreate(BaseModel):
    incident_id: uuid.UUID
    file_url: str
    file_type: str
    description: str | None = None


class EvidenceAttachmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, frozen=True)

    id: uuid.UUID
    incident_id: uuid.UUID
    file_url: str
    file_type: str
    description: str | None
    uploaded_by_id: uuid.UUID | None
    created_at: datetime
