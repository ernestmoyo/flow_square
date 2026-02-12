from collections.abc import Callable
from functools import wraps
from typing import Any

from fastapi import HTTPException, status

from app.core.constants import UserRole

# Role → permitted endpoint prefixes/actions
ROLE_PERMISSIONS: dict[UserRole, set[str]] = {
    UserRole.ADMIN: {"*"},
    UserRole.CONTROL_ROOM: {
        "telemetry:read", "telemetry:write",
        "assets:read",
        "incidents:read", "incidents:write",
        "reconciliation:read",
        "analytics:read",
        "vessels:read",
        "terminals:read",
        "fleet:read",
        "dashboard:control_room",
    },
    UserRole.INTEGRITY_HSE: {
        "telemetry:read",
        "assets:read",
        "incidents:read", "incidents:write",
        "analytics:read",
        "compliance:read",
        "dashboard:integrity_hse",
    },
    UserRole.FINANCE_REGULATORY: {
        "reconciliation:read",
        "compliance:read", "compliance:write",
        "analytics:read",
        "vessels:read",
        "terminals:read",
        "fleet:read",
        "dashboard:finance_reg",
    },
    UserRole.EXECUTIVE: {
        "analytics:read",
        "reconciliation:read",
        "compliance:read",
        "dashboard:executive",
    },
    UserRole.OPERATOR: {
        "telemetry:read", "telemetry:write",
        "assets:read",
        "fleet:read", "fleet:write",
        "terminals:read",
        "incidents:read",
    },
    UserRole.VIEWER: {
        "telemetry:read",
        "assets:read",
        "analytics:read",
    },
}


def has_permission(role: UserRole, permission: str) -> bool:
    role_perms = ROLE_PERMISSIONS.get(role, set())
    if "*" in role_perms:
        return True
    return permission in role_perms


def require_permission(permission: str) -> Callable:
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> Any:
            current_user = kwargs.get("current_user")
            if current_user is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required",
                )
            if not has_permission(current_user.role, permission):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Permission denied: {permission}",
                )
            return await func(*args, **kwargs)
        return wrapper
    return decorator
