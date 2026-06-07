"""Public community endpoints.

`/api/community/feed` lists render jobs that their owners marked public. No
auth required (community is, well, public). Result includes a flattened
`author` field — display_name if present, else the email-local-part — so the
frontend doesn't have to do its own user lookup.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from flova_api.db import get_session
from flova_api.models import RenderJob, RenderStatus, StudioPreset, User
from flova_api.schemas import (
    CommunityRenderOut,
    MarketplaceStyleOut,
    PresetOut,
)
from flova_api.security import current_user

router = APIRouter(prefix="/api/community", tags=["community"])


@router.get("/feed", response_model=list[CommunityRenderOut])
async def feed(
    session: Annotated[AsyncSession, Depends(get_session)],
    limit: Annotated[int, Query(ge=1, le=100)] = 24,
) -> list[CommunityRenderOut]:
    rows = await session.execute(
        select(RenderJob)
        .options(joinedload(RenderJob.user))
        .where(
            RenderJob.is_public.is_(True),
            RenderJob.status == RenderStatus.done,
        )
        .order_by(RenderJob.created_at.desc())
        .limit(limit)
    )
    items: list[CommunityRenderOut] = []
    for job in rows.scalars().all():
        items.append(_to_out(job))
    return items


@router.get("/feed/{render_id}", response_model=CommunityRenderOut)
async def feed_item(
    render_id: str,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> CommunityRenderOut:
    row = await session.execute(
        select(RenderJob)
        .options(joinedload(RenderJob.user))
        .where(RenderJob.id == render_id)
    )
    job = row.scalar_one_or_none()
    if job is None or not job.is_public or job.status != RenderStatus.done:
        raise HTTPException(status_code=404, detail="Render not in community feed")
    return _to_out(job)


def _to_out(job: RenderJob) -> CommunityRenderOut:
    author = (job.user.display_name or "").strip() or job.user.email.split("@")[0]
    return CommunityRenderOut(
        id=job.id,
        prompt=job.prompt,
        author=author,
        created_at=job.created_at,
        output_file_id=job.output_file_id,
    )


def _author_handle(user: User) -> str:
    return (user.display_name or "").strip() or user.email.split("@")[0]


@router.get("/styles", response_model=list[MarketplaceStyleOut])
async def list_marketplace_styles(
    session: Annotated[AsyncSession, Depends(get_session)],
    limit: Annotated[int, Query(ge=1, le=100)] = 30,
) -> list[MarketplaceStyleOut]:
    """All public style presets, freshest first. No auth required."""
    rows = await session.execute(
        select(StudioPreset, User)
        .join(User, User.id == StudioPreset.user_id)
        .where(StudioPreset.kind == "style", StudioPreset.is_public.is_(True))
        .order_by(StudioPreset.created_at.desc())
        .limit(limit)
    )
    return [
        MarketplaceStyleOut(
            id=p.id,
            name=p.name,
            payload=p.payload,
            author=_author_handle(u),
            created_at=p.created_at,
        )
        for p, u in rows.all()
    ]


@router.get("/styles/{preset_id}", response_model=MarketplaceStyleOut)
async def get_marketplace_style(
    preset_id: str,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> MarketplaceStyleOut:
    row = await session.execute(
        select(StudioPreset, User)
        .join(User, User.id == StudioPreset.user_id)
        .where(StudioPreset.id == preset_id)
    )
    pair = row.first()
    if pair is None:
        raise HTTPException(status_code=404, detail="Style not in marketplace")
    p, u = pair
    if p.kind != "style" or not p.is_public:
        raise HTTPException(status_code=404, detail="Style not in marketplace")
    return MarketplaceStyleOut(
        id=p.id,
        name=p.name,
        payload=p.payload,
        author=_author_handle(u),
        created_at=p.created_at,
    )


@router.post("/styles/{preset_id}/import", response_model=PresetOut, status_code=201)
async def import_marketplace_style(
    preset_id: str,
    user: Annotated[User, Depends(current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> StudioPreset:
    """Clone a public style into the caller's library as a fresh preset."""
    src = (
        await session.execute(select(StudioPreset).where(StudioPreset.id == preset_id))
    ).scalar_one_or_none()
    if src is None or src.kind != "style" or not src.is_public:
        raise HTTPException(status_code=404, detail="Style not in marketplace")
    # Don't re-import your own style (avoids duplicate noise in the library).
    if src.user_id == user.id:
        raise HTTPException(status_code=400, detail="That style is already yours")
    clone = StudioPreset(
        user_id=user.id,
        kind="style",
        name=src.name,
        payload=dict(src.payload),  # copy not alias
        is_public=False,
    )
    session.add(clone)
    await session.commit()
    await session.refresh(clone)
    return clone
