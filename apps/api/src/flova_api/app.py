"""FastAPI application factory."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from flova_api import __version__
from flova_api.db import create_all
from flova_api.routers import auth, files, projects, render
from flova_api.schemas import Health
from flova_api.settings import get_settings


@asynccontextmanager
async def _lifespan(_app: FastAPI) -> AsyncIterator[None]:
    # Dev/test convenience: auto-create tables so a fresh checkout just works.
    # Prod must use `alembic upgrade head` — this code path is skipped there.
    if get_settings().env != "prod":
        await create_all()
    yield


def create_app() -> FastAPI:
    s = get_settings()
    app = FastAPI(
        title="Flova API",
        version=__version__,
        description="Self-hosted AI video platform backend (skeleton).",
        lifespan=_lifespan,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[s.web_origin],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/api/health", response_model=Health, tags=["meta"])
    async def health() -> Health:  # noqa: D401
        return Health(version=__version__)

    app.include_router(auth.router)
    app.include_router(render.router)
    app.include_router(files.router)
    app.include_router(projects.router)
    return app


app = create_app()
