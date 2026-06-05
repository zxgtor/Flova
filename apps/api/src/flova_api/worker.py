"""Celery setup + the simulated render task.

In real deployment: a separate Python service runs `celery -A flova_api.worker worker`
on a GPU host and pulls jobs. This skeleton task just flips status to `done` after a
short sleep — no model invocation.
"""

from __future__ import annotations

import time

from celery import Celery
from sqlalchemy import select

from flova_api.db import SyncSessionLocal
from flova_api.models import RenderJob, RenderStatus
from flova_api.settings import get_settings


def _build() -> Celery:
    s = get_settings()
    app = Celery("flova", broker=s.redis_url, backend=s.redis_url)
    app.conf.task_always_eager = s.env == "test"
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

    with SyncSessionLocal() as session:
        job = session.execute(
            select(RenderJob).where(RenderJob.id == job_id)
        ).scalar_one_or_none()
        if job is None:
            return job_id
        job.status = RenderStatus.done
        session.commit()
    return job_id
