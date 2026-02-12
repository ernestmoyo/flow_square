import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.core.constants import AssetType, QualityFlag, SystemType


# --- Tag ---
class TagCreate(BaseModel):
    name: str = Field(max_length=255)
    unit: str = Field(max_length=20)
    low_limit: float | None = None
    high_limit: float | None = None
    calibration_date: datetime | None = None
    quality_flag: QualityFlag = QualityFlag.GOOD
    description: str | None = None
    system_id: uuid.UUID


class TagUpdate(BaseModel):
    name: str | None = None
    unit: str | None = None
    low_limit: float | None = None
    high_limit: float | None = None
    calibration_date: datetime | None = None
    quality_flag: QualityFlag | None = None
    description: str | None = None


class TagResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, frozen=True)

    id: uuid.UUID
    name: str
    unit: str
    low_limit: float | None
    high_limit: float | None
    calibration_date: datetime | None
    quality_flag: QualityFlag
    description: str | None
    system_id: uuid.UUID
    created_at: datetime


# --- System ---
class SystemCreate(BaseModel):
    name: str = Field(max_length=255)
    system_type: SystemType
    description: str | None = None
    asset_id: uuid.UUID


class SystemUpdate(BaseModel):
    name: str | None = None
    system_type: SystemType | None = None
    description: str | None = None


class SystemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, frozen=True)

    id: uuid.UUID
    name: str
    system_type: SystemType
    description: str | None
    asset_id: uuid.UUID
    tags: list[TagResponse] = []
    created_at: datetime


# --- Asset ---
class AssetCreate(BaseModel):
    name: str = Field(max_length=255)
    asset_type: AssetType
    description: str | None = None
    location_lat: float | None = None
    location_lon: float | None = None
    capacity_m3: float | None = None


class AssetUpdate(BaseModel):
    name: str | None = None
    asset_type: AssetType | None = None
    description: str | None = None
    location_lat: float | None = None
    location_lon: float | None = None
    capacity_m3: float | None = None


class AssetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, frozen=True)

    id: uuid.UUID
    name: str
    asset_type: AssetType
    description: str | None
    location_lat: float | None
    location_lon: float | None
    capacity_m3: float | None
    systems: list[SystemResponse] = []
    created_at: datetime
    updated_at: datetime
