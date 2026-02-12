import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.models.terminal import Tank, Terminal


class TerminalService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_terminal(self, terminal_id: uuid.UUID) -> Terminal:
        result = await self.db.execute(select(Terminal).where(Terminal.id == terminal_id))
        terminal = result.scalar_one_or_none()
        if terminal is None:
            raise NotFoundException("Terminal", str(terminal_id))
        return terminal

    async def get_tank_inventory(self, terminal_id: uuid.UUID) -> list[dict]:
        result = await self.db.execute(
            select(Tank).where(
                Tank.terminal_id == terminal_id, Tank.deleted_at.is_(None)
            )
        )
        tanks = result.scalars().all()
        return [
            {
                "tank_id": str(tank.id),
                "name": tank.name,
                "capacity_m3": tank.capacity_m3,
                "current_level_m3": tank.current_level_m3,
                "utilization_pct": (
                    (tank.current_level_m3 / tank.capacity_m3 * 100)
                    if tank.capacity_m3 > 0
                    else 0
                ),
                "product_type": tank.product_type,
            }
            for tank in tanks
        ]

    async def update_tank_level(self, tank_id: uuid.UUID, new_level_m3: float) -> Tank:
        result = await self.db.execute(select(Tank).where(Tank.id == tank_id))
        tank = result.scalar_one_or_none()
        if tank is None:
            raise NotFoundException("Tank", str(tank_id))

        tank.current_level_m3 = new_level_m3
        await self.db.flush()
        await self.db.refresh(tank)
        return tank
