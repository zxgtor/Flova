"""StorageProvider — business code never references R2 or PikPak directly.

Foundation rule: only the provider implementation changes when storage swaps. Today's
implementations: local-filesystem (dev/tests), R2 stub (todo), PikPak stub (todo cold tier).
"""

from __future__ import annotations

from pathlib import Path
from typing import Protocol

from flova_api.settings import get_settings


class StorageProvider(Protocol):
    async def put(self, key: str, data: bytes, content_type: str = "application/octet-stream") -> None: ...
    async def get(self, key: str) -> bytes: ...
    async def url(self, key: str) -> str: ...
    async def delete(self, key: str) -> None: ...


class LocalFsProvider:
    def __init__(self, root: str) -> None:
        self.root = Path(root)
        self.root.mkdir(parents=True, exist_ok=True)

    def _path(self, key: str) -> Path:
        # Disallow traversal — keys are app-generated, not user-supplied.
        if ".." in key or key.startswith("/"):
            raise ValueError(f"unsafe storage key: {key!r}")
        return self.root / key

    async def put(self, key: str, data: bytes, content_type: str = "application/octet-stream") -> None:
        p = self._path(key)
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_bytes(data)

    async def get(self, key: str) -> bytes:
        return self._path(key).read_bytes()

    async def url(self, key: str) -> str:
        s = get_settings()
        return f"{s.api_origin}/api/files/{key}"

    async def delete(self, key: str) -> None:
        p = self._path(key)
        if p.exists():
            p.unlink()


def get_storage() -> StorageProvider:
    s = get_settings()
    if s.storage_backend == "local":
        return LocalFsProvider(s.storage_local_root)
    # r2 path intentionally not implemented in skeleton
    raise NotImplementedError(
        "R2 StorageProvider not implemented in skeleton; set STORAGE_BACKEND=local"
    )
