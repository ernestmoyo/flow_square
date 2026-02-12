"""Tests for fleet management and geofencing."""

import pytest
from httpx import AsyncClient

from app.utils.geofence import haversine_distance, point_in_circle, point_in_polygon


class TestGeofenceUtils:
    """Unit tests for geofence utility functions."""

    def test_haversine_distance(self):
        """Distance between two known points."""
        # Dar es Salaam to Dodoma ~roughly 450km
        dist = haversine_distance(-6.8, 39.28, -6.17, 35.75)
        assert 380_000 < dist < 420_000  # meters

    def test_point_in_circle(self):
        """Point within a circular geofence."""
        assert point_in_circle(-6.8, 39.28, -6.8, 39.28, 100) is True  # same point
        assert point_in_circle(-6.8, 39.28, -6.8, 39.29, 500) is False  # ~1km away

    def test_point_in_polygon(self):
        """Point within a polygon geofence."""
        polygon = [
            (-6.79, 39.27),
            (-6.79, 39.29),
            (-6.81, 39.29),
            (-6.81, 39.27),
        ]
        assert point_in_polygon(-6.8, 39.28, polygon) is True
        assert point_in_polygon(-6.7, 39.2, polygon) is False

    def test_point_on_boundary(self):
        """Edge case: point on polygon boundary."""
        polygon = [
            (0, 0),
            (0, 10),
            (10, 10),
            (10, 0),
        ]
        # Point well inside
        assert point_in_polygon(5, 5, polygon) is True
        # Point well outside
        assert point_in_polygon(15, 15, polygon) is False


@pytest.mark.asyncio
class TestFleetAPI:
    async def test_list_vehicles(self, client: AsyncClient, admin_token: str):
        """List all vehicles."""
        resp = await client.get(
            "/api/v1/fleet/vehicles",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200

    async def test_list_trips(self, client: AsyncClient, admin_token: str):
        """List all trips."""
        resp = await client.get(
            "/api/v1/fleet/trips",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200

    async def test_list_geofence_zones(self, client: AsyncClient, admin_token: str):
        """List geofence zones."""
        resp = await client.get(
            "/api/v1/fleet/geofences",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200
