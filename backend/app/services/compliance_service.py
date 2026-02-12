import uuid
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import ComplianceReportType
from app.models.compliance import AuditLog, ComplianceReport, CustodyTransfer


class ComplianceService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def generate_report(
        self,
        title: str,
        report_type: ComplianceReportType,
        period_start: datetime,
        period_end: datetime,
        generated_by_id: uuid.UUID,
        file_format: str = "PDF",
    ) -> ComplianceReport:
        report = ComplianceReport(
            title=title,
            report_type=report_type,
            period_start=period_start,
            period_end=period_end,
            generated_by_id=generated_by_id,
            file_format=file_format,
            status="GENERATED",
        )
        self.db.add(report)
        await self.db.flush()
        await self.db.refresh(report)
        return report

    async def log_audit(
        self,
        action: str,
        resource_type: str,
        resource_id: str | None = None,
        user_id: uuid.UUID | None = None,
        ip_address: str | None = None,
        old_values: dict | None = None,
        new_values: dict | None = None,
        details: str | None = None,
    ) -> AuditLog:
        log = AuditLog(
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            user_id=user_id,
            ip_address=ip_address,
            old_values=old_values,
            new_values=new_values,
            details=details,
        )
        self.db.add(log)
        await self.db.flush()
        return log

    async def get_custody_chain(self, batch_id: str) -> list[CustodyTransfer]:
        result = await self.db.execute(
            select(CustodyTransfer)
            .where(CustodyTransfer.batch_id == batch_id)
            .order_by(CustodyTransfer.transfer_time)
        )
        return list(result.scalars().all())
