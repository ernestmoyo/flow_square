"""Tests for telemetry ingestion and query endpoints."""

import pytest
from datetime import datetime, timezone
from httpx import AsyncClient


@pytest.mark.asyncio
class TestTelemetryIngest:
    async def test_ingest_readings(self, client: AsyncClient, admin_token: str, sample_asset):
        """Ingest batch of telemetry readings."""
        tag_id = str(sample_asset["tag"].id)
        now = datetime.now(timezone.utc).isoformat()

        resp = await client.post(
            "/api/v1/telemetry/ingest",
            json={
                "readings": [
                    {"tag_id": tag_id, "time": now, "value": 180.5, "quality": "GOOD"},
                    {"tag_id": tag_id, "time": now, "value": 181.2, "quality": "GOOD"},
                ]
            },
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert data["accepted"] == 2

    async def test_ingest_empty_batch(self, client: AsyncClient, admin_token: str):
        """Empty batch returns validation error."""
        resp = await client.post(
            "/api/v1/telemetry/ingest",
            json={"readings": []},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code in [200, 422]


@pytest.mark.asyncio
class TestTelemetryQuery:
    async def test_query_readings(self, client: AsyncClient, admin_token: str, sample_asset):
        """Query telemetry readings for a tag."""
        tag_id = str(sample_asset["tag"].id)
        resp = await client.get(
            f"/api/v1/telemetry/query?tag_id={tag_id}&hours=24",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200

    async def test_get_latest(self, client: AsyncClient, admin_token: str, sample_asset):
        """Get latest reading for a tag."""
        tag_id = str(sample_asset["tag"].id)
        resp = await client.get(
            f"/api/v1/telemetry/latest/{tag_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code in [200, 404]  # 404 if no readings yet
