import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.core.constants import VesselStatus


class VesselCreate(BaseModel):
    name: str = Field(max_length=255)
    imo_number: str | None = None
    dwt: float | None = None
    flag: str | None = None
    vessel_type: str | None = None
    status: VesselStatus = VesselStatus.APPROACHING


class VesselUpdate(BaseModel):
    name: str | None = None
    imo_number: str | None = None
    dwt: float | None = None
    flag: str | None = None
    vessel_type: str | None = None
    status: VesselStatus | None = None


class VesselResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, frozen=True)

    id: uuid.UUID
    name: str
    imo_number: str | None
    dwt: float | None
    flag: str | None
    vessel_type: str | None
    status: VesselStatus
    created_at: datetime
    updated_at: datetime


class BerthScheduleCreate(BaseModel):
    vessel_id: uuid.UUID
    berth_name: str = Field(max_length=100)
    eta: datetime
    etd: datetime | None = None
    cargo_type: str | None = None
    cargo_volume_m3: float | None = None
    bill_of_lading_volume_m3: float | None = None
    notes: str | None = None


class BerthScheduleUpdate(BaseModel):
    berth_name: str | None = None
    eta: datetime | None = None
    ata: datetime | None = None
    etd: datetime | None = None
    atd: datetime | None = None
    cargo_type: str | None = None
    cargo_volume_m3: float | None = None
    bill_of_lading_volume_m3: float | None = None
    metered_volume_m3: float | None = None
    notes: str | None = None


class BerthScheduleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, frozen=True)

    id: uuid.UUID
    vessel_id: uuid.UUID
    berth_name: str
    eta: datetime
    ata: datetime | None
    etd: datetime | None
    atd: datetime | None
    cargo_type: str | None
    cargo_volume_m3: float | None
    bill_of_lading_volume_m3: float | None
    metered_volume_m3: float | None
    notes: str | None
    created_at: datetime


class DemurrageRecordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, frozen=True)

    id: uuid.UUID
    vessel_id: uuid.UUID
    berth_schedule_id: uuid.UUID | None
    laytime_hours_allowed: float
    laytime_hours_used: float
    demurrage_rate_usd_per_day: float
    total_demurrage_usd: float
    notes: str | None
    created_at: datetime
