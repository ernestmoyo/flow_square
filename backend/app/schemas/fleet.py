import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.core.constants import TripStatus


class VehicleCreate(BaseModel):
    registration_number: str = Field(max_length=50)
    asset_id: uuid.UUID | None = None
    driver_name: str | None = None
    driver_phone: str | None = None
    capacity_litres: float | None = None
    compartments: int | None = None


class VehicleUpdate(BaseModel):
    driver_name: str | None = None
    driver_phone: str | None = None
    capacity_litres: float | None = None
    compartments: int | None = None
    current_lat: float | None = None
    current_lon: float | None = None
    status: str | None = None


class VehicleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, frozen=True)

    id: uuid.UUID
    registration_number: str
    asset_id: uuid.UUID | None
    driver_name: str | None
    driver_phone: str | None
    capacity_litres: float | None
    compartments: int | None
    current_lat: float | None
    current_lon: float | None
    last_gps_time: datetime | None
    status: str
    created_at: datetime


class TripCreate(BaseModel):
    vehicle_id: uuid.UUID
    origin_terminal_id: uuid.UUID | None = None
    destination_name: str = Field(max_length=255)
    destination_lat: float | None = None
    destination_lon: float | None = None
    loaded_volume_litres: float | None = None
    gantry_metered_litres: float | None = None
    ticket_number: str | None = None


class TripUpdate(BaseModel):
    status: TripStatus | None = None
    loaded_volume_litres: float | None = None
    gantry_metered_litres: float | None = None
    departure_time: datetime | None = None
    arrival_time: datetime | None = None
    ticket_number: str | None = None


class TripResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, frozen=True)

    id: uuid.UUID
    vehicle_id: uuid.UUID
    origin_terminal_id: uuid.UUID | None
    destination_name: str
    destination_lat: float | None
    destination_lon: float | None
    status: TripStatus
    loaded_volume_litres: float | None
    gantry_metered_litres: float | None
    departure_time: datetime | None
    arrival_time: datetime | None
    ticket_number: str | None
    created_at: datetime


class EPodCreate(BaseModel):
    trip_id: uuid.UUID
    delivered_volume_litres: float
    receiver_name: str | None = None
    delivery_time: datetime | None = None
    notes: str | None = None


class EPodResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, frozen=True)

    id: uuid.UUID
    trip_id: uuid.UUID
    delivered_volume_litres: float
    receiver_name: str | None
    delivery_time: datetime | None
    is_verified: bool
    notes: str | None
    created_at: datetime


class GeofenceZoneCreate(BaseModel):
    name: str = Field(max_length=255)
    zone_type: str
    center_lat: float
    center_lon: float
    radius_meters: float | None = None
    polygon: dict | None = None


class GeofenceZoneResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, frozen=True)

    id: uuid.UUID
    name: str
    zone_type: str
    center_lat: float
    center_lon: float
    radius_meters: float | None
    polygon: dict | None
    is_active: bool
    created_at: datetime
