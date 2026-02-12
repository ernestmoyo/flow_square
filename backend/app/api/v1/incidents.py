import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select

from app.api.deps import CurrentUser, DbSession
from app.core.constants import IncidentStatus
from app.models.incident import EvidenceAttachment, Incident, SOPChecklist
from app.schemas.incident import (
    EvidenceAttachmentCreate,
    EvidenceAttachmentResponse,
    IncidentCreate,
    IncidentResponse,
    IncidentUpdate,
    SOPChecklistResponse,
)

router = APIRouter()


@router.get("", response_model=dict)
async def list_incidents(
    db: DbSession,
    current_user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
    status_filter: str | None = Query(None, alias="status"),
    severity: str | None = None,
    asset_id: uuid.UUID | None = None,
) -> dict:
    offset = (page - 1) * per_page
    query = select(Incident)
    count_query = select(func.count(Incident.id))

    if status_filter:
        query = query.where(Incident.status == status_filter)
        count_query = count_query.where(Incident.status == status_filter)
    if severity:
        query = query.where(Incident.severity == severity)
        count_query = count_query.where(Incident.severity == severity)
    if asset_id:
        query = query.where(Incident.asset_id == asset_id)
        count_query = count_query.where(Incident.asset_id == asset_id)

    total = (await db.execute(count_query)).scalar_one()
    result = await db.execute(
        query.order_by(Incident.detected_at.desc()).offset(offset).limit(per_page)
    )
    incidents = result.scalars().unique().all()

    return {
        "data": [IncidentResponse.model_validate(i) for i in incidents],
        "meta": {"page": page, "per_page": per_page, "total": total},
        "errors": None,
    }


@router.get("/{incident_id}", response_model=dict)
async def get_incident(
    incident_id: uuid.UUID, db: DbSession, current_user: CurrentUser
) -> dict:
    result = await db.execute(select(Incident).where(Incident.id == incident_id))
    incident = result.scalar_one_or_none()
    if incident is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")
    return {"data": IncidentResponse.model_validate(incident), "meta": None, "errors": None}


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_incident(
    body: IncidentCreate, db: DbSession, current_user: CurrentUser
) -> dict:
    incident = Incident(**body.model_dump())
    db.add(incident)
    await db.flush()
    await db.refresh(incident)
    return {"data": IncidentResponse.model_validate(incident), "meta": None, "errors": None}


@router.patch("/{incident_id}", response_model=dict)
async def update_incident(
    incident_id: uuid.UUID, body: IncidentUpdate, db: DbSession, current_user: CurrentUser
) -> dict:
    result = await db.execute(select(Incident).where(Incident.id == incident_id))
    incident = result.scalar_one_or_none()
    if incident is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")

    update_data = body.model_dump(exclude_unset=True)

    if update_data.get("status") == IncidentStatus.CLOSED:
        update_data["closed_at"] = datetime.now(timezone.utc)

    for field, value in update_data.items():
        setattr(incident, field, value)

    await db.flush()
    await db.refresh(incident)
    return {"data": IncidentResponse.model_validate(incident), "meta": None, "errors": None}


# --- SOP Checklists ---
@router.get("/{incident_id}/checklists", response_model=dict)
async def list_checklists(
    incident_id: uuid.UUID, db: DbSession, current_user: CurrentUser
) -> dict:
    result = await db.execute(
        select(SOPChecklist)
        .where(SOPChecklist.incident_id == incident_id)
        .order_by(SOPChecklist.step_number)
    )
    checklists = result.scalars().all()
    return {
        "data": [SOPChecklistResponse.model_validate(c) for c in checklists],
        "meta": None,
        "errors": None,
    }


@router.patch("/checklists/{checklist_id}/complete", response_model=dict)
async def complete_checklist_step(
    checklist_id: uuid.UUID, db: DbSession, current_user: CurrentUser
) -> dict:
    result = await db.execute(select(SOPChecklist).where(SOPChecklist.id == checklist_id))
    checklist = result.scalar_one_or_none()
    if checklist is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Checklist step not found"
        )

    checklist.is_completed = True
    checklist.completed_by_id = current_user.id
    checklist.completed_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(checklist)
    return {"data": SOPChecklistResponse.model_validate(checklist), "meta": None, "errors": None}


# --- Evidence ---
@router.post("/evidence", response_model=dict, status_code=status.HTTP_201_CREATED)
async def upload_evidence(
    body: EvidenceAttachmentCreate, db: DbSession, current_user: CurrentUser
) -> dict:
    evidence = EvidenceAttachment(
        **body.model_dump(), uploaded_by_id=current_user.id
    )
    db.add(evidence)
    await db.flush()
    await db.refresh(evidence)
    return {"data": EvidenceAttachmentResponse.model_validate(evidence), "meta": None, "errors": None}


@router.get("/{incident_id}/evidence", response_model=dict)
async def list_evidence(
    incident_id: uuid.UUID, db: DbSession, current_user: CurrentUser
) -> dict:
    result = await db.execute(
        select(EvidenceAttachment).where(EvidenceAttachment.incident_id == incident_id)
    )
    evidence_list = result.scalars().all()
    return {
        "data": [EvidenceAttachmentResponse.model_validate(e) for e in evidence_list],
        "meta": None,
        "errors": None,
    }
