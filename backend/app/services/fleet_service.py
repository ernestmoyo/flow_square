import uuid
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.models.fleet import EPod, GeofenceZone, Trip, Vehicle
from app.utils.geofence import point_in_circle


class FleetService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_vehicle(self, vehicle_id: uuid.UUID) -> Vehicle:
        result = await self.db.execute(select(Vehicle).where(Vehicle.id == vehicle_id))
        vehicle = result.scalar_one_or_none()
        if vehicle is None:
            raise NotFoundException("Vehicle", str(vehicle_id))
        return vehicle

    async def update_vehicle_position(
        self, vehicle_id: uuid.UUID, lat: float, lon: float, timestamp: datetime
    ) -> Vehicle:
        vehicle = await self.get_vehicle(vehicle_id)
        vehicle.current_lat = lat
        vehicle.current_lon = lon
        vehicle.last_gps_time = timestamp
        await self.db.flush()
        return vehicle

    async def check_geofence(self, lat: float, lon: float) -> list[GeofenceZone]:
        result = await self.db.execute(
            select(GeofenceZone).where(GeofenceZone.is_active.is_(True))
        )
        zones = result.scalars().all()

        matching_zones = []
        for zone in zones:
            if zone.radius_meters and point_in_circle(
                lat, lon, zone.center_lat, zone.center_lon, zone.radius_meters
            ):
                matching_zones.append(zone)
        return matching_zones

    async def verify_epod(self, trip_id: uuid.UUID) -> dict:
        trip_result = await self.db.execute(select(Trip).where(Trip.id == trip_id))
        trip = trip_result.scalar_one_or_none()
        if trip is None:
            raise NotFoundException("Trip", str(trip_id))

        epod_result = await self.db.execute(select(EPod).where(EPod.trip_id == trip_id))
        epod = epod_result.scalar_one_or_none()
        if epod is None:
            raise NotFoundException("ePOD", str(trip_id))

        variance_litres = abs(
            (trip.gantry_metered_litres or 0) - epod.delivered_volume_litres
        )
        gantry = trip.gantry_metered_litres or 0
        variance_pct = (variance_litres / gantry * 100) if gantry > 0 else 0

        return {
            "trip_id": str(trip_id),
            "gantry_metered_litres": trip.gantry_metered_litres,
            "delivered_volume_litres": epod.delivered_volume_litres,
            "variance_litres": variance_litres,
            "variance_pct": variance_pct,
            "is_within_tolerance": variance_pct <= 1.5,
        }
