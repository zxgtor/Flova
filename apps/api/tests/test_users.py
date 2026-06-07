"""User profile stats + recent renders."""

from httpx import AsyncClient


async def _auth(client: AsyncClient, email: str = "u@x.co") -> str:
    r = await client.post(
        "/api/auth/register",
        json={"email": email, "password": "longenough1", "display_name": "User One"},
    )
    return r.json()["access_token"]


async def test_me_stats_starts_zero(client: AsyncClient) -> None:
    tok = await _auth(client)
    r = await client.get(
        "/api/users/me/stats", headers={"Authorization": f"Bearer {tok}"}
    )
    assert r.status_code == 200
    body = r.json()
    assert body == {"total_renders": 0, "successful_renders": 0, "failed_renders": 0}


async def test_me_stats_counts_renders(client: AsyncClient) -> None:
    tok = await _auth(client)
    h = {"Authorization": f"Bearer {tok}"}
    # Eager Celery turns each render into a 'done' job synchronously.
    for prompt in ("a", "b", "c"):
        await client.post("/api/render", json={"prompt": prompt}, headers=h)

    stats = (await client.get("/api/users/me/stats", headers=h)).json()
    assert stats["total_renders"] == 3
    assert stats["successful_renders"] == 3

    recent = (await client.get("/api/users/me/renders?limit=2", headers=h)).json()
    assert len(recent) == 2

    # Status filter narrows the list.
    done_only = (await client.get("/api/users/me/renders?status=done", headers=h)).json()
    assert all(j["status"] == "done" for j in done_only)
    assert len(done_only) == 3
    failed_only = (await client.get("/api/users/me/renders?status=failed", headers=h)).json()
    assert failed_only == []


async def test_me_endpoints_require_auth(client: AsyncClient) -> None:
    assert (await client.get("/api/users/me/stats")).status_code == 401
    assert (await client.get("/api/users/me/renders")).status_code == 401
