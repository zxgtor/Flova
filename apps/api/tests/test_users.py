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
    assert (await client.get("/api/users/me/usage")).status_code == 401
    assert (await client.get("/api/users/me/workflow")).status_code == 401


async def test_me_workflow_combines_stages_and_activity(client: AsyncClient) -> None:
    tok = await _auth(client)
    h = {"Authorization": f"Bearer {tok}"}

    # Empty workflow.
    body = (await client.get("/api/users/me/workflow", headers=h)).json()
    assert {s["id"] for s in body["stages"]} == {
        "concept",
        "asset",
        "storyboard",
        "editing",
        "export",
    }
    assert all(s["status"] == "todo" for s in body["stages"])
    assert body["activity"] == []

    # Add a prompt preset, render twice, upload a file.
    await client.post(
        "/api/presets",
        headers=h,
        json={"kind": "prompt", "name": "P1", "payload": {"text": "hello"}},
    )
    for prompt in ("a", "b"):
        await client.post("/api/render", headers=h, json={"prompt": prompt})
    await client.post(
        "/api/files/upload",
        headers=h,
        files={"upload": ("hi.txt", b"hi", "text/plain")},
    )

    body = (await client.get("/api/users/me/workflow", headers=h)).json()
    by_id = {s["id"]: s for s in body["stages"]}
    assert by_id["concept"]["count"] == 1
    assert by_id["concept"]["status"] == "in_progress"
    # 2 renders + 1 manual upload, plus 2 placeholder render outputs.
    assert by_id["asset"]["count"] >= 3
    assert by_id["export"]["count"] == 2

    # Activity covers all three types newest first.
    types = {a["type"] for a in body["activity"]}
    assert types == {"render", "file", "preset"}


async def test_me_usage_counts_renders_storage_and_monthly(client: AsyncClient) -> None:
    tok = await _auth(client)
    h = {"Authorization": f"Bearer {tok}"}

    # Run 2 renders (eager Celery writes a placeholder file per render).
    for prompt in ("a", "b"):
        await client.post("/api/render", json={"prompt": prompt}, headers=h)
    # Also upload a small extra file to bump byte_size.
    await client.post(
        "/api/files/upload",
        headers=h,
        files={"upload": ("hi.txt", b"hi", "text/plain")},
    )

    body = (await client.get("/api/users/me/usage", headers=h)).json()
    assert body["total_renders"] == 2
    assert body["successful_renders"] == 2
    assert body["failed_renders"] == 0
    # 2 render-output files + 1 manual upload = 3 files.
    assert body["file_count"] == 3
    assert body["storage_bytes"] > 0

    # 12-month series, oldest → newest, current month carries our renders.
    monthly = body["renders_by_month"]
    assert len(monthly) == 12
    assert sum(m["count"] for m in monthly) == 2
