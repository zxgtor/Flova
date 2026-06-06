# apps/api — CONTEXT

**What:** Flova platform backend skeleton — FastAPI + Postgres + Celery. Demonstrates the
async render pipeline and storage abstraction from `docs/foundation/architecture.md`. Real
AI model integration is intentionally out of scope at this stage.

**Layout:**
- `src/flova_api/settings.py` — typed env settings (single source).
- `src/flova_api/db.py` — async SQLAlchemy engine + session.
- `src/flova_api/models.py` — `User`, `RenderJob`, `File` ORM models.
- `src/flova_api/schemas.py` — Pydantic request/response types (drives OpenAPI).
- `src/flova_api/security.py` — bcrypt + JWT + `current_user` dependency.
- `src/flova_api/storage.py` — `StorageProvider` Protocol + `LocalFsProvider`. R2/PikPak
  implementations land here when needed; **business code never imports either directly**.
- `src/flova_api/video.py` — `VideoProvider` Protocol + `StubVideoProvider` and
  `ReplicateVideoProvider`. Same isolation: worker depends only on the Protocol.
- `src/flova_api/routers/auth.py` — `/api/auth/register|login|me`.
- `src/flova_api/routers/render.py` — `POST /api/render`, `GET /api/render/{id}`.
- `src/flova_api/worker.py` — Celery app + simulated render task (no real model).
- `src/flova_api/app.py` — FastAPI factory (`create_app`) + lifespan.
- `tests/` — pytest + httpx ASGI client. Tests use in-memory SQLite and `task_always_eager`.

**Commands:**
```bash
# Install
uv sync --extra dev   # or: pip install -e ".[dev]"

# Run API
uvicorn flova_api.app:app --reload

# Run worker (real Celery against Redis)
celery -A flova_api.worker.celery_app worker --loglevel=info

# Tests
pytest

# Local services (optional)
docker compose up -d
```

**Migrations:** Alembic is wired up. `alembic/env.py` reads `DATABASE_URL` from
settings (stripping the async driver suffix). Run `alembic upgrade head` before
the API in any non-dev environment. Dev/test still get `create_all()` at startup
for zero-config local hacking; prod is guarded by `env != "prod"`.

**Switching to real video output:**
```
VIDEO_PROVIDER=replicate
REPLICATE_API_TOKEN=r8_***
REPLICATE_MODEL=minimax/video-01     # or any text-to-video Replicate slug
```
Any Replicate model whose input has a `prompt` field works without code changes.

**Out of scope (deliberately):**
- Self-hosted video models on owned GPUs.
- R2 and PikPak provider implementations.
- GPU burst orchestration.

**Adding an endpoint:**
1. Add Pydantic types to `schemas.py`.
2. Add an ORM model to `models.py` if a new table is needed.
3. Create or extend a router under `routers/`.
4. Register the router in `app.py`.
5. Add tests under `tests/`.
