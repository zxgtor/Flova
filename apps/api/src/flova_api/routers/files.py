"""Files: upload, list-mine, download."""

import uuid
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, File as UploadFile_, HTTPException, UploadFile
from fastapi.responses import Response
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from flova_api.db import get_session
from flova_api.models import File, StorageTier, User
from flova_api.security import current_user
from flova_api.storage import get_storage

router = APIRouter(prefix="/api/files", tags=["files"])

# Upload size guardrail. 50 MB matches what fits comfortably in a single multipart
# round-trip; real video uploads should switch to multipart-presigned-URL later.
_MAX_UPLOAD_BYTES = 50 * 1024 * 1024


class FileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    storage_key: str
    tier: StorageTier
    byte_size: int
    content_type: str
    created_at: datetime


@router.post("/upload", response_model=FileOut, status_code=201)
async def upload(
    user: Annotated[User, Depends(current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
    upload: Annotated[UploadFile, UploadFile_(...)],
) -> File:
    data = await upload.read()
    if len(data) > _MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File too large")

    file_id = str(uuid.uuid4())
    # Owner-prefixed key prevents one user from guessing another's storage layout.
    safe_name = (upload.filename or "upload").replace("/", "_").replace("\\", "_")
    key = f"uploads/{user.id}/{file_id}/{safe_name}"

    await get_storage().put(
        key,
        data,
        content_type=upload.content_type or "application/octet-stream",
    )

    f = File(
        id=file_id,
        owner_id=user.id,
        storage_key=key,
        tier=StorageTier.hot,
        byte_size=len(data),
        content_type=upload.content_type or "application/octet-stream",
    )
    session.add(f)
    await session.commit()
    await session.refresh(f)
    return f


@router.get("/my", response_model=list[FileOut])
async def my_files(
    user: Annotated[User, Depends(current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> list[File]:
    rows = await session.execute(
        select(File).where(File.owner_id == user.id).order_by(File.created_at.desc())
    )
    return list(rows.scalars().all())


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
