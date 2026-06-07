"""User-scoped read endpoints — profile stats + recent renders."""

from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from flova_api.db import get_session
from flova_api.models import RenderJob, RenderStatus, User
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
