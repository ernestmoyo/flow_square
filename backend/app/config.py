from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    APP_NAME: str = "FlowSquare"
    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "change-me-to-a-secure-random-string"
    API_V1_PREFIX: str = "/api/v1"

    # Database
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "flowsquare"
    POSTGRES_PASSWORD: str = "flowsquare_dev_password"
    POSTGRES_DB: str = "flowsquare"

    # Set to "sqlite" to use local SQLite file instead of PostgreSQL
    DB_ENGINE: str = "postgresql"

    @property
    def DATABASE_URL(self) -> str:
        if self.DB_ENGINE == "sqlite":
            db_path = Path(__file__).resolve().parent.parent / "flowsquare.db"
            return f"sqlite+aiosqlite:///{db_path}"
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    @property
    def DATABASE_URL_SYNC(self) -> str:
        if self.DB_ENGINE == "sqlite":
            db_path = Path(__file__).resolve().parent.parent / "flowsquare.db"
            return f"sqlite:///{db_path}"
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_ENABLED: bool = False
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # JWT
    JWT_SECRET_KEY: str = "change-me-jwt-secret"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    # Logging
    LOG_LEVEL: str = "DEBUG"
    LOG_FORMAT: str = "json"

    # Demo
    DEMO_ADMIN_EMAIL: str = "admin@flowsquare.io"
    DEMO_ADMIN_PASSWORD: str = "FlowSquare2025!"


settings = Settings()
