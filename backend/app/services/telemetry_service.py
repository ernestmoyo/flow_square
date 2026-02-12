import uuid
from datetime import datetime

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import QualityFlag
from app.models.telemetry import TelemetryReading
from app.schemas.telemetry import (
    TelemetryIngestResponse,
    TelemetryPoint,
    TelemetryQueryResponse,
    TelemetryReadingResponse,
)


class TelemetryService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def ingest(self, readings: list[TelemetryPoint]) -> TelemetryIngestResponse:
        ingested = 0
        rejected = 0
        errors: list[str] = []

        for reading in readings:
            try:
                record = TelemetryReading(
                    tag_id=reading.tag_id,
                    time=reading.time,
                    value=reading.value,
                    quality=reading.quality,
                    raw_value=reading.raw_value,
                    source=reading.source,
                )
                self.db.add(record)
                ingested += 1
            except Exception as e:
                rejected += 1
                errors.append(f"Tag {reading.tag_id}: {str(e)}")

        if ingested > 0:
            await self.db.flush()

        return TelemetryIngestResponse(
            ingested=ingested, rejected=rejected, errors=errors
        )

    async def query(
        self,
        tag_ids: list[uuid.UUID],
        start: datetime,
        end: datetime,
        downsample: str | None = None,
    ) -> list[TelemetryQueryResponse]:
        results = []

        for tag_id in tag_ids:
            if downsample:
                interval = self._parse_downsample(downsample)
                query = text(
                    """
                    SELECT time_bucket(:interval, time) AS bucket,
                           tag_id,
                           avg(value) AS value,
                           mode() WITHIN GROUP (ORDER BY quality) AS quality
                    FROM telemetry_readings
                    WHERE tag_id = :tag_id AND time >= :start AND time <= :end
                    GROUP BY bucket, tag_id
                    ORDER BY bucket
                    """
                )
                result = await self.db.execute(
                    query,
                    {"interval": interval, "tag_id": str(tag_id), "start": start, "end": end},
                )
                rows = result.fetchall()
                readings = [
                    TelemetryReadingResponse(
                        tag_id=tag_id,
                        time=row.bucket,
                        value=row.value,
                        quality=row.quality,
                        raw_value=None,
                        source=None,
                    )
                    for row in rows
                ]
            else:
                result = await self.db.execute(
                    select(TelemetryReading)
                    .where(
                        TelemetryReading.tag_id == tag_id,
                        TelemetryReading.time >= start,
                        TelemetryReading.time <= end,
                    )
                    .order_by(TelemetryReading.time)
                )
                rows = result.scalars().all()
                readings = [TelemetryReadingResponse.model_validate(r) for r in rows]

            results.append(
                TelemetryQueryResponse(tag_id=tag_id, readings=readings, count=len(readings))
            )

        return results

    async def get_latest(self, tag_id: uuid.UUID) -> TelemetryReadingResponse | None:
        result = await self.db.execute(
            select(TelemetryReading)
            .where(TelemetryReading.tag_id == tag_id)
            .order_by(TelemetryReading.time.desc())
            .limit(1)
        )
        reading = result.scalar_one_or_none()
        if reading is None:
            return None
        return TelemetryReadingResponse.model_validate(reading)

    @staticmethod
    def _parse_downsample(downsample: str) -> str:
        mapping = {
            "1m": "1 minute",
            "5m": "5 minutes",
            "15m": "15 minutes",
            "1h": "1 hour",
            "6h": "6 hours",
            "1d": "1 day",
        }
        return mapping.get(downsample, "5 minutes")
