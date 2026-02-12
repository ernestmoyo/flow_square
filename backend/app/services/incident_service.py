import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import IncidentSeverity, IncidentStatus, IncidentType
from app.core.exceptions import NotFoundException
from app.models.incident import Incident, SOPChecklist


# SOP templates per incident type
SOP_TEMPLATES: dict[IncidentType, list[str]] = {
    IncidentType.LEAK_ALARM: [
        "Confirm alarm is not a false positive (check redundant sensors)",
        "Isolate affected pipeline section if confirmed",
        "Notify HSE team and site supervisor",
        "Dispatch field crew for visual inspection",
        "Document findings with photos and GPS coordinates",
        "Implement temporary containment measures",
        "Report to regulatory authority if threshold exceeded",
    ],
    IncidentType.QUALITY_DEVIATION: [
        "Confirm deviation with lab re-test",
        "Isolate affected product batch",
        "Notify quality control and terminal manager",
        "Trace batch through custody chain",
        "Determine root cause",
        "Implement corrective measures",
    ],
    IncidentType.SAFETY_THRESHOLD: [
        "Trigger emergency response if necessary",
        "Evacuate area if required by safety protocol",
        "Notify HSE and site management",
        "Document all readings and circumstances",
        "Conduct preliminary investigation",
        "File regulatory report if required",
    ],
    IncidentType.RECONCILIATION_EXCEPTION: [
        "Review variance data and source measurements",
        "Check meter calibration records",
        "Cross-reference with manual dip readings",
        "Investigate potential causes (temperature, meter drift, etc.)",
        "Document findings and resolution",
    ],
    IncidentType.METER_TAMPER: [
        "Secure the meter and surrounding area",
        "Notify security and management",
        "Document physical condition with photos",
        "Request independent calibration check",
        "Review CCTV footage if available",
        "File report with relevant authorities",
    ],
    IncidentType.GEOFENCE_BREACH: [
        "Contact driver immediately",
        "Verify vehicle location via backup GPS",
        "Document deviation from planned route",
        "Assess if product integrity compromised",
        "Report to fleet management",
    ],
}


class IncidentService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create_incident(
        self,
        title: str,
        incident_type: IncidentType,
        severity: IncidentSeverity,
        detected_at: datetime,
        description: str | None = None,
        asset_id: uuid.UUID | None = None,
        location_lat: float | None = None,
        location_lon: float | None = None,
        sla_hours: int = 24,
    ) -> Incident:
        sla_deadline = datetime.now(timezone.utc).replace(
            hour=datetime.now(timezone.utc).hour + sla_hours
        ) if sla_hours else None

        incident = Incident(
            title=title,
            incident_type=incident_type,
            severity=severity,
            status=IncidentStatus.DETECTED,
            description=description,
            asset_id=asset_id,
            location_lat=location_lat,
            location_lon=location_lon,
            detected_at=detected_at,
            sla_deadline=sla_deadline,
        )
        self.db.add(incident)
        await self.db.flush()
        await self.db.refresh(incident)

        # Auto-create SOP checklist
        sop_steps = SOP_TEMPLATES.get(incident_type, [])
        for i, step_desc in enumerate(sop_steps, start=1):
            checklist = SOPChecklist(
                incident_id=incident.id,
                step_number=i,
                description=step_desc,
            )
            self.db.add(checklist)

        await self.db.flush()
        return incident

    async def get_incident(self, incident_id: uuid.UUID) -> Incident:
        result = await self.db.execute(select(Incident).where(Incident.id == incident_id))
        incident = result.scalar_one_or_none()
        if incident is None:
            raise NotFoundException("Incident", str(incident_id))
        return incident

    async def close_incident(
        self, incident_id: uuid.UUID, root_cause: str, corrective_action: str
    ) -> Incident:
        incident = await self.get_incident(incident_id)
        incident.status = IncidentStatus.CLOSED
        incident.closed_at = datetime.now(timezone.utc)
        incident.root_cause = root_cause
        incident.corrective_action = corrective_action
        await self.db.flush()
        await self.db.refresh(incident)
        return incident
