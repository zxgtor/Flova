"""Projects CRUD — owner isolation, listing order, status update, delete."""

from httpx import AsyncClient


async def _auth(client: AsyncClient, email: str = "p@x.co") -> str:
    r = await client.post(
        "/api/auth/register",
        json={"email": email, "password": "longenough1", "display_name": ""},
    )
    return r.json()["access_token"]


async def test_create_list_get_update_delete(client: AsyncClient) -> None:
    tok = await _auth(client)
    h = {"Authorization": f"Bearer {tok}"}

    # empty list
    r0 = await client.get("/api/projects", headers=h)
    assert r0.status_code == 200
    assert r0.json() == []

    # create
    r1 = await client.post(
        "/api/projects",
        json={"title": "Odyssey", "description": "Sci-fi short."},
        headers=h,
    )
    assert r1.status_code == 201
    p = r1.json()
    assert p["title"] == "Odyssey"
    assert p["status"] == "draft"

    # list now has 1
    r2 = await client.get("/api/projects", headers=h)
    assert len(r2.json()) == 1

    # read
    r3 = await client.get(f"/api/projects/{p['id']}", headers=h)
    assert r3.json()["description"] == "Sci-fi short."

    # update
    r4 = await client.patch(
        f"/api/projects/{p['id']}",
        json={"status": "in_progress", "title": "Odyssey v2"},
        headers=h,
    )
    assert r4.status_code == 200
    assert r4.json()["status"] == "in_progress"
    assert r4.json()["title"] == "Odyssey v2"

    # delete
    r5 = await client.delete(f"/api/projects/{p['id']}", headers=h)
    assert r5.status_code == 204

    r6 = await client.get("/api/projects", headers=h)
    assert r6.json() == []


async def test_projects_require_auth(client: AsyncClient) -> None:
    assert (await client.get("/api/projects")).status_code == 401
    assert (await client.post("/api/projects", json={"title": "x"})).status_code == 401


async def test_cannot_access_other_users_project(client: AsyncClient) -> None:
    tok_a = await _auth(client, "a@x.co")
    r = await client.post(
        "/api/projects", json={"title": "Mine"}, headers={"Authorization": f"Bearer {tok_a}"}
    )
    pid = r.json()["id"]

    tok_b = await _auth(client, "b@x.co")
    hb = {"Authorization": f"Bearer {tok_b}"}
    assert (await client.get(f"/api/projects/{pid}", headers=hb)).status_code == 404
    assert (
        await client.patch(f"/api/projects/{pid}", json={"title": "hax"}, headers=hb)
    ).status_code == 404
    assert (await client.delete(f"/api/projects/{pid}", headers=hb)).status_code == 404
