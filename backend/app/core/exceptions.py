from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse


class FlowSquareException(Exception):
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class NotFoundException(FlowSquareException):
    def __init__(self, resource: str, resource_id: str | None = None):
        detail = f"{resource} not found"
        if resource_id:
            detail = f"{resource} with id '{resource_id}' not found"
        super().__init__(message=detail, status_code=status.HTTP_404_NOT_FOUND)


class DuplicateException(FlowSquareException):
    def __init__(self, resource: str, field: str, value: str):
        super().__init__(
            message=f"{resource} with {field}='{value}' already exists",
            status_code=status.HTTP_409_CONFLICT,
        )


class ValidationException(FlowSquareException):
    def __init__(self, message: str):
        super().__init__(message=message, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)


class AuthenticationException(FlowSquareException):
    def __init__(self, message: str = "Invalid credentials"):
        super().__init__(message=message, status_code=status.HTTP_401_UNAUTHORIZED)


class AuthorizationException(FlowSquareException):
    def __init__(self, message: str = "Insufficient permissions"):
        super().__init__(message=message, status_code=status.HTTP_403_FORBIDDEN)


class ReconciliationException(FlowSquareException):
    def __init__(self, message: str):
        super().__init__(message=message, status_code=status.HTTP_400_BAD_REQUEST)


class ToleranceExceededException(FlowSquareException):
    def __init__(self, node: str, variance_pct: float, threshold_pct: float):
        super().__init__(
            message=(
                f"Tolerance exceeded at {node}: variance {variance_pct:.2f}% "
                f"exceeds threshold ±{threshold_pct:.2f}%"
            ),
            status_code=status.HTTP_400_BAD_REQUEST,
        )


async def flowsquare_exception_handler(
    request: Request, exc: FlowSquareException
) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "data": None,
            "meta": None,
            "errors": [{"message": exc.message}],
        },
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "data": None,
            "meta": None,
            "errors": [{"message": exc.detail}],
        },
    )
