from httpx import AsyncClient


async def _auth(client: AsyncClient) -> str:
    r = await client.post(
        "/api/auth/register",
        json={"email": "r@b.co", "password": "longenough1", "display_name": ""},
    )
    return r.json()["access_token"]


async def test_submit_and_poll_render(client: AsyncClient) -> None:
    tok = await _auth(client)
    headers = {"Authorization": f"Bearer {tok}"}

    r = await client.post("/api/render", json={"prompt": "a cat in space"}, headers=headers)
    assert r.status_code == 202, r.text
    job = r.json()
    assert job["prompt"] == "a cat in space"
    # In eager Celery the task already ran by the time the response returns.
    assert job["status"] in {"queued", "running", "done"}

    poll = await client.get(f"/api/render/{job['id']}", headers=headers)
    assert poll.status_code == 200
    # Eager mode flips it to done synchronously.
    assert poll.json()["status"] == "done"


async def test_render_requires_auth(client: AsyncClient) -> None:
    r = await client.post("/api/render", json={"prompt": "x"})
    assert r.status_code == 401


async def test_cannot_read_other_users_jobs(client: AsyncClient) -> None:
    tok_a = await _auth(client)
    r = await client.post("/api/render", json={"prompt": "p"}, headers={"Authorization": f"Bearer {tok_a}"})
    job_id = r.json()["id"]

    r2 = await client.post(
        "/api/auth/register",
        json={"email": "b@b.co", "password": "longenough1", "display_name": ""},
    )
    tok_b = r2.json()["access_token"]
    leak = await client.get(f"/api/render/{job_id}", headers={"Authorization": f"Bearer {tok_b}"})
    assert leak.status_code == 404
