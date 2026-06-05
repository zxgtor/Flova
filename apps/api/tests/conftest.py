"""Test fixtures: in-memory SQLite + eager Celery."""

from __future__ import annotations

import os
from collections.abc import AsyncIterator

import pytest

# Force test settings before importing the app graph.
os.environ.setdefault("ENV", "test")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///./test.db")
os.environ.setdefault("AUTH_SECRET", "test-secret")

from httpx import ASGITransport, AsyncClient  # noqa: E402

from flova_api.app import create_app  # noqa: E402
from flova_api.db import Base, engine  # noqa: E402


@pytest.fixture(autouse=True)
async def _fresh_db() -> AsyncIterator[None]:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield


@pytest.fixture()
async def client() -> AsyncIterator[AsyncClient]:
    app = create_app()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
