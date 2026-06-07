"""POST /api/render → enqueue job ; GET /api/render/{id} → poll status."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from flova_api.db import get_session
from flova_api.models import RenderJob, User
from flova_api.ratelimit import limiter, render_limit
from flova_api.schemas import RenderJobOut, RenderJobUpdate, RenderSubmitRequest
from flova_api.security import current_user
from flova_api.worker import enqueue_render

router = APIRouter(prefix="/api/render", tags=["render"])


@router.post("", response_model=RenderJobOut, status_code=202)
@limiter.limit(render_limit)
async def submit(
    request: Request,
    body: RenderSubmitRequest,
    user: Annotated[User, Depends(current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> RenderJob:
    _ = request
    job = RenderJob(user_id=user.id, prompt=body.prompt)
    session.add(job)
    await session.commit()
    await session.refresh(job)
    enqueue_render(job.id)
    return job


@router.get("/{job_id}", response_model=RenderJobOut)
async def get_job(
    job_id: str,
    user: Annotated[User, Depends(current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> RenderJob:
    row = await session.execute(select(RenderJob).where(RenderJob.id == job_id))
    job = row.scalar_one_or_none()
    if job is None or job.user_id != user.id:
        raise HTTPException(status_code=404, detail="Render job not found")
    return job


@router.patch("/{job_id}", response_model=RenderJobOut)
async def update_job(
    job_id: str,
    body: RenderJobUpdate,
    user: Annotated[User, Depends(current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> RenderJob:
    row = await session.execute(select(RenderJob).where(RenderJob.id == job_id))
    job = row.scalar_one_or_none()
    if job is None or job.user_id != user.id:
        raise HTTPException(status_code=404, detail="Render job not found")
    if body.is_public is not None:
        job.is_public = body.is_public
    await session.commit()
    await session.refresh(job)
    return job
