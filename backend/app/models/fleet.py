import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import TripStatus
from app.models.base import Base, PortableJSON, SoftDeleteMixin, TimestampMixin, UUIDMixin, UUIDType


class Vehicle(UUIDMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "vehicles"

    registration_number: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False
    )
    asset_id: Mapped[uuid.UUID | None] = mapped_column(
        UUIDType, ForeignKey("assets.id"), nullable=True
    )
    driver_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    driver_phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    capacity_litres: Mapped[float | None] = mapped_column(Float, nullable=True)
    compartments: Mapped[int | None] = mapped_column(nullable=True)
    current_lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    current_lon: Mapped[float | None] = mapped_column(Float, nullable=True)
    last_gps_time: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="IDLE")

    trips: Mapped[list["Trip"]] = relationship(back_populates="vehicle", lazy="selectin")


class Trip(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "trips"

    vehicle_id: Mapped[uuid.UUID] = mapped_column(
        UUIDType, ForeignKey("vehicles.id"), nullable=False
    )
    origin_terminal_id: Mapped[uuid.UUID | None] = mapped_column(
        UUIDType, ForeignKey("terminals.id"), nullable=True
    )
    destination_name: Mapped[str] = mapped_column(String(255), nullable=False)
    destination_lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    destination_lon: Mapped[float | None] = mapped_column(Float, nullable=True)
    status: Mapped[TripStatus] = mapped_column(
        String(50), nullable=False, default=TripStatus.SCHEDULED
    )
    loaded_volume_litres: Mapped[float | None] = mapped_column(Float, nullable=True)
    gantry_metered_litres: Mapped[float | None] = mapped_column(Float, nullable=True)
    departure_time: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    arrival_time: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    planned_route: Mapped[dict | None] = mapped_column(PortableJSON, nullable=True)
    actual_route: Mapped[dict | None] = mapped_column(PortableJSON, nullable=True)
    ticket_number: Mapped[str | None] = mapped_column(String(100), nullable=True)

    vehicle: Mapped[Vehicle] = relationship(back_populates="trips")
    epod: Mapped["EPod | None"] = relationship(back_populates="trip", uselist=False)


class EPod(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "epods"

    trip_id: Mapped[uuid.UUID] = mapped_column(
        UUIDType, ForeignKey("trips.id"), unique=True, nullable=False
    )
    delivered_volume_litres: Mapped[float] = mapped_column(Float, nullable=False)
    receiver_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    receiver_signature: Mapped[str | None] = mapped_column(Text, nullable=True)
    delivery_time: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    photo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    trip: Mapped[Trip] = relationship(back_populates="epod")


class GeofenceZone(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "geofence_zones"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    zone_type: Mapped[str] = mapped_column(String(50), nullable=False)
    center_lat: Mapped[float] = mapped_column(Float, nullable=False)
    center_lon: Mapped[float] = mapped_column(Float, nullable=False)
    radius_meters: Mapped[float | None] = mapped_column(Float, nullable=True)
    polygon: Mapped[dict | None] = mapped_column(PortableJSON, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
