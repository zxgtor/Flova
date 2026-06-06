"""StorageProvider — business code never references R2 or PikPak directly.

Foundation rule: only the provider implementation changes when storage swaps.
Implementations:
- LocalFsProvider — dev / tests / offline.
- R2Provider      — Cloudflare R2 via the S3 API (boto3 sync, wrapped in
                    asyncio.to_thread to keep handlers truly async).
- PikPakProvider  — cold tier; still TODO, will raise NotImplementedError.
"""

from __future__ import annotations

import asyncio
from pathlib import Path
from typing import Any, Protocol

from flova_api.settings import get_settings


class StorageProvider(Protocol):
    async def put(
        self, key: str, data: bytes, content_type: str = "application/octet-stream"
    ) -> None: ...
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

    async def put(
        self, key: str, data: bytes, content_type: str = "application/octet-stream"
    ) -> None:
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


class R2Provider:
    """Cloudflare R2 via boto3 / S3 API.

    Why sync boto3 + asyncio.to_thread instead of aioboto3? boto3 has zero extra
    deps relative to what's already in our wheel; aioboto3 brings aiohttp + the
    whole async machinery. For low-throughput uploads to_thread is fine.
    """

    def __init__(self) -> None:
        s = get_settings()
        missing = [
            name
            for name, val in {
                "R2_ACCOUNT_ID": s.r2_account_id,
                "R2_ACCESS_KEY_ID": s.r2_access_key_id,
                "R2_SECRET_ACCESS_KEY": s.r2_secret_access_key,
                "R2_BUCKET": s.r2_bucket,
            }.items()
            if not val
        ]
        if missing:
            raise RuntimeError(f"R2 misconfigured; missing env: {', '.join(missing)}")

        import boto3  # imported lazily so test envs without boto3 still load
        from botocore.config import Config

        self._bucket = s.r2_bucket
        self._public_url = s.r2_public_url.rstrip("/")
        endpoint = f"https://{s.r2_account_id}.r2.cloudflarestorage.com"
        self._client: Any = boto3.client(
            "s3",
            endpoint_url=endpoint,
            aws_access_key_id=s.r2_access_key_id,
            aws_secret_access_key=s.r2_secret_access_key,
            region_name="auto",
            # R2 only supports SigV4 with this name; the addressing style matters.
            config=Config(signature_version="s3v4", s3={"addressing_style": "path"}),
        )

    async def put(
        self, key: str, data: bytes, content_type: str = "application/octet-stream"
    ) -> None:
        await asyncio.to_thread(
            self._client.put_object,
            Bucket=self._bucket,
            Key=key,
            Body=data,
            ContentType=content_type,
        )

    async def get(self, key: str) -> bytes:
        def _read() -> bytes:
            resp = self._client.get_object(Bucket=self._bucket, Key=key)
            return resp["Body"].read()  # type: ignore[no-any-return]

        return await asyncio.to_thread(_read)

    async def url(self, key: str) -> str:
        if self._public_url:
            return f"{self._public_url}/{key}"
        # No public bucket → presign a short-lived GET URL.
        return await asyncio.to_thread(
            self._client.generate_presigned_url,
            "get_object",
            Params={"Bucket": self._bucket, "Key": key},
            ExpiresIn=3600,
        )

    async def delete(self, key: str) -> None:
        await asyncio.to_thread(self._client.delete_object, Bucket=self._bucket, Key=key)


def get_storage() -> StorageProvider:
    s = get_settings()
    if s.storage_backend == "r2":
        return R2Provider()
    return LocalFsProvider(s.storage_local_root)
