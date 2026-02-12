import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.core.constants import ComplianceReportType


class ComplianceReportCreate(BaseModel):
    title: str = Field(max_length=500)
    report_type: ComplianceReportType
    period_start: datetime
    period_end: datetime
    file_format: str = "PDF"


class ComplianceReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, frozen=True)

    id: uuid.UUID
    title: str
    report_type: ComplianceReportType
    period_start: datetime
    period_end: datetime
    status: str
    generated_by_id: uuid.UUID | None
    file_url: str | None
    file_format: str | None
    version: int
    created_at: datetime
    updated_at: datetime


class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, frozen=True)

    id: uuid.UUID
    action: str
    resource_type: str
    resource_id: str | None
    user_id: uuid.UUID | None
    ip_address: str | None
    old_values: dict | None
    new_values: dict | None
    details: str | None
    created_at: datetime


class CustodyTransferCreate(BaseModel):
    batch_id: str
    from_entity: str
    to_entity: str
    product_type: str
    volume_m3: float
    transfer_time: datetime
    from_asset_id: uuid.UUID | None = None
    to_asset_id: uuid.UUID | None = None
    measurement_method: str | None = None
    witness_name: str | None = None
    document_ref: str | None = None


class CustodyTransferResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, frozen=True)

    id: uuid.UUID
    batch_id: str
    from_entity: str
    to_entity: str
    product_type: str
    volume_m3: float
    transfer_time: datetime
    from_asset_id: uuid.UUID | None
    to_asset_id: uuid.UUID | None
    measurement_method: str | None
    witness_name: str | None
    document_ref: str | None
    created_at: datetime
