"""File upload + list + cross-user isolation."""

from httpx import AsyncClient


async def _auth(client: AsyncClient, email: str = "f@x.co") -> str:
    r = await client.post(
        "/api/auth/register",
        json={"email": email, "password": "longenough1", "display_name": ""},
    )
    return r.json()["access_token"]


async def test_upload_list_download(client: AsyncClient) -> None:
    tok = await _auth(client)
    h = {"Authorization": f"Bearer {tok}"}

    # empty list
    assert (await client.get("/api/files/my", headers=h)).json() == []

    r = await client.post(
        "/api/files/upload",
        headers=h,
        files={"upload": ("hello.txt", b"hi there", "text/plain")},
    )
    assert r.status_code == 201, r.text
    f = r.json()
    assert f["byte_size"] == 8
    assert f["content_type"] == "text/plain"
    assert f["storage_key"].endswith("hello.txt")

    lst = (await client.get("/api/files/my", headers=h)).json()
    assert len(lst) == 1

    dl = await client.get(f"/api/files/{f['id']}", headers=h)
    assert dl.status_code == 200
    assert dl.content == b"hi there"


async def test_upload_requires_auth(client: AsyncClient) -> None:
    r = await client.post(
        "/api/files/upload",
        files={"upload": ("hi.txt", b"x", "text/plain")},
    )
    assert r.status_code == 401


async def test_cannot_download_other_users_file(client: AsyncClient) -> None:
    tok_a = await _auth(client, "fa@x.co")
    r = await client.post(
        "/api/files/upload",
        headers={"Authorization": f"Bearer {tok_a}"},
        files={"upload": ("secret.txt", b"secret", "text/plain")},
    )
    fid = r.json()["id"]

    tok_b = await _auth(client, "fb@x.co")
    leak = await client.get(
        f"/api/files/{fid}", headers={"Authorization": f"Bearer {tok_b}"}
    )
    assert leak.status_code == 404


async def test_r2_provider_missing_config_raises() -> None:
    """R2Provider should fail loudly if env vars are absent."""
    import pytest

    from flova_api.storage import R2Provider

    with pytest.raises(RuntimeError, match="R2 misconfigured"):
        R2Provider()
