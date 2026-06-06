"""Celery setup + the simulated render task.

In real deployment: a separate Python service runs `celery -A flova_api.worker worker`
on a GPU host and pulls jobs. This skeleton task just flips status to `done` after a
short sleep — no model invocation.
"""

from __future__ import annotations

import time
import uuid
from pathlib import Path

from celery import Celery
from sqlalchemy import select

from flova_api.db import SyncSessionLocal
from flova_api.models import File, RenderJob, RenderStatus, StorageTier
from flova_api.settings import get_settings


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
    """Skeleton: mark running, simulate work, mark done. No model called.

    Sync DB session by design: the worker runs in its own process (no FastAPI event loop)
    and pytest's eager-Celery mode invokes it inside a running loop, so async-DB here
    would deadlock.
    """
    with SyncSessionLocal() as session:
        job = session.execute(
            select(RenderJob).where(RenderJob.id == job_id)
        ).scalar_one_or_none()
        if job is None:
            return job_id
        job.status = RenderStatus.running
        session.commit()

    time.sleep(0.05)  # short skeleton "render"

    # "Render" the prompt to a placeholder text file. Real implementation will
    # produce an mp4 here; the storage + DB plumbing stays identical.
    settings = get_settings()
    storage_root = Path(settings.storage_local_root)
    storage_root.mkdir(parents=True, exist_ok=True)

    with SyncSessionLocal() as session:
        job = session.execute(
            select(RenderJob).where(RenderJob.id == job_id)
        ).scalar_one_or_none()
        if job is None:
            return job_id

        file_id = str(uuid.uuid4())
        key = f"renders/{job_id}/output.txt"
        payload = (
            f"# Flova render skeleton output\n\n"
            f"Job: {job_id}\n"
            f"Prompt: {job.prompt}\n\n"
            f"(In production this is an mp4. The plumbing is real.)\n"
        ).encode("utf-8")
        (storage_root / key).parent.mkdir(parents=True, exist_ok=True)
        (storage_root / key).write_bytes(payload)

        f = File(
            id=file_id,
            owner_id=job.user_id,
            storage_key=key,
            tier=StorageTier.hot,
            byte_size=len(payload),
            content_type="text/plain",
        )
        session.add(f)
        job.output_file_id = file_id
        job.status = RenderStatus.done
        session.commit()
    return job_id
