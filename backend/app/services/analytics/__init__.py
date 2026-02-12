from abc import ABC, abstractmethod
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.analytics import TimeRange


class AnalyticsProduct(ABC):
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    @abstractmethod
    async def compute(self, asset_id: uuid.UUID, time_range: TimeRange) -> dict:
        ...

    @abstractmethod
    def get_thresholds(self) -> dict:
        ...
