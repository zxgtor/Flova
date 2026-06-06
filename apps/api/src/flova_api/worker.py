"""Celery setup + the render task.

In real deployment: a separate Python process runs
`celery -A flova_api.worker.celery_app worker` on a host with the right API token
or GPU. This file does the orchestration; the actual generation lives in
`flova_api.video.VideoProvider`.
"""

from __future__ import annotations

import uuid
from pathlib import Path

from celery import Celery
from sqlalchemy import select

from flova_api.db import SyncSessionLocal
from flova_api.models import File, RenderJob, RenderStatus, StorageTier
from flova_api.settings import get_settings
from flova_api.video import StartResult, get_video_provider


def _build() -> Celery:
    s = get_settings()
    app = Celery("flova", broker=s.redis_url, backend=s.redis_url)
    # Eager in tests and dev so the platform runs without a Redis broker. Prod uses a
    # real broker + separate Celery worker process.
    app.conf.task_always_eager = s.env in {"test", "dev"}
    app.conf.task_eager_propagates = True
    return app


celery_app = _build()


def enqueue_render(job_id: str) -> None:
    """Push a render job onto the queue. Sync helper called from FastAPI handlers."""
    render_task.delay(job_id)


@celery_app.task(name="flova.render")
def render_task(job_id: str) -> str:
    """Run a render: provider.start → poll → write video → mark done."""
    provider = get_video_provider()

    with SyncSessionLocal() as session:
        job = session.execute(
            select(RenderJob).where(RenderJob.id == job_id)
        ).scalar_one_or_none()
        if job is None:
            return job_id
        prompt = job.prompt
        user_id = job.user_id

    # 1. Start
    try:
        start: StartResult = provider.start(prompt)
    except Exception as e:
        _mark_failed(job_id, f"provider.start: {e}")
        return job_id

    with SyncSessionLocal() as session:
        job = session.execute(
            select(RenderJob).where(RenderJob.id == job_id)
        ).scalar_one_or_none()
        if job is None:
            return job_id
        job.status = RenderStatus.running
        job.external_job_id = start.external_id
        session.commit()

    # 2. Resolve bytes — stub returns inline; real providers poll.
    if start.inline_bytes is not None:
        video_bytes = start.inline_bytes
        content_type = start.inline_content_type or "application/octet-stream"
    else:
        try:
            result = provider.poll(start.external_id)
        except Exception as e:
            _mark_failed(job_id, f"provider.poll: {e}")
            return job_id

        if result.status != "done" or result.video_bytes is None:
            _mark_failed(job_id, result.failure_reason or "provider returned no bytes")
            return job_id
        video_bytes = result.video_bytes
        content_type = result.content_type or "application/octet-stream"

    # 3. Persist output to storage + DB
    settings = get_settings()
    storage_root = Path(settings.storage_local_root)
    suffix = _suffix_for(content_type)
    key = f"renders/{job_id}/output{suffix}"
    (storage_root / key).parent.mkdir(parents=True, exist_ok=True)
    (storage_root / key).write_bytes(video_bytes)

    file_id = str(uuid.uuid4())
    with SyncSessionLocal() as session:
        job = session.execute(
            select(RenderJob).where(RenderJob.id == job_id)
        ).scalar_one_or_none()
        if job is None:
            return job_id
        f = File(
            id=file_id,
            owner_id=user_id,
            storage_key=key,
            tier=StorageTier.hot,
            byte_size=len(video_bytes),
            content_type=content_type,
        )
        session.add(f)
        job.output_file_id = file_id
        job.status = RenderStatus.done
        session.commit()
    return job_id


def _mark_failed(job_id: str, reason: str) -> None:
    with SyncSessionLocal() as session:
        job = session.execute(
            select(RenderJob).where(RenderJob.id == job_id)
        ).scalar_one_or_none()
        if job is None:
            return
        job.status = RenderStatus.failed
        job.failure_reason = reason[:1000]
        session.commit()


def _suffix_for(content_type: str) -> str:
    if "mp4" in content_type:
        return ".mp4"
    if "webm" in content_type:
        return ".webm"
    if "gif" in content_type:
        return ".gif"
    if "text/plain" in content_type:
        return ".txt"
    return ""
