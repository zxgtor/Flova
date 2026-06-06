"""GET /api/files/{file_id} — owner-scoped download of a stored file."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from flova_api.db import get_session
from flova_api.models import File, User
from flova_api.security import current_user
from flova_api.storage import get_storage

router = APIRouter(prefix="/api/files", tags=["files"])


@router.get("/{file_id}")
async def download(
    file_id: str,
    user: Annotated[User, Depends(current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> Response:
    row = await session.execute(select(File).where(File.id == file_id))
    f = row.scalar_one_or_none()
    if f is None or f.owner_id != user.id:
        raise HTTPException(status_code=404, detail="File not found")
    data = await get_storage().get(f.storage_key)
    return Response(
        content=data,
        media_type=f.content_type,
        headers={
            "Content-Disposition": f'inline; filename="{f.storage_key.split("/")[-1]}"'
        },
    )
