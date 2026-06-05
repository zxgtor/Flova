"""Centralized typed settings loaded from environment.

Per docs/foundation/architecture.md — env var names are stable across the platform.
"""

from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Core
    env: Literal["dev", "test", "prod"] = "dev"
    api_origin: str = "http://localhost:8000"
    web_origin: str = "http://localhost:3000"

    # Auth
    auth_secret: str = "dev-secret-change-me"
    auth_token_ttl_seconds: int = 60 * 60 * 8

    # Database (Postgres in prod, SQLite in tests)
    database_url: str = "sqlite+aiosqlite:///./flova.db"

    # Queue
    redis_url: str = "redis://localhost:6379/0"

    # Storage tier: "local" uses filesystem; "r2" requires creds.
    storage_backend: Literal["local", "r2"] = "local"
    storage_local_root: str = "./storage"

    r2_account_id: str = ""
    r2_access_key_id: str = ""
    r2_secret_access_key: str = ""
    r2_bucket: str = ""
    r2_public_url: str = ""

    pikpak_username: str = ""
    pikpak_password: str = ""

    # GPU burst
    gpu_burst_api_key: str = ""
    gpu_burst_endpoint: str = ""

    @property
    def is_sqlite(self) -> bool:
        return self.database_url.startswith("sqlite")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


__all__ = ["Settings", "get_settings"]
_ = Field  # re-export silencer
