import asyncio
from datetime import datetime, timedelta, timezone

from app.workers.celery_app import celery_app
from app.core.logging import get_logger

logger = get_logger(__name__)


@celery_app.task(name="app.workers.telemetry_tasks.check_stale_tags")
def check_stale_tags() -> dict:
    return asyncio.get_event_loop().run_until_complete(_check_stale_tags())


async def _check_stale_tags() -> dict:
    from sqlalchemy import select, func
    from app.database import async_session_factory
    from app.models.asset import Tag
    from app.models.telemetry import TelemetryReading
    from app.core.constants import QualityFlag

    stale_threshold = datetime.now(timezone.utc) - timedelta(minutes=10)
    flagged_count = 0

    async with async_session_factory() as session:
        # Find tags with no recent readings
        result = await session.execute(
            select(Tag).where(Tag.deleted_at.is_(None), Tag.quality_flag != QualityFlag.BAD)
        )
        tags = result.scalars().all()

        for tag in tags:
            latest = await session.execute(
                select(func.max(TelemetryReading.time)).where(
                    TelemetryReading.tag_id == tag.id
                )
            )
            last_reading_time = latest.scalar_one_or_none()

            if last_reading_time and last_reading_time < stale_threshold:
                tag.quality_flag = QualityFlag.BAD
                flagged_count += 1
                logger.warning(
                    "stale_tag_flagged",
                    tag_id=str(tag.id),
                    tag_name=tag.name,
                    last_reading=str(last_reading_time),
                )

        await session.commit()

    logger.info("stale_tag_check_complete", flagged_count=flagged_count)
    return {"flagged_count": flagged_count}


@celery_app.task(name="app.workers.telemetry_tasks.flag_noisy_sensors")
def flag_noisy_sensors(tag_id: str, window_minutes: int = 60) -> dict:
    return asyncio.get_event_loop().run_until_complete(
        _flag_noisy_sensors(tag_id, window_minutes)
    )


async def _flag_noisy_sensors(tag_id_str: str, window_minutes: int) -> dict:
    import uuid
    from sqlalchemy import select, func
    from app.database import async_session_factory
    from app.models.asset import Tag
    from app.models.telemetry import TelemetryReading
    from app.core.constants import QualityFlag

    tag_id = uuid.UUID(tag_id_str)
    window_start = datetime.now(timezone.utc) - timedelta(minutes=window_minutes)

    async with async_session_factory() as session:
        stats = await session.execute(
            select(
                func.avg(TelemetryReading.value),
                func.stddev(TelemetryReading.value),
            ).where(
                TelemetryReading.tag_id == tag_id,
                TelemetryReading.time >= window_start,
            )
        )
        row = stats.one()
        avg_val = row[0]
        std_dev = row[1]

        if avg_val is not None and std_dev is not None and std_dev > 3 * abs(avg_val) * 0.01:
            # Standard deviation exceeds 3σ — flag as UNCERTAIN
            tag_result = await session.execute(select(Tag).where(Tag.id == tag_id))
            tag = tag_result.scalar_one_or_none()
            if tag:
                tag.quality_flag = QualityFlag.UNCERTAIN
                logger.warning(
                    "noisy_sensor_flagged",
                    tag_id=tag_id_str,
                    std_dev=std_dev,
                )
                await session.commit()
                return {"status": "flagged", "std_dev": std_dev}

    return {"status": "ok"}


@celery_app.task(name="app.workers.telemetry_tasks.resync_buffered_readings")
def resync_buffered_readings(readings: list[dict]) -> dict:
    return asyncio.get_event_loop().run_until_complete(
        _resync_buffered_readings(readings)
    )


async def _resync_buffered_readings(readings: list[dict]) -> dict:
    from app.database import async_session_factory
    from app.services.telemetry_service import TelemetryService
    from app.schemas.telemetry import TelemetryPoint

    points = [TelemetryPoint(**r) for r in readings]

    async with async_session_factory() as session:
        service = TelemetryService(session)
        for point in points:
            point.source = "resync"
        result = await service.ingest(points)
        await session.commit()

    logger.info(
        "buffered_readings_resynced",
        ingested=result.ingested,
        rejected=result.rejected,
    )
    return {"ingested": result.ingested, "rejected": result.rejected}
