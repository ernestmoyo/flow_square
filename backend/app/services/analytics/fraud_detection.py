import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.models.fleet import EPod, GeofenceZone, Trip
from app.schemas.analytics import FraudScoreResult, TimeRange
from app.services.analytics import AnalyticsProduct
from app.utils.geofence import point_in_circle


class FraudDetectionService(AnalyticsProduct):
    def get_thresholds(self) -> dict:
        return {
            "low_risk": 25,
            "medium_risk": 50,
            "high_risk": 75,
        }

    async def compute(
        self, asset_id: uuid.UUID, time_range: TimeRange
    ) -> list[FraudScoreResult]:
        result = await self.db.execute(
            select(Trip)
            .where(
                Trip.departure_time >= time_range.start,
                Trip.departure_time <= time_range.end,
            )
        )
        trips = result.scalars().all()
        results = []
        for trip in trips:
            score_result = await self.compute_for_trip(trip.id)
            results.append(score_result)
        return results

    async def compute_for_trip(self, trip_id: uuid.UUID) -> FraudScoreResult:
        result = await self.db.execute(select(Trip).where(Trip.id == trip_id))
        trip = result.scalar_one_or_none()
        if trip is None:
            raise NotFoundException("Trip", str(trip_id))

        flags: list[str] = []
        score = 0.0

        # Check 1: Short-loading detection
        short_load = False
        epod_result = await self.db.execute(select(EPod).where(EPod.trip_id == trip_id))
        epod = epod_result.scalar_one_or_none()
        if epod and trip.gantry_metered_litres:
            if trip.gantry_metered_litres < epod.delivered_volume_litres:
                short_load = True
                flags.append("SHORT_LOAD")
                score += 30

        # Check 2: Ghost trip detection
        ghost_trip = trip.arrival_time is None and epod is not None and epod.delivered_volume_litres > 0
        if ghost_trip:
            flags.append("GHOST_TRIP")
            score += 40

        # Check 3: Duplicate ticket
        duplicate = False
        if trip.ticket_number:
            dup_result = await self.db.execute(
                select(Trip).where(
                    Trip.ticket_number == trip.ticket_number,
                    Trip.id != trip_id,
                )
            )
            if dup_result.scalar_one_or_none() is not None:
                duplicate = True
                flags.append("DUPLICATE_TICKET")
                score += 25

        # Check 4: Off-route detection
        off_route = False
        if trip.destination_lat and trip.destination_lon:
            zone_result = await self.db.execute(
                select(GeofenceZone).where(GeofenceZone.is_active.is_(True))
            )
            zones = zone_result.scalars().all()
            in_any_zone = any(
                zone.radius_meters
                and point_in_circle(
                    trip.destination_lat, trip.destination_lon,
                    zone.center_lat, zone.center_lon, zone.radius_meters
                )
                for zone in zones
            )
            if not in_any_zone and zones:
                off_route = True
                flags.append("OFF_ROUTE")
                score += 20

        score = min(score, 100)

        return FraudScoreResult(
            trip_id=trip_id,
            score=score,
            flags=flags,
            short_load_detected=short_load,
            ghost_trip_detected=ghost_trip,
            duplicate_ticket=duplicate,
            off_route=off_route,
            computed_at=datetime.now(timezone.utc),
        )
