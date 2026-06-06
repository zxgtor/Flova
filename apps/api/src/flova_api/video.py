"""VideoProvider — abstracts text-to-video generation.

Same pattern as `StorageProvider`: business code never references Replicate / Luma /
Runway directly. Today's implementations:
- `StubVideoProvider`  — synthesises a small placeholder file. Default; tests & offline.
- `ReplicateVideoProvider` — POST to api.replicate.com, poll until `succeeded`, fetch
  the output video bytes.
"""

from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Protocol

import httpx

from flova_api.settings import get_settings


@dataclass(frozen=True)
class StartResult:
    external_id: str  # provider-side id we store on RenderJob.external_job_id
    # `inline_bytes` lets the stub finish in one call without a poll round-trip.
    inline_bytes: bytes | None = None
    inline_content_type: str | None = None


@dataclass(frozen=True)
class PollResult:
    status: str  # "running" | "done" | "failed"
    video_bytes: bytes | None = None
    content_type: str | None = None
    failure_reason: str | None = None


class VideoProvider(Protocol):
    def start(self, prompt: str) -> StartResult: ...
    def poll(self, external_id: str) -> PollResult: ...


# ---------- Stub ----------------------------------------------------------------------

class StubVideoProvider:
    """Produces a small text 'render' so the full pipeline works without a real API."""

    def start(self, prompt: str) -> StartResult:
        payload = (
            "# Flova render skeleton output\n\n"
            f"Prompt: {prompt}\n\n"
            "(Set VIDEO_PROVIDER=replicate + REPLICATE_API_TOKEN to produce real mp4.)\n"
        ).encode()
        # Stub returns the bytes inline; no external system involved.
        return StartResult(
            external_id="stub-inline",
            inline_bytes=payload,
            inline_content_type="text/plain",
        )

    def poll(self, external_id: str) -> PollResult:  # pragma: no cover — inline path
        return PollResult(status="done")


# ---------- Replicate -----------------------------------------------------------------

_REPLICATE_BASE = "https://api.replicate.com/v1"


class ReplicateError(RuntimeError):
    pass


class ReplicateVideoProvider:
    """Calls the Replicate REST API.

    Notes:
    - We treat any Replicate model with a text input named `prompt` as compatible.
      All major text-to-video models on Replicate accept this shape.
    - `output` can be a string URL or a list of URLs depending on the model; both are
      handled.
    """

    def __init__(self) -> None:
        s = get_settings()
        if not s.replicate_api_token:
            raise ReplicateError("REPLICATE_API_TOKEN is not set")
        self._headers = {
            "Authorization": f"Bearer {s.replicate_api_token}",
            "Content-Type": "application/json",
        }
        self._model = s.replicate_model
        self._timeout_s = s.video_poll_timeout_seconds

    def start(self, prompt: str) -> StartResult:
        # Replicate has model-versioned and "official-model" endpoints; the latter just
        # takes the slug. We use the simpler official path.
        url = f"{_REPLICATE_BASE}/models/{self._model}/predictions"
        body = {"input": {"prompt": prompt}}
        r = httpx.post(url, headers=self._headers, json=body, timeout=30.0)
        if r.status_code >= 400:
            raise ReplicateError(f"Replicate start failed: {r.status_code} {r.text[:200]}")
        external_id = r.json().get("id")
        if not isinstance(external_id, str):
            raise ReplicateError("Replicate returned no prediction id")
        return StartResult(external_id=external_id)

    def poll(self, external_id: str) -> PollResult:
        url = f"{_REPLICATE_BASE}/predictions/{external_id}"
        deadline = time.monotonic() + self._timeout_s
        # Replicate jobs typically take 20s–5min. Poll every 3s.
        while time.monotonic() < deadline:
            r = httpx.get(url, headers=self._headers, timeout=15.0)
            if r.status_code >= 400:
                return PollResult(status="failed", failure_reason=f"HTTP {r.status_code}")
            data = r.json()
            status = data.get("status")
            if status in {"succeeded"}:
                video_url = _first_url(data.get("output"))
                if not video_url:
                    return PollResult(status="failed", failure_reason="No output URL")
                video_bytes, content_type = _download(video_url)
                return PollResult(
                    status="done", video_bytes=video_bytes, content_type=content_type
                )
            if status in {"failed", "canceled"}:
                return PollResult(
                    status="failed",
                    failure_reason=data.get("error") or status,
                )
            time.sleep(3.0)
        return PollResult(status="failed", failure_reason="Timed out waiting for prediction")


def _first_url(output: object) -> str | None:
    if isinstance(output, str):
        return output
    if isinstance(output, list) and output:
        first = output[0]
        return first if isinstance(first, str) else None
    return None


def _download(url: str) -> tuple[bytes, str]:
    r = httpx.get(url, timeout=120.0, follow_redirects=True)
    r.raise_for_status()
    ct = r.headers.get("content-type", "video/mp4").split(";")[0].strip()
    return r.content, ct


# ---------- Factory -------------------------------------------------------------------

def get_video_provider() -> VideoProvider:
    s = get_settings()
    if s.video_provider == "replicate":
        return ReplicateVideoProvider()
    return StubVideoProvider()
