"""SQLAlchemy ORM models — skeleton subset of the foundation data model.

Only the three entities needed for the auth + render tracer-bullet are modelled:
- users (account & identity)
- render_jobs (queue state machine)
- files (storage tier index)
"""

from __future__ import annotations

import enum
import uuid
from datetime import UTC, datetime

from sqlalchemy import JSON, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from flova_api.db import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(UTC)


class RenderStatus(enum.StrEnum):
    queued = "queued"
    running = "running"
    done = "done"
    failed = "failed"


class StorageTier(enum.StrEnum):
    hot = "hot"
    cold = "cold"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(40), primary_key=True, default=_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    display_name: Mapped[str] = mapped_column(String(80), default="")
    created_at: Mapped[datetime] = mapped_column(default=_now)

    render_jobs: Mapped[list[RenderJob]] = relationship(back_populates="user")


class RenderJob(Base):
    __tablename__ = "render_jobs"

    id: Mapped[str] = mapped_column(String(40), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    prompt: Mapped[str] = mapped_column(Text)
    status: Mapped[RenderStatus] = mapped_column(
        Enum(RenderStatus, native_enum=False), default=RenderStatus.queued, index=True
    )
    failure_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    output_file_id: Mapped[str | None] = mapped_column(
        ForeignKey("files.id"), nullable=True
    )
    # Provider-side id (e.g. Replicate prediction id). Lets us poll/cancel later.
    external_job_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    # Surfaced in /api/community/feed when true. Owner controls via PATCH.
    is_public: Mapped[bool] = mapped_column(default=False, index=True)
    created_at: Mapped[datetime] = mapped_column(default=_now)
    updated_at: Mapped[datetime] = mapped_column(default=_now)

    user: Mapped[User] = relationship(back_populates="render_jobs")
    output_file: Mapped[File | None] = relationship()


class File(Base):
    __tablename__ = "files"

    id: Mapped[str] = mapped_column(String(40), primary_key=True, default=_uuid)
    owner_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    storage_key: Mapped[str] = mapped_column(String(500))
    tier: Mapped[StorageTier] = mapped_column(
        Enum(StorageTier, native_enum=False), default=StorageTier.hot
    )
    byte_size: Mapped[int] = mapped_column(default=0)
    content_type: Mapped[str] = mapped_column(String(120), default="application/octet-stream")
    created_at: Mapped[datetime] = mapped_column(default=_now)


class ProjectStatus(enum.StrEnum):
    draft = "draft"
    in_progress = "in_progress"
    completed = "completed"
    archived = "archived"


class SubscriptionStatus(enum.StrEnum):
    none = "none"
    active = "active"
    past_due = "past_due"
    canceled = "canceled"


class SubscriptionPlan(enum.StrEnum):
    free = "free"
    pro = "pro"


class Subscription(Base):
    __tablename__ = "subscriptions"

    id: Mapped[str] = mapped_column(String(40), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id"), unique=True, index=True
    )
    plan: Mapped[SubscriptionPlan] = mapped_column(
        Enum(SubscriptionPlan, native_enum=False), default=SubscriptionPlan.free
    )
    status: Mapped[SubscriptionStatus] = mapped_column(
        Enum(SubscriptionStatus, native_enum=False), default=SubscriptionStatus.none
    )
    stripe_customer_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    stripe_subscription_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    current_period_end: Mapped[datetime | None] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=_now)
    updated_at: Mapped[datetime] = mapped_column(default=_now)


class StudioPreset(Base):
    """Generic user-saved studio configuration.

    `kind` identifies the studio ("character", "camera", "voice", ...) and
    `payload` is the studio-specific JSON blob the frontend writes and reads.
    Keeping it generic avoids a table-per-studio explosion while still letting
    each studio define its own payload shape.
    """

    __tablename__ = "studio_presets"

    id: Mapped[str] = mapped_column(String(40), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    kind: Mapped[str] = mapped_column(String(40), index=True)
    name: Mapped[str] = mapped_column(String(120))
    payload: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(default=_now)
    updated_at: Mapped[datetime] = mapped_column(default=_now)


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String(40), primary_key=True, default=_uuid)
    owner_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[ProjectStatus] = mapped_column(
        Enum(ProjectStatus, native_enum=False), default=ProjectStatus.draft, index=True
    )
    created_at: Mapped[datetime] = mapped_column(default=_now)
    updated_at: Mapped[datetime] = mapped_column(default=_now)
