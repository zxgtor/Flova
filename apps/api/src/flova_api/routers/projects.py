"""CRUD endpoints for projects.

Authorization model: every operation is scoped to the calling user. There is no
shared/team access in this revision — that lands when the H (collaboration) group
gets persistence.
"""

from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from flova_api.db import get_session
from flova_api.models import Project, User
from flova_api.schemas import ProjectCreate, ProjectOut, ProjectUpdate
from flova_api.security import current_user

router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.get("", response_model=list[ProjectOut])
async def list_projects(
    user: Annotated[User, Depends(current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> list[Project]:
    rows = await session.execute(
        select(Project).where(Project.owner_id == user.id).order_by(Project.updated_at.desc())
    )
    return list(rows.scalars().all())


@router.post("", response_model=ProjectOut, status_code=201)
async def create_project(
    body: ProjectCreate,
    user: Annotated[User, Depends(current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> Project:
    project = Project(owner_id=user.id, title=body.title, description=body.description)
    session.add(project)
    await session.commit()
    await session.refresh(project)
    return project


async def _load(session: AsyncSession, user: User, project_id: str) -> Project:
    row = await session.execute(select(Project).where(Project.id == project_id))
    project = row.scalar_one_or_none()
    if project is None or project.owner_id != user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.get("/{project_id}", response_model=ProjectOut)
async def get_project(
    project_id: str,
    user: Annotated[User, Depends(current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> Project:
    return await _load(session, user, project_id)


@router.patch("/{project_id}", response_model=ProjectOut)
async def update_project(
    project_id: str,
    body: ProjectUpdate,
    user: Annotated[User, Depends(current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> Project:
    project = await _load(session, user, project_id)
    if body.title is not None:
        project.title = body.title
    if body.description is not None:
        project.description = body.description
    if body.status is not None:
        project.status = body.status
    project.updated_at = datetime.now(UTC)
    await session.commit()
    await session.refresh(project)
    return project


@router.delete("/{project_id}", status_code=204)
async def delete_project(
    project_id: str,
    user: Annotated[User, Depends(current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> None:
    project = await _load(session, user, project_id)
    await session.delete(project)
    await session.commit()
