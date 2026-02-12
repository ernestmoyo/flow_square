import uuid
from datetime import datetime, timezone

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.telemetry import TelemetryReading
from app.schemas.analytics import MeterDriftResult, TimeRange
from app.services.analytics import AnalyticsProduct


class MeterDriftService(AnalyticsProduct):
    def get_thresholds(self) -> dict:
        return {
            "in_control": 0.5,
            "warning": 1.0,
            "out_of_control": 2.0,
        }

    async def compute(
        self, tag_id: uuid.UUID, time_range: TimeRange
    ) -> MeterDriftResult:
        # Get readings for the tag over the time range
        result = await self.db.execute(
            select(
                func.avg(TelemetryReading.value),
                func.stddev(TelemetryReading.value),
            ).where(
                TelemetryReading.tag_id == tag_id,
                TelemetryReading.time >= time_range.start,
                TelemetryReading.time <= time_range.end,
            )
        )
        row = result.one()
        avg_value = row[0] or 0.0
        std_dev = row[1] or 0.0

        # Reference value would come from calibration/prover data
        reference_value = avg_value  # Placeholder
        drift_pct = (abs(avg_value - reference_value) / reference_value * 100) if reference_value > 0 else 0

        thresholds = self.get_thresholds()
        if drift_pct <= thresholds["in_control"]:
            chart_status = "IN_CONTROL"
        elif drift_pct <= thresholds["warning"]:
            chart_status = "WARNING"
        else:
            chart_status = "OUT_OF_CONTROL"

        return MeterDriftResult(
            tag_id=tag_id,
            drift_pct=drift_pct,
            reference_value=reference_value,
            actual_value=avg_value,
            control_chart_status=chart_status,
            computed_at=datetime.now(timezone.utc),
        )
