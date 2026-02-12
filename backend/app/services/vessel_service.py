import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.models.vessel import BerthSchedule, Vessel


class VesselService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_vessel(self, vessel_id: uuid.UUID) -> Vessel:
        result = await self.db.execute(select(Vessel).where(Vessel.id == vessel_id))
        vessel = result.scalar_one_or_none()
        if vessel is None:
            raise NotFoundException("Vessel", str(vessel_id))
        return vessel

    async def get_active_discharges(self) -> list[BerthSchedule]:
        result = await self.db.execute(
            select(BerthSchedule)
            .join(Vessel)
            .where(Vessel.status == "DISCHARGING")
            .order_by(BerthSchedule.eta.desc())
        )
        return list(result.scalars().all())

    async def calculate_demurrage(
        self, laytime_allowed: float, laytime_used: float, rate_per_day: float
    ) -> float:
        excess_hours = max(0, laytime_used - laytime_allowed)
        excess_days = excess_hours / 24.0
        return excess_days * rate_per_day
