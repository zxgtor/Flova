# ADR-0002: Backend Skeleton (Group A2)

Date: 2026-06-05
Status: Accepted

## Context
Foundation spec defines a Python backend on FastAPI + Postgres + Redis/Celery + R2/PikPak.
At this stage no real AI model is integrated; we still want a runnable skeleton so the
async render pipeline shape is reified and the frontend can target real endpoints later.

## Decision
- FastAPI app factory in `apps/api/src/flova_api/app.py`. OpenAPI is the contract.
- SQLAlchemy 2.0 async with asyncpg (prod) and aiosqlite (tests). `create_all()` for the
  skeleton; **Alembic migrations are an outstanding requirement before any prod use**.
- Three ORM models: `User`, `RenderJob`, `File`. Enough to demonstrate auth + queue + storage tier.
- JWT auth (HS256, configurable secret). Passwords hashed with bcrypt.
- Celery + Redis for the render queue. `render_task` is a no-op skeleton that flips
  status `queued → running → done` after a short sleep. No model invocation.
- `StorageProvider` Protocol with a `LocalFsProvider` implementation. R2 and PikPak
  implementations are explicit `NotImplementedError` until needed — keeps the seam visible
  to anyone touching storage.

## Consequences
- The frontend can now exercise real auth + render-job-poll endpoints against a local
  uvicorn instance.
- The skeleton lets the team build out individual studios (Group C+) without blocking on
  GPU integration.
- **Tech debt explicitly accepted:** no real model, no R2/PikPak — these
  must be added before any environment that holds real user data.

## Update 2026-06-05
Alembic migrations have since been wired in (see `apps/api/alembic/`). The
`create_all()` fallback only runs when `env != "prod"`, so dev hacking stays
zero-config while prod is forced through `alembic upgrade head`.
