import asyncio
from datetime import datetime, timedelta, timezone

from app.workers.celery_app import celery_app
from app.core.logging import get_logger

logger = get_logger(__name__)


@celery_app.task(name="app.workers.reconciliation_tasks.run_daily_reconciliation")
def run_daily_reconciliation() -> dict:
    return asyncio.get_event_loop().run_until_complete(_run_daily_reconciliation())


async def _run_daily_reconciliation() -> dict:
    from app.database import async_session_factory
    from app.services.reconciliation_service import ReconciliationService

    now = datetime.now(timezone.utc)
    period_end = now.replace(hour=0, minute=0, second=0, microsecond=0)
    period_start = period_end - timedelta(days=1)

    async with async_session_factory() as session:
        service = ReconciliationService(session)
        run = await service.trigger_reconciliation(
            name=f"Daily Reconciliation {period_start.date()}",
            period_start=period_start,
            period_end=period_end,
        )
        await session.commit()

        logger.info(
            "daily_reconciliation_complete",
            run_id=str(run.id),
            status=run.status,
        )
        return {"run_id": str(run.id), "status": run.status}


@celery_app.task(name="app.workers.reconciliation_tasks.run_reconciliation")
def run_reconciliation(
    name: str,
    period_start: str,
    period_end: str,
    asset_id: str | None = None,
    tolerance_pct: float = 1.5,
    triggered_by_id: str | None = None,
) -> dict:
    return asyncio.get_event_loop().run_until_complete(
        _run_reconciliation(name, period_start, period_end, asset_id, tolerance_pct, triggered_by_id)
    )


async def _run_reconciliation(
    name: str,
    period_start_str: str,
    period_end_str: str,
    asset_id: str | None,
    tolerance_pct: float,
    triggered_by_id: str | None,
) -> dict:
    import uuid
    from app.database import async_session_factory
    from app.services.reconciliation_service import ReconciliationService

    period_start = datetime.fromisoformat(period_start_str)
    period_end = datetime.fromisoformat(period_end_str)

    async with async_session_factory() as session:
        service = ReconciliationService(session)
        run = await service.trigger_reconciliation(
            name=name,
            period_start=period_start,
            period_end=period_end,
            asset_id=uuid.UUID(asset_id) if asset_id else None,
            tolerance_threshold_pct=tolerance_pct,
            triggered_by_id=uuid.UUID(triggered_by_id) if triggered_by_id else None,
        )
        await session.commit()
        return {"run_id": str(run.id), "status": run.status}
