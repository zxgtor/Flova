"""Public community endpoints.

`/api/community/feed` lists render jobs that their owners marked public. No
auth required (community is, well, public). Result includes a flattened
`author` field — display_name if present, else the email-local-part — so the
frontend doesn't have to do its own user lookup.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from flova_api.db import get_session
from flova_api.models import RenderJob, RenderStatus
from flova_api.schemas import CommunityRenderOut

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
        author = (job.user.display_name or "").strip() or job.user.email.split("@")[0]
        items.append(
            CommunityRenderOut(
                id=job.id,
                prompt=job.prompt,
                author=author,
                created_at=job.created_at,
                output_file_id=job.output_file_id,
            )
        )
    return items
