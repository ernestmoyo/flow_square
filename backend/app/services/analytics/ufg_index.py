import uuid
from datetime import datetime, timezone

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.reconciliation import ReconciliationRun, VarianceRecord
from app.schemas.analytics import TimeRange, UFGIndexResult
from app.services.analytics import AnalyticsProduct


class UFGIndexService(AnalyticsProduct):
    def get_thresholds(self) -> dict:
        return {
            "acceptable_ufg_pct": 0.5,
            "warning_ufg_pct": 1.0,
            "critical_ufg_pct": 1.5,
        }

    async def compute(
        self, asset_id: uuid.UUID, time_range: TimeRange
    ) -> UFGIndexResult:
        # Aggregate reconciliation data for UFG calculation
        result = await self.db.execute(
            select(ReconciliationRun)
            .where(
                ReconciliationRun.period_start >= time_range.start,
                ReconciliationRun.period_end <= time_range.end,
            )
            .order_by(ReconciliationRun.period_start)
        )
        runs = result.scalars().unique().all()

        total_receipts = 0.0
        total_dispatches = 0.0
        node_breakdown = []

        for run in runs:
            for vr in run.variance_records:
                if vr.node == "VESSEL_DISCHARGE":
                    total_receipts += vr.actual_volume_m3
                elif vr.node in ("GANTRY_LOADING", "DELIVERY_EPOD"):
                    total_dispatches += vr.actual_volume_m3

                node_breakdown.append({
                    "run_id": str(run.id),
                    "node": vr.node,
                    "expected": vr.expected_volume_m3,
                    "actual": vr.actual_volume_m3,
                    "variance_pct": vr.variance_pct,
                })

        ufg_m3 = total_receipts - total_dispatches
        ufg_pct = (abs(ufg_m3) / total_receipts * 100) if total_receipts > 0 else 0

        return UFGIndexResult(
            asset_id=asset_id,
            period_start=time_range.start,
            period_end=time_range.end,
            receipts_m3=total_receipts,
            dispatches_m3=total_dispatches,
            tank_variance_m3=0.0,  # Would come from tank dip data
            ufg_m3=ufg_m3,
            ufg_pct=ufg_pct,
            node_breakdown=node_breakdown,
        )
