"""Tests for authentication endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
class TestLogin:
    async def test_login_success(self, client: AsyncClient, admin_token: str):
        """Login with valid credentials returns tokens."""
        resp = await client.post("/api/v1/auth/login", json={
            "email": "admin@test.com",
            "password": "testpass123",
        })
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    async def test_login_invalid_password(self, client: AsyncClient, admin_token: str):
        """Login with wrong password returns 401."""
        resp = await client.post("/api/v1/auth/login", json={
            "email": "admin@test.com",
            "password": "wrongpassword",
        })
        assert resp.status_code == 401

    async def test_login_nonexistent_user(self, client: AsyncClient):
        """Login with non-existent email returns 401."""
        resp = await client.post("/api/v1/auth/login", json={
            "email": "nobody@test.com",
            "password": "testpass123",
        })
        assert resp.status_code == 401


@pytest.mark.asyncio
class TestMe:
    async def test_get_current_user(self, client: AsyncClient, admin_token: str):
        """Authenticated user can fetch their profile."""
        resp = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert data["email"] == "admin@test.com"
        assert data["role"] == "platform_admin"

    async def test_me_no_token(self, client: AsyncClient):
        """Unauthenticated request to /me returns 401."""
        resp = await client.get("/api/v1/auth/me")
        assert resp.status_code == 401

    async def test_me_invalid_token(self, client: AsyncClient):
        """Invalid token returns 401."""
        resp = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer invalid.token.here"},
        )
        assert resp.status_code == 401


@pytest.mark.asyncio
class TestRefresh:
    async def test_refresh_token(self, client: AsyncClient, admin_token: str):
        """Refresh token returns new access token."""
        # First login to get refresh token
        login_resp = await client.post("/api/v1/auth/login", json={
            "email": "admin@test.com",
            "password": "testpass123",
        })
        refresh_token = login_resp.json()["data"]["refresh_token"]

        resp = await client.post("/api/v1/auth/refresh", json={
            "refresh_token": refresh_token,
        })
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert "access_token" in data
