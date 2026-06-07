"""User-scoped read endpoints — profile stats + recent renders + usage."""

from collections import defaultdict
from datetime import UTC, datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from flova_api.db import get_session
from flova_api.models import File, RenderJob, RenderStatus, StudioPreset, User
from flova_api.schemas import RenderJobOut
from flova_api.security import current_user

router = APIRouter(prefix="/api/users", tags=["users"])


class MeStats(BaseModel):
    total_renders: int
    successful_renders: int
    failed_renders: int


@router.get("/me/stats", response_model=MeStats)
async def me_stats(
    user: Annotated[User, Depends(current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> MeStats:
    total = await session.scalar(
        select(func.count()).select_from(RenderJob).where(RenderJob.user_id == user.id)
    )
    done = await session.scalar(
        select(func.count())
        .select_from(RenderJob)
        .where(RenderJob.user_id == user.id, RenderJob.status == RenderStatus.done)
    )
    failed = await session.scalar(
        select(func.count())
        .select_from(RenderJob)
        .where(RenderJob.user_id == user.id, RenderJob.status == RenderStatus.failed)
    )
    return MeStats(
        total_renders=total or 0,
        successful_renders=done or 0,
        failed_renders=failed or 0,
    )


class MonthlyCount(BaseModel):
    month: str  # "YYYY-MM"
    count: int


class MeUsage(BaseModel):
    total_renders: int
    successful_renders: int
    failed_renders: int
    storage_bytes: int
    file_count: int
    renders_by_month: list[MonthlyCount]


@router.get("/me/usage", response_model=MeUsage)
async def me_usage(
    user: Annotated[User, Depends(current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> MeUsage:
    # Render counts.
    total = await session.scalar(
        select(func.count()).select_from(RenderJob).where(RenderJob.user_id == user.id)
    )
    done = await session.scalar(
        select(func.count())
        .select_from(RenderJob)
        .where(RenderJob.user_id == user.id, RenderJob.status == RenderStatus.done)
    )
    failed = await session.scalar(
        select(func.count())
        .select_from(RenderJob)
        .where(RenderJob.user_id == user.id, RenderJob.status == RenderStatus.failed)
    )

    # Storage totals.
    storage_bytes = await session.scalar(
        select(func.coalesce(func.sum(File.byte_size), 0)).where(File.owner_id == user.id)
    )
    file_count = await session.scalar(
        select(func.count()).select_from(File).where(File.owner_id == user.id)
    )

    # Last 12 months of render counts, bucketed in Python to dodge dialect SQL.
    cutoff = datetime.now(UTC) - timedelta(days=365)
    rows = await session.execute(
        select(RenderJob.created_at).where(
            RenderJob.user_id == user.id, RenderJob.created_at >= cutoff
        )
    )
    buckets: dict[str, int] = defaultdict(int)
    for (ts,) in rows.all():
        # ts may be naive on SQLite; normalize to UTC for the key only.
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=UTC)
        buckets[f"{ts.year:04d}-{ts.month:02d}"] += 1

    # Emit a contiguous 12-month series (oldest → newest) so the chart never has gaps.
    now = datetime.now(UTC)
    monthly: list[MonthlyCount] = []
    year, month = now.year, now.month
    for _ in range(12):
        key = f"{year:04d}-{month:02d}"
        monthly.append(MonthlyCount(month=key, count=buckets.get(key, 0)))
        month -= 1
        if month == 0:
            month = 12
            year -= 1
    monthly.reverse()

    return MeUsage(
        total_renders=total or 0,
        successful_renders=done or 0,
        failed_renders=failed or 0,
        storage_bytes=int(storage_bytes or 0),
        file_count=file_count or 0,
        renders_by_month=monthly,
    )


class WorkflowStage(BaseModel):
    id: str
    label: str
    count: int
    status: str  # "complete" | "in_progress" | "todo"


class ActivityItem(BaseModel):
    type: str  # "render" | "file" | "preset"
    label: str
    subtype: str | None = None  # preset kind, etc.
    created_at: datetime
    link: str | None = None


class MeWorkflow(BaseModel):
    stages: list[WorkflowStage]
    activity: list[ActivityItem]


def _stage(id: str, label: str, count: int) -> WorkflowStage:
    status = "complete" if count >= 3 else "in_progress" if count > 0 else "todo"
    return WorkflowStage(id=id, label=label, count=count, status=status)


@router.get("/me/workflow", response_model=MeWorkflow)
async def me_workflow(
    user: Annotated[User, Depends(current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> MeWorkflow:
    # Stage counts. Each maps to a real resource the user creates as they
    # progress through the platform.
    prompts = await session.scalar(
        select(func.count())
        .select_from(StudioPreset)
        .where(StudioPreset.user_id == user.id, StudioPreset.kind == "prompt")
    )
    file_count = await session.scalar(
        select(func.count()).select_from(File).where(File.owner_id == user.id)
    )
    boards = await session.scalar(
        select(func.count())
        .select_from(StudioPreset)
        .where(StudioPreset.user_id == user.id, StudioPreset.kind == "storyboard")
    )
    editor_saves = await session.scalar(
        select(func.count())
        .select_from(StudioPreset)
        .where(StudioPreset.user_id == user.id, StudioPreset.kind == "editor")
    )
    renders_done = await session.scalar(
        select(func.count())
        .select_from(RenderJob)
        .where(RenderJob.user_id == user.id, RenderJob.status == RenderStatus.done)
    )

    stages = [
        _stage("concept", "Concept & Script", prompts or 0),
        _stage("asset", "Asset Creation", file_count or 0),
        _stage("storyboard", "Storyboard & Layout", boards or 0),
        _stage("editing", "Editing & VFX", editor_saves or 0),
        _stage("export", "Final Export", renders_done or 0),
    ]

    # Cross-resource activity feed. Pull the most recent N of each type, merge,
    # sort by created_at desc, slice. Cheap for typical user volume.
    LIMIT_PER = 10
    render_rows = (
        await session.execute(
            select(RenderJob)
            .where(RenderJob.user_id == user.id)
            .order_by(RenderJob.created_at.desc())
            .limit(LIMIT_PER)
        )
    ).scalars().all()
    file_rows = (
        await session.execute(
            select(File)
            .where(File.owner_id == user.id)
            .order_by(File.created_at.desc())
            .limit(LIMIT_PER)
        )
    ).scalars().all()
    preset_rows = (
        await session.execute(
            select(StudioPreset)
            .where(StudioPreset.user_id == user.id)
            .order_by(StudioPreset.created_at.desc())
            .limit(LIMIT_PER)
        )
    ).scalars().all()

    items: list[ActivityItem] = []
    for r in render_rows:
        items.append(
            ActivityItem(
                type="render",
                label=r.prompt[:120],
                subtype=str(r.status),
                created_at=r.created_at,
                link=f"/render/{r.id}",
            )
        )
    for f in file_rows:
        items.append(
            ActivityItem(
                type="file",
                label=f.storage_key.split("/")[-1],
                subtype=f.content_type,
                created_at=f.created_at,
                link=None,
            )
        )
    for p in preset_rows:
        items.append(
            ActivityItem(
                type="preset",
                label=p.name,
                subtype=p.kind,
                created_at=p.created_at,
                link=None,
            )
        )

    items.sort(key=lambda x: x.created_at, reverse=True)
    return MeWorkflow(stages=stages, activity=items[:12])


@router.get("/me/renders", response_model=list[RenderJobOut])
async def me_recent_renders(
    user: Annotated[User, Depends(current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
    limit: int = 12,
    status: RenderStatus | None = None,
) -> list[RenderJob]:
    stmt = select(RenderJob).where(RenderJob.user_id == user.id)
    if status is not None:
        stmt = stmt.where(RenderJob.status == status)
    stmt = stmt.order_by(RenderJob.created_at.desc()).limit(min(limit, 100))
    rows = await session.execute(stmt)
    return list(rows.scalars().all())
