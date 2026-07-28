from functools import lru_cache
from typing import Literal

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    environment: Literal["development", "test", "production"] = "development"
    database_url: str = "postgresql+asyncpg://afterthought:password@localhost:5432/afterthought"
    redis_url: str = "redis://localhost:6379/0"
    secret_key: str = "development-only-change-me"
    cors_origins: str = "http://localhost,http://localhost:3000"
    allowed_hosts: str = "localhost,127.0.0.1,backend,frontend,nginx"
    access_token_expire_minutes: int = 30
    session_cookie_name: str = "afterthought_session"
    scheduler_enabled: bool = True
    publication_timezone: str = "Asia/Singapore"
    public_base_url: str = "http://localhost"
    bootstrap_admin_email: str | None = None
    bootstrap_admin_password: str | None = None
    sql_echo: bool = False

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def allowed_host_list(self) -> list[str]:
        return [host.strip() for host in self.allowed_hosts.split(",") if host.strip()]

    @model_validator(mode="after")
    def validate_production_settings(self) -> "Settings":
        if self.environment == "production" and len(self.secret_key) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters in production")
        if bool(self.bootstrap_admin_email) != bool(self.bootstrap_admin_password):
            raise ValueError(
                "BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD must be configured together"
            )
        if self.bootstrap_admin_password and len(self.bootstrap_admin_password.encode("utf-8")) > 72:
            raise ValueError("BOOTSTRAP_ADMIN_PASSWORD exceeds bcrypt's 72-byte limit")
        if self.bootstrap_admin_password and len(self.bootstrap_admin_password) < 12:
            raise ValueError("BOOTSTRAP_ADMIN_PASSWORD must be at least 12 characters")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
