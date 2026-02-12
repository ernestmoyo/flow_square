import uuid

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select

from app.api.deps import CurrentUser, DbSession
from app.models.compliance import AuditLog, ComplianceReport, CustodyTransfer
from app.schemas.compliance import (
    AuditLogResponse,
    ComplianceReportCreate,
    ComplianceReportResponse,
    CustodyTransferCreate,
    CustodyTransferResponse,
)

router = APIRouter()


# --- Compliance Reports ---
@router.get("/reports", response_model=dict)
async def list_reports(
    db: DbSession,
    current_user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
    report_type: str | None = None,
) -> dict:
    offset = (page - 1) * per_page
    query = select(ComplianceReport)
    count_query = select(func.count(ComplianceReport.id))

    if report_type:
        query = query.where(ComplianceReport.report_type == report_type)
        count_query = count_query.where(ComplianceReport.report_type == report_type)

    total = (await db.execute(count_query)).scalar_one()
    result = await db.execute(
        query.order_by(ComplianceReport.created_at.desc()).offset(offset).limit(per_page)
    )
    reports = result.scalars().all()

    return {
        "data": [ComplianceReportResponse.model_validate(r) for r in reports],
        "meta": {"page": page, "per_page": per_page, "total": total},
        "errors": None,
    }


@router.post("/reports", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_report(
    body: ComplianceReportCreate, db: DbSession, current_user: CurrentUser
) -> dict:
    report = ComplianceReport(
        **body.model_dump(),
        generated_by_id=current_user.id,
    )
    db.add(report)
    await db.flush()
    await db.refresh(report)
    return {
        "data": ComplianceReportResponse.model_validate(report),
        "meta": None,
        "errors": None,
    }


@router.get("/reports/{report_id}", response_model=dict)
async def get_report(
    report_id: uuid.UUID, db: DbSession, current_user: CurrentUser
) -> dict:
    result = await db.execute(
        select(ComplianceReport).where(ComplianceReport.id == report_id)
    )
    report = result.scalar_one_or_none()
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    return {
        "data": ComplianceReportResponse.model_validate(report),
        "meta": None,
        "errors": None,
    }


# --- Audit Logs ---
@router.get("/audit", response_model=dict)
async def list_audit_logs(
    db: DbSession,
    current_user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    resource_type: str | None = None,
    user_id: uuid.UUID | None = None,
) -> dict:
    offset = (page - 1) * per_page
    query = select(AuditLog)
    count_query = select(func.count(AuditLog.id))

    if resource_type:
        query = query.where(AuditLog.resource_type == resource_type)
        count_query = count_query.where(AuditLog.resource_type == resource_type)
    if user_id:
        query = query.where(AuditLog.user_id == user_id)
        count_query = count_query.where(AuditLog.user_id == user_id)

    total = (await db.execute(count_query)).scalar_one()
    result = await db.execute(
        query.order_by(AuditLog.created_at.desc()).offset(offset).limit(per_page)
    )
    logs = result.scalars().all()

    return {
        "data": [AuditLogResponse.model_validate(log) for log in logs],
        "meta": {"page": page, "per_page": per_page, "total": total},
        "errors": None,
    }


# --- Custody Transfers ---
@router.get("/custody", response_model=dict)
async def list_custody_transfers(
    db: DbSession,
    current_user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
    batch_id: str | None = None,
) -> dict:
    offset = (page - 1) * per_page
    query = select(CustodyTransfer)
    count_query = select(func.count(CustodyTransfer.id))

    if batch_id:
        query = query.where(CustodyTransfer.batch_id == batch_id)
        count_query = count_query.where(CustodyTransfer.batch_id == batch_id)

    total = (await db.execute(count_query)).scalar_one()
    result = await db.execute(
        query.order_by(CustodyTransfer.transfer_time.desc()).offset(offset).limit(per_page)
    )
    transfers = result.scalars().all()

    return {
        "data": [CustodyTransferResponse.model_validate(t) for t in transfers],
        "meta": {"page": page, "per_page": per_page, "total": total},
        "errors": None,
    }


@router.post("/custody", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_custody_transfer(
    body: CustodyTransferCreate, db: DbSession, current_user: CurrentUser
) -> dict:
    transfer = CustodyTransfer(**body.model_dump())
    db.add(transfer)
    await db.flush()
    await db.refresh(transfer)
    return {
        "data": CustodyTransferResponse.model_validate(transfer),
        "meta": None,
        "errors": None,
    }
