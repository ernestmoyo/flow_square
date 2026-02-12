import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import (
    IncidentSeverity,
    IncidentType,
    ReconciliationNode,
    ReconciliationStatus,
)
from app.models.fleet import EPod, Trip
from app.models.reconciliation import ReconciliationRun, VarianceRecord
from app.models.terminal import Tank
from app.models.vessel import BerthSchedule
from app.services.incident_service import IncidentService


class ReconciliationService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def trigger_reconciliation(
        self,
        name: str,
        period_start: datetime,
        period_end: datetime,
        asset_id: uuid.UUID | None = None,
        tolerance_threshold_pct: float = 1.5,
        triggered_by_id: uuid.UUID | None = None,
    ) -> ReconciliationRun:
        run = ReconciliationRun(
            name=name,
            status=ReconciliationStatus.IN_PROGRESS,
            run_type="MANUAL",
            period_start=period_start,
            period_end=period_end,
            asset_id=asset_id,
            tolerance_threshold_pct=tolerance_threshold_pct,
            triggered_by_id=triggered_by_id,
        )
        self.db.add(run)
        await self.db.flush()
        await self.db.refresh(run)

        # Run reconciliation checks
        await self._reconcile_vessel_discharge(run, period_start, period_end)
        await self._reconcile_tank_receipts(run, period_start, period_end)
        await self._reconcile_gantry_loading(run, period_start, period_end)
        await self._reconcile_delivery_epod(run, period_start, period_end)

        # Calculate totals
        await self._compute_totals(run)

        # Run anti-fraud checks
        await self._run_fraud_checks(run, period_start, period_end)

        # Auto-close or flag as exception
        has_exceptions = any(
            vr.is_exception for vr in run.variance_records
        )
        if has_exceptions:
            run.status = ReconciliationStatus.EXCEPTION
            # Create incident for exceptions
            incident_service = IncidentService(self.db)
            await incident_service.create_incident(
                title=f"Reconciliation exception: {name}",
                incident_type=IncidentType.RECONCILIATION_EXCEPTION,
                severity=IncidentSeverity.HIGH,
                detected_at=datetime.now(timezone.utc),
                description=f"Reconciliation run '{name}' flagged exceptions exceeding tolerance of ±{tolerance_threshold_pct}%",
                asset_id=asset_id,
            )
        else:
            run.status = ReconciliationStatus.AUTO_CLOSED

        run.completed_at = datetime.now(timezone.utc)
        await self.db.flush()
        await self.db.refresh(run)
        return run

    async def _reconcile_vessel_discharge(
        self, run: ReconciliationRun, start: datetime, end: datetime
    ) -> None:
        result = await self.db.execute(
            select(BerthSchedule).where(
                BerthSchedule.eta >= start,
                BerthSchedule.eta <= end,
                BerthSchedule.bill_of_lading_volume_m3.isnot(None),
                BerthSchedule.metered_volume_m3.isnot(None),
            )
        )
        schedules = result.scalars().all()

        for sched in schedules:
            expected = sched.bill_of_lading_volume_m3 or 0
            actual = sched.metered_volume_m3 or 0
            variance = actual - expected
            variance_pct = (abs(variance) / expected * 100) if expected > 0 else 0

            record = VarianceRecord(
                reconciliation_run_id=run.id,
                node=ReconciliationNode.VESSEL_DISCHARGE,
                expected_volume_m3=expected,
                actual_volume_m3=actual,
                variance_m3=variance,
                variance_pct=variance_pct,
                is_exception=variance_pct > run.tolerance_threshold_pct,
                reference_id=str(sched.id),
            )
            self.db.add(record)

        await self.db.flush()

    async def _reconcile_tank_receipts(
        self, run: ReconciliationRun, start: datetime, end: datetime
    ) -> None:
        # Tank level changes during period would be reconciled against metered receipts
        # Simplified: compare aggregate tank level changes
        pass

    async def _reconcile_gantry_loading(
        self, run: ReconciliationRun, start: datetime, end: datetime
    ) -> None:
        result = await self.db.execute(
            select(Trip).where(
                Trip.departure_time >= start,
                Trip.departure_time <= end,
                Trip.gantry_metered_litres.isnot(None),
                Trip.loaded_volume_litres.isnot(None),
            )
        )
        trips = result.scalars().all()

        for trip in trips:
            expected = trip.loaded_volume_litres or 0
            actual = trip.gantry_metered_litres or 0
            # Convert litres to m3 (1 m3 = 1000 litres)
            expected_m3 = expected / 1000
            actual_m3 = actual / 1000
            variance = actual_m3 - expected_m3
            variance_pct = (abs(variance) / expected_m3 * 100) if expected_m3 > 0 else 0

            record = VarianceRecord(
                reconciliation_run_id=run.id,
                node=ReconciliationNode.GANTRY_LOADING,
                expected_volume_m3=expected_m3,
                actual_volume_m3=actual_m3,
                variance_m3=variance,
                variance_pct=variance_pct,
                is_exception=variance_pct > run.tolerance_threshold_pct,
                reference_id=str(trip.id),
            )
            self.db.add(record)

        await self.db.flush()

    async def _reconcile_delivery_epod(
        self, run: ReconciliationRun, start: datetime, end: datetime
    ) -> None:
        result = await self.db.execute(
            select(Trip, EPod)
            .join(EPod, Trip.id == EPod.trip_id)
            .where(
                Trip.departure_time >= start,
                Trip.departure_time <= end,
                Trip.gantry_metered_litres.isnot(None),
            )
        )
        rows = result.all()

        for trip, epod in rows:
            expected_m3 = (trip.gantry_metered_litres or 0) / 1000
            actual_m3 = epod.delivered_volume_litres / 1000
            variance = actual_m3 - expected_m3
            variance_pct = (abs(variance) / expected_m3 * 100) if expected_m3 > 0 else 0

            record = VarianceRecord(
                reconciliation_run_id=run.id,
                node=ReconciliationNode.DELIVERY_EPOD,
                expected_volume_m3=expected_m3,
                actual_volume_m3=actual_m3,
                variance_m3=variance,
                variance_pct=variance_pct,
                is_exception=variance_pct > run.tolerance_threshold_pct,
                reference_id=str(trip.id),
            )
            self.db.add(record)

        await self.db.flush()

    async def _compute_totals(self, run: ReconciliationRun) -> None:
        await self.db.refresh(run, ["variance_records"])
        if not run.variance_records:
            return

        total_expected = sum(vr.expected_volume_m3 for vr in run.variance_records)
        total_actual = sum(vr.actual_volume_m3 for vr in run.variance_records)
        run.total_expected_m3 = total_expected
        run.total_actual_m3 = total_actual
        run.total_variance_pct = (
            (abs(total_actual - total_expected) / total_expected * 100)
            if total_expected > 0
            else 0
        )
        await self.db.flush()

    async def _run_fraud_checks(
        self, run: ReconciliationRun, start: datetime, end: datetime
    ) -> None:
        # Run anti-fraud checks on delivery records
        result = await self.db.execute(
            select(Trip, EPod)
            .join(EPod, Trip.id == EPod.trip_id)
            .where(Trip.departure_time >= start, Trip.departure_time <= end)
        )
        rows = result.all()

        for trip, epod in rows:
            fraud_flags: dict = {}

            # Short-loading detection
            if trip.gantry_metered_litres and epod.delivered_volume_litres:
                if epod.delivered_volume_litres > trip.gantry_metered_litres:
                    fraud_flags["short_load"] = True

            # Ghost trip detection (no arrival time but has ePOD)
            if trip.arrival_time is None and epod.delivered_volume_litres > 0:
                fraud_flags["ghost_trip"] = True

            if fraud_flags:
                # Update variance record with fraud check results
                for vr in run.variance_records:
                    if vr.reference_id == str(trip.id):
                        vr.fraud_checks = fraud_flags
                        vr.is_exception = True

        await self.db.flush()
