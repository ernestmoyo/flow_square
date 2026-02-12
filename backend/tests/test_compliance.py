"""Tests for compliance and audit trail endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
class TestComplianceAPI:
    async def test_list_reports(self, client: AsyncClient, admin_token: str):
        """List compliance reports."""
        resp = await client.get(
            "/api/v1/compliance/reports",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200

    async def test_get_audit_logs(self, client: AsyncClient, admin_token: str):
        """Get audit trail."""
        resp = await client.get(
            "/api/v1/compliance/audit-logs",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200

    async def test_list_custody_transfers(self, client: AsyncClient, admin_token: str):
        """List custody transfer records."""
        resp = await client.get(
            "/api/v1/compliance/custody-transfers",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200


@pytest.mark.asyncio
class TestAnalyticsAPI:
    async def test_ufg_index(self, client: AsyncClient, admin_token: str):
        """Get UFG index analytics."""
        resp = await client.get(
            "/api/v1/analytics/ufg-index",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code in [200, 404]

    async def test_leak_probability(self, client: AsyncClient, admin_token: str):
        """Get leak probability scores."""
        resp = await client.get(
            "/api/v1/analytics/leak-probability",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code in [200, 404]

    async def test_fraud_score(self, client: AsyncClient, admin_token: str):
        """Get fraud detection scores."""
        resp = await client.get(
            "/api/v1/analytics/fraud-score",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code in [200, 404]

    async def test_predictive_maintenance(self, client: AsyncClient, admin_token: str):
        """Get predictive maintenance data."""
        resp = await client.get(
            "/api/v1/analytics/predictive-maintenance",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code in [200, 404]
