"""Generic studio preset CRUD.

Endpoints scope every operation to the caller. A preset is just (kind, name,
payload) — the studio that owns `kind` defines what's in `payload`.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from flova_api.db import get_session
from flova_api.models import StudioPreset, User
from flova_api.schemas import PresetCreate, PresetOut
from flova_api.security import current_user

router = APIRouter(prefix="/api/presets", tags=["presets"])


@router.get("", response_model=list[PresetOut])
async def list_presets(
    user: Annotated[User, Depends(current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
    kind: Annotated[str | None, Query()] = None,
) -> list[StudioPreset]:
    stmt = select(StudioPreset).where(StudioPreset.user_id == user.id)
    if kind:
        stmt = stmt.where(StudioPreset.kind == kind)
    stmt = stmt.order_by(StudioPreset.created_at.desc())
    rows = await session.execute(stmt)
    return list(rows.scalars().all())


@router.post("", response_model=PresetOut, status_code=201)
async def create_preset(
    body: PresetCreate,
    user: Annotated[User, Depends(current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> StudioPreset:
    p = StudioPreset(
        user_id=user.id, kind=body.kind, name=body.name, payload=body.payload
    )
    session.add(p)
    await session.commit()
    await session.refresh(p)
    return p


async def _load(session: AsyncSession, user: User, pid: str) -> StudioPreset:
    row = await session.execute(select(StudioPreset).where(StudioPreset.id == pid))
    p = row.scalar_one_or_none()
    if p is None or p.user_id != user.id:
        raise HTTPException(status_code=404, detail="Preset not found")
    return p


@router.get("/{preset_id}", response_model=PresetOut)
async def get_preset(
    preset_id: str,
    user: Annotated[User, Depends(current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> StudioPreset:
    return await _load(session, user, preset_id)


@router.delete("/{preset_id}", status_code=204)
async def delete_preset(
    preset_id: str,
    user: Annotated[User, Depends(current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> None:
    p = await _load(session, user, preset_id)
    await session.delete(p)
    await session.commit()
