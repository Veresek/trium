from functools import lru_cache
from typing import Literal
from zoneinfo import ZoneInfo

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

DEFAULT_SECRET_KEY = "change-me-before-deploying"
KNOWN_WEAK_SECRET_KEYS = {
    DEFAULT_SECRET_KEY,
    "local-development-only",
    "replace-with-a-long-random-secret",
}


class Settings(BaseSettings):
    app_name: str = "Trium API"
    environment: Literal["development", "test", "production"] = "development"
    database_url: str = "postgresql+psycopg://trium:trium@localhost:5432/trium"
    instance_code: str = ""
    secret_key: str = DEFAULT_SECRET_KEY
    timezone: str = "Europe/Warsaw"
    client_origin: str = "http://localhost:5173"
    access_token_minutes: int = Field(default=30, gt=0)
    auth_rate_limit_enabled: bool | None = None
    auth_rate_limit_requests: int = Field(default=10, gt=0)
    auth_rate_limit_window_seconds: int = Field(default=60, gt=0)

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @model_validator(mode="after")
    def validate_production_security(self) -> "Settings":
        if self.environment != "production":
            return self
        if not self.instance_code.strip():
            raise ValueError("INSTANCE_CODE must not be empty in production.")
        if (
            len(self.secret_key) < 32
            or len(set(self.secret_key)) < 8
            or self.secret_key.strip() in KNOWN_WEAK_SECRET_KEYS
        ):
            raise ValueError(
                "SECRET_KEY must be at least 32 characters and non-default "
                "in production."
            )
        if not self.client_origin.startswith("https://"):
            raise ValueError("CLIENT_ORIGIN must use HTTPS in production.")
        return self

    @property
    def rate_limiting_enabled(self) -> bool:
        if self.auth_rate_limit_enabled is not None:
            return self.auth_rate_limit_enabled
        return self.environment != "test"

    @property
    def zoneinfo(self) -> ZoneInfo:
        return ZoneInfo(self.timezone)


@lru_cache
def get_settings() -> Settings:
    return Settings()
