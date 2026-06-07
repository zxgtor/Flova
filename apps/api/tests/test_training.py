"""Training jobs: create / list / detail / delete / file-ownership guard."""

from httpx import AsyncClient


async def _register(client: AsyncClient, email: str) -> str:
    r = await client.post(
        "/api/auth/register",
        json={"email": email, "password": "longenough1", "display_name": ""},
    )
    return r.json()["access_token"]


async def _upload(client: AsyncClient, h: dict, name: str = "f.txt") -> str:
    r = await client.post(
        "/api/files/upload",
        headers=h,
        files={"upload": (name, b"x", "text/plain")},
    )
    return r.json()["id"]


async def test_create_list_delete(client: AsyncClient) -> None:
    tok = await _register(client, "a@x.co")
    h = {"Authorization": f"Bearer {tok}"}
    f1 = await _upload(client, h, "a.png")
    f2 = await _upload(client, h, "b.png")

    r = await client.post(
        "/api/training",
        headers=h,
        json={
            "name": "Noir v1",
            "base_model": "cerspense/zeroscope_v2_576w",
            "file_ids": [f1, f2],
            "params": {"strength": 75, "steps": 1000},
        },
    )
    assert r.status_code == 201
    job = r.json()
    assert job["status"] == "queued"
    assert job["file_ids"] == [f1, f2]
    assert job["params"]["strength"] == 75

    lst = (await client.get("/api/training", headers=h)).json()
    assert len(lst) == 1

    one = (await client.get(f"/api/training/{job['id']}", headers=h)).json()
    assert one["name"] == "Noir v1"

    rm = await client.delete(f"/api/training/{job['id']}", headers=h)
    assert rm.status_code == 204
    assert (await client.get("/api/training", headers=h)).json() == []


async def test_create_rejects_unowned_files(client: AsyncClient) -> None:
    tok_a = await _register(client, "a@x.co")
    ha = {"Authorization": f"Bearer {tok_a}"}
    a_file = await _upload(client, ha)

    tok_b = await _register(client, "b@x.co")
    hb = {"Authorization": f"Bearer {tok_b}"}
    r = await client.post(
        "/api/training",
        headers=hb,
        json={
            "name": "Hack",
            "base_model": "x",
            "file_ids": [a_file],
            "params": {},
        },
    )
    assert r.status_code == 400


async def test_other_users_cant_access_job(client: AsyncClient) -> None:
    tok_a = await _register(client, "a@x.co")
    ha = {"Authorization": f"Bearer {tok_a}"}
    r = await client.post(
        "/api/training",
        headers=ha,
        json={"name": "n", "base_model": "x", "file_ids": [], "params": {}},
    )
    jid = r.json()["id"]

    tok_b = await _register(client, "b@x.co")
    hb = {"Authorization": f"Bearer {tok_b}"}
    assert (await client.get(f"/api/training/{jid}", headers=hb)).status_code == 404
    assert (await client.delete(f"/api/training/{jid}", headers=hb)).status_code == 404


async def test_training_requires_auth(client: AsyncClient) -> None:
    assert (await client.get("/api/training")).status_code == 401
    assert (
        await client.post(
            "/api/training", json={"name": "n", "base_model": "x", "file_ids": [], "params": {}}
        )
    ).status_code == 401
