"""Async SQLAlchemy 2.0 setup.

CONTEXT: Postgres in prod via asyncpg, SQLite (aiosqlite) in tests. Session is request-scoped.
"""

from collections.abc import AsyncIterator
from typing import Any

from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from flova_api.settings import get_settings


class Base(DeclarativeBase):
    pass


def _make_engine() -> Any:
    s = get_settings()
    kwargs: dict[str, Any] = {"future": True}
    if s.is_sqlite:
        # aiosqlite has no real pooling and balks at check_same_thread on cross-thread use
        kwargs["connect_args"] = {"check_same_thread": False}
    return create_async_engine(s.database_url, **kwargs)


engine = _make_engine()
SessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


def _sync_url(url: str) -> str:
    # Strip the async driver suffix so the sync engine can use the same DB.
    return url.replace("+asyncpg", "+psycopg").replace("+aiosqlite", "")


def _make_sync_engine() -> Any:
    s = get_settings()
    kwargs: dict[str, Any] = {"future": True}
    if s.is_sqlite:
        kwargs["connect_args"] = {"check_same_thread": False}
    return create_engine(_sync_url(s.database_url), **kwargs)


# Sync engine + session used by the Celery worker (separate process in prod; avoids
# colliding with FastAPI's event loop in tests under task_always_eager).
sync_engine = _make_sync_engine()
SyncSessionLocal = sessionmaker(sync_engine, expire_on_commit=False, autoflush=False)


async def get_session() -> AsyncIterator[AsyncSession]:
    async with SessionLocal() as session:
        yield session


async def create_all() -> None:
    """Create tables — used by tests and first-time bootstrap.

    For real environments use Alembic migrations.
    """
    # Local import: avoid circular at module load
    from flova_api import models  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
