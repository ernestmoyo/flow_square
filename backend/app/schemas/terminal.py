import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class TerminalCreate(BaseModel):
    name: str = Field(max_length=255)
    asset_id: uuid.UUID | None = None
    location_lat: float | None = None
    location_lon: float | None = None
    total_capacity_m3: float | None = None
    description: str | None = None


class TerminalUpdate(BaseModel):
    name: str | None = None
    location_lat: float | None = None
    location_lon: float | None = None
    total_capacity_m3: float | None = None
    description: str | None = None


class TankCreate(BaseModel):
    name: str = Field(max_length=100)
    terminal_id: uuid.UUID
    capacity_m3: float
    current_level_m3: float = 0.0
    product_type: str | None = None
    tank_group: str | None = None


class TankUpdate(BaseModel):
    name: str | None = None
    capacity_m3: float | None = None
    current_level_m3: float | None = None
    product_type: str | None = None
    tank_group: str | None = None


class TankResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, frozen=True)

    id: uuid.UUID
    name: str
    terminal_id: uuid.UUID
    capacity_m3: float
    current_level_m3: float
    product_type: str | None
    tank_group: str | None
    created_at: datetime


class TerminalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, frozen=True)

    id: uuid.UUID
    name: str
    asset_id: uuid.UUID | None
    location_lat: float | None
    location_lon: float | None
    total_capacity_m3: float | None
    description: str | None
    tanks: list[TankResponse] = []
    created_at: datetime
    updated_at: datetime


class LoadingRackResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, frozen=True)

    id: uuid.UUID
    name: str
    terminal_id: uuid.UUID
    num_bays: int
    status: str
    created_at: datetime


class GantryBayResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, frozen=True)

    id: uuid.UUID
    name: str
    loading_rack_id: uuid.UUID
    totalizer_tag_id: uuid.UUID | None
    status: str
    created_at: datetime
