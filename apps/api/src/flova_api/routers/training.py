"""LoRA / style training jobs.

Without the self-hosted GPU worker (ADR-0006) submitted jobs sit at status=queued
indefinitely. The CRUD surface still works so a real worker can be added without
touching the FE.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from flova_api.db import get_session
from flova_api.models import File, TrainingJob, User
from flova_api.schemas import TrainingJobCreate, TrainingJobOut
from flova_api.security import current_user

router = APIRouter(prefix="/api/training", tags=["training"])


@router.get("", response_model=list[TrainingJobOut])
async def list_my_jobs(
    user: Annotated[User, Depends(current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> list[TrainingJob]:
    rows = await session.execute(
        select(TrainingJob)
        .where(TrainingJob.user_id == user.id)
        .order_by(TrainingJob.created_at.desc())
    )
    return list(rows.scalars().all())


@router.post("", response_model=TrainingJobOut, status_code=201)
async def create_job(
    body: TrainingJobCreate,
    user: Annotated[User, Depends(current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> TrainingJob:
    # Validate every supplied file_id belongs to the caller — prevents leaking
    # someone else's storage as training data.
    if body.file_ids:
        rows = await session.execute(
            select(File.id).where(
                File.id.in_(body.file_ids), File.owner_id == user.id
            )
        )
        owned = {f for (f,) in rows.all()}
        missing = [f for f in body.file_ids if f not in owned]
        if missing:
            raise HTTPException(
                status_code=400, detail=f"Unknown or unowned file ids: {missing[:3]}"
            )

    job = TrainingJob(
        user_id=user.id,
        name=body.name,
        base_model=body.base_model,
        file_ids=list(body.file_ids),
        params=dict(body.params),
    )
    session.add(job)
    await session.commit()
    await session.refresh(job)
    return job


async def _load(session: AsyncSession, user: User, job_id: str) -> TrainingJob:
    row = await session.execute(select(TrainingJob).where(TrainingJob.id == job_id))
    job = row.scalar_one_or_none()
    if job is None or job.user_id != user.id:
        raise HTTPException(status_code=404, detail="Training job not found")
    return job


@router.get("/{job_id}", response_model=TrainingJobOut)
async def get_job(
    job_id: str,
    user: Annotated[User, Depends(current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> TrainingJob:
    return await _load(session, user, job_id)


@router.delete("/{job_id}", status_code=204)
async def delete_job(
    job_id: str,
    user: Annotated[User, Depends(current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> None:
    job = await _load(session, user, job_id)
    await session.delete(job)
    await session.commit()
