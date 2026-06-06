"""Tests for the VideoProvider — Stub inline + Replicate with mocked httpx."""

from __future__ import annotations

from unittest.mock import patch

import pytest

from flova_api.video import (
    ReplicateError,
    ReplicateVideoProvider,
    StubVideoProvider,
    _first_url,
)
from flova_api.worker import _suffix_for


def test_stub_returns_inline_bytes() -> None:
    res = StubVideoProvider().start("hello")
    assert res.external_id == "stub-inline"
    assert res.inline_bytes is not None
    assert b"Prompt: hello" in res.inline_bytes


def test_first_url_handles_string_and_list() -> None:
    assert _first_url("https://x/y.mp4") == "https://x/y.mp4"
    assert _first_url(["https://a", "https://b"]) == "https://a"
    assert _first_url([]) is None
    assert _first_url(None) is None


def test_suffix_for_known_types() -> None:
    assert _suffix_for("video/mp4") == ".mp4"
    assert _suffix_for("video/webm") == ".webm"
    assert _suffix_for("image/gif") == ".gif"
    assert _suffix_for("text/plain; charset=utf-8") == ".txt"
    assert _suffix_for("application/octet-stream") == ""


def test_replicate_requires_token(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("REPLICATE_API_TOKEN", "")
    from flova_api.settings import get_settings

    get_settings.cache_clear()  # type: ignore[attr-defined]
    with pytest.raises(ReplicateError):
        ReplicateVideoProvider()


def test_replicate_start_and_poll_succeeded(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("REPLICATE_API_TOKEN", "fake-token")
    from flova_api.settings import get_settings

    get_settings.cache_clear()  # type: ignore[attr-defined]
    prov = ReplicateVideoProvider()

    class FakeResponse:
        def __init__(
            self, status: int, json_body: dict | None = None, content: bytes = b""
        ) -> None:
            self.status_code = status
            self._json = json_body or {}
            self.content = content
            self.headers = {"content-type": "video/mp4"}
            self.text = ""

        def json(self) -> dict:
            return self._json

        def raise_for_status(self) -> None:
            if self.status_code >= 400:
                raise RuntimeError(self.status_code)

    def fake_post(url: str, **kwargs: object) -> FakeResponse:
        assert "predictions" in url
        return FakeResponse(201, {"id": "pred_abc"})

    def fake_get(url: str, **kwargs: object) -> FakeResponse:
        if "/predictions/" in url:
            return FakeResponse(200, {"status": "succeeded", "output": "https://cdn/x.mp4"})
        # video download
        return FakeResponse(200, content=b"FAKEMP4")

    with patch("flova_api.video.httpx.post", side_effect=fake_post), patch(
        "flova_api.video.httpx.get", side_effect=fake_get
    ):
        start = prov.start("a galaxy")
        assert start.external_id == "pred_abc"

        result = prov.poll(start.external_id)
        assert result.status == "done"
        assert result.video_bytes == b"FAKEMP4"
        assert result.content_type == "video/mp4"


def test_replicate_poll_failed(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("REPLICATE_API_TOKEN", "fake-token")
    from flova_api.settings import get_settings

    get_settings.cache_clear()  # type: ignore[attr-defined]
    prov = ReplicateVideoProvider()

    class R:
        status_code = 200
        text = ""
        headers: dict[str, str] = {}

        def json(self) -> dict:
            return {"status": "failed", "error": "nsfw"}

        def raise_for_status(self) -> None:
            return None

    with patch("flova_api.video.httpx.get", return_value=R()):
        result = prov.poll("pred_x")
    assert result.status == "failed"
    assert result.failure_reason == "nsfw"
