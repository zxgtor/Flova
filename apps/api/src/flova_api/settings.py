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

    # Observability
    sentry_dsn: str = ""
    sentry_traces_sample_rate: float = 0.0
    # Rate limit defaults (per IP). Loosened in tests via ENV=test detection.
    rate_limit_auth: str = "20/minute"
    rate_limit_render: str = "30/minute"

    # Billing provider. "stub" activates Pro instantly without any external call (dev/
    # offline). "stripe" creates real Checkout sessions and validates webhooks.
    billing_provider: Literal["stub", "stripe"] = "stub"
    stripe_secret_key: str = ""
    stripe_price_id: str = ""  # The Stripe price (e.g. price_xxx) for the Pro plan.
    stripe_webhook_secret: str = ""
    billing_success_url: str = "http://localhost:3000/account/billing?upgraded=1"
    billing_cancel_url: str = "http://localhost:3000/account/billing?canceled=1"

    # Video provider:
    # - "stub"      writes a placeholder file (default; tests + offline dev)
    # - "replicate" hits api.replicate.com — set REPLICATE_API_TOKEN
    # - "local"     runs a diffusers text-to-video model on this host — needs a GPU
    #               and the [local-gpu] extra installed. See deploy/SELF_HOSTED_MODEL.md.
    video_provider: Literal["stub", "replicate", "local"] = "stub"
    replicate_api_token: str = ""
    replicate_model: str = "minimax/video-01"
    # Seconds to keep polling Replicate before giving up.
    video_poll_timeout_seconds: int = 600

    # Self-hosted model settings. Any HuggingFace text-to-video diffusers model.
    # Examples: "Wan-AI/Wan2.1-T2V-1.3B", "cerspense/zeroscope_v2_576w",
    # "ByteDance/AnimateDiff-Lightning". Heavy: each needs many GB of VRAM.
    local_model_id: str = ""
    local_model_dtype: Literal["float16", "bfloat16", "float32"] = "float16"
    local_model_steps: int = 25
    local_model_width: int = 512
    local_model_height: int = 320
    local_model_num_frames: int = 24
    local_model_fps: int = 8

    @property
    def is_sqlite(self) -> bool:
        return self.database_url.startswith("sqlite")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


__all__ = ["Settings", "get_settings"]
_ = Field  # re-export silencer
