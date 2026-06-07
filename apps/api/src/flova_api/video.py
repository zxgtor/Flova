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

# ---------- Self-hosted (diffusers) ---------------------------------------------------


class LocalModelError(RuntimeError):
    pass


class LocalModelVideoProvider:
    """Runs a HuggingFace `diffusers` text-to-video model on this host.

    Why a separate class instead of forking Stub: this code only loads when the
    operator opts in (`VIDEO_PROVIDER=local`), and it needs a real GPU. We isolate
    it so test/offline environments without `diffusers`/`torch` installed still
    boot fine.

    Heavy bits are lazily imported in `__init__` so that:
    - tests can mock them without `torch` ever being touched
    - `pip install -e ".[dev]"` doesn't pull in 1.5 GB of CUDA wheels
    """

    def __init__(self) -> None:
        s = get_settings()
        if not s.local_model_id:
            raise LocalModelError(
                "LOCAL_MODEL_ID is not set; pick a HuggingFace text-to-video model"
            )
        try:
            import torch  # noqa: F401
            from diffusers import DiffusionPipeline
        except ImportError as e:
            raise LocalModelError(
                "Self-hosted model needs the `local-gpu` extra: "
                "`pip install -e \".[local-gpu]\"`"
            ) from e

        dtype_map = {
            "float16": "float16",
            "bfloat16": "bfloat16",
            "float32": "float32",
        }
        self._pipe = DiffusionPipeline.from_pretrained(
            s.local_model_id,
            torch_dtype=getattr(__import__("torch"), dtype_map[s.local_model_dtype]),
        )
        # Best-effort device move; fall back to CPU (slow but works for tiny models).
        import torch

        device = "cuda" if torch.cuda.is_available() else "cpu"
        self._pipe = self._pipe.to(device)
        self._settings = s

    def start(self, prompt: str) -> StartResult:
        s = self._settings
        # Run the pipeline. The exact return shape varies by model — we handle the
        # common diffusers output: `.frames` is a list[list[PIL.Image]].
        result = self._pipe(
            prompt,
            num_inference_steps=s.local_model_steps,
            width=s.local_model_width,
            height=s.local_model_height,
            num_frames=s.local_model_num_frames,
        )
        frames = self._extract_frames(result)
        video_bytes = self._encode_mp4(frames, fps=s.local_model_fps)
        return StartResult(
            external_id=f"local-{id(result)}",
            inline_bytes=video_bytes,
            inline_content_type="video/mp4",
        )

    def poll(self, external_id: str) -> PollResult:  # pragma: no cover — inline path
        return PollResult(status="done")

    @staticmethod
    def _extract_frames(result: object) -> list:
        frames_attr = getattr(result, "frames", None)
        if frames_attr is None:
            raise LocalModelError("Pipeline returned no `.frames`; check model compat")
        # diffusers gives either a list of frames or a list of clips of frames.
        first = frames_attr[0]
        if isinstance(first, list):
            return first
        return list(frames_attr)

    @staticmethod
    def _encode_mp4(frames: list, fps: int) -> bytes:
        # Lazy import: only needed when actually generating.
        try:
            import io

            import imageio
        except ImportError as e:
            raise LocalModelError(
                "Self-hosted output needs `imageio[ffmpeg]` in the local-gpu extra"
            ) from e

        buf = io.BytesIO()
        # imageio writes to a buffer when given format="ffmpeg" + an explicit ext.
        with imageio.get_writer(buf, format="ffmpeg", fps=fps, codec="libx264") as writer:
            for frame in frames:
                # diffusers PIL Image → numpy via imageio's reader
                writer.append_data(imageio.core.asarray(frame))
        return buf.getvalue()


# ---------- Factory -------------------------------------------------------------------


def get_video_provider() -> VideoProvider:
    s = get_settings()
    if s.video_provider == "replicate":
        return ReplicateVideoProvider()
    if s.video_provider == "local":
        return LocalModelVideoProvider()
    return StubVideoProvider()
