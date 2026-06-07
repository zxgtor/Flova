"""FastAPI application factory."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from flova_api import __version__
from flova_api.db import create_all
from flova_api.ratelimit import limiter
from flova_api.routers import (
    auth,
    billing,
    community,
    files,
    presets,
    projects,
    render,
    teams,
    training,
    users,
)
from flova_api.schemas import Health
from flova_api.settings import get_settings


@asynccontextmanager
async def _lifespan(_app: FastAPI) -> AsyncIterator[None]:
    # Dev/test convenience: auto-create tables so a fresh checkout just works.
    # Prod must use `alembic upgrade head` — this code path is skipped there.
    if get_settings().env != "prod":
        await create_all()
    yield


def _init_sentry() -> None:
    s = get_settings()
    if not s.sentry_dsn:
        return
    import sentry_sdk
    from sentry_sdk.integrations.asyncio import AsyncioIntegration
    from sentry_sdk.integrations.fastapi import FastApiIntegration

    sentry_sdk.init(
        dsn=s.sentry_dsn,
        environment=s.env,
        traces_sample_rate=s.sentry_traces_sample_rate,
        integrations=[FastApiIntegration(), AsyncioIntegration()],
    )


def create_app() -> FastAPI:
    _init_sentry()
    s = get_settings()
    app = FastAPI(
        title="Flova API",
        version=__version__,
        description="Self-hosted AI video platform backend (skeleton).",
        lifespan=_lifespan,
    )
    # Rate limiting (slowapi wires through SlowAPIMiddleware + app.state.limiter).
    app.state.limiter = limiter

    async def _rate_limit_handler(_request, exc: RateLimitExceeded):  # type: ignore[no-untyped-def]
        from fastapi.responses import JSONResponse

        return JSONResponse(status_code=429, content={"detail": f"Rate limit: {exc.detail}"})

    app.add_exception_handler(RateLimitExceeded, _rate_limit_handler)  # type: ignore[arg-type]
    app.add_middleware(SlowAPIMiddleware)

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
    app.include_router(presets.router)
    app.include_router(billing.router)
    app.include_router(users.router)
    app.include_router(community.router)
    app.include_router(teams.router)
    app.include_router(training.router)
    return app


app = create_app()
