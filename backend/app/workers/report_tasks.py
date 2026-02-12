import asyncio
from datetime import datetime, timedelta, timezone

from app.workers.celery_app import celery_app
from app.core.logging import get_logger

logger = get_logger(__name__)


@celery_app.task(name="app.workers.report_tasks.generate_monthly_compliance")
def generate_monthly_compliance() -> dict:
    return asyncio.get_event_loop().run_until_complete(_generate_monthly_compliance())


async def _generate_monthly_compliance() -> dict:
    from app.database import async_session_factory
    from app.services.compliance_service import ComplianceService
    from app.core.constants import ComplianceReportType

    now = datetime.now(timezone.utc)
    period_end = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    period_start = (period_end - timedelta(days=1)).replace(day=1)

    async with async_session_factory() as session:
        service = ComplianceService(session)
        report = await service.generate_report(
            title=f"Monthly Compliance Report - {period_start.strftime('%B %Y')}",
            report_type=ComplianceReportType.MONTHLY_COMPLIANCE,
            period_start=period_start,
            period_end=period_end,
            generated_by_id=None,  # System-generated
            file_format="PDF",
        )
        await session.commit()

        logger.info(
            "monthly_compliance_generated",
            report_id=str(report.id),
            period=period_start.strftime("%Y-%m"),
        )
        return {"report_id": str(report.id), "status": report.status}


@celery_app.task(name="app.workers.report_tasks.generate_report")
def generate_report(
    title: str,
    report_type: str,
    period_start: str,
    period_end: str,
    generated_by_id: str | None = None,
    file_format: str = "PDF",
) -> dict:
    return asyncio.get_event_loop().run_until_complete(
        _generate_report(title, report_type, period_start, period_end, generated_by_id, file_format)
    )


async def _generate_report(
    title: str,
    report_type: str,
    period_start_str: str,
    period_end_str: str,
    generated_by_id: str | None,
    file_format: str,
) -> dict:
    import uuid
    from app.database import async_session_factory
    from app.services.compliance_service import ComplianceService
    from app.core.constants import ComplianceReportType

    async with async_session_factory() as session:
        service = ComplianceService(session)
        report = await service.generate_report(
            title=title,
            report_type=ComplianceReportType(report_type),
            period_start=datetime.fromisoformat(period_start_str),
            period_end=datetime.fromisoformat(period_end_str),
            generated_by_id=uuid.UUID(generated_by_id) if generated_by_id else None,
            file_format=file_format,
        )
        await session.commit()
        return {"report_id": str(report.id), "status": report.status}
