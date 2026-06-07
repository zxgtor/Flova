"""Studio presets CRUD + kind filter + cross-user isolation."""

from httpx import AsyncClient


async def _auth(client: AsyncClient, email: str = "ps@x.co") -> str:
    r = await client.post(
        "/api/auth/register",
        json={"email": email, "password": "longenough1", "display_name": ""},
    )
    return r.json()["access_token"]


async def test_create_list_filter_delete(client: AsyncClient) -> None:
    tok = await _auth(client)
    h = {"Authorization": f"Bearer {tok}"}

    # create two character presets and one camera preset
    r1 = await client.post(
        "/api/presets",
        json={"kind": "character", "name": "Hero", "payload": {"age": "young"}},
        headers=h,
    )
    assert r1.status_code == 201
    char_id = r1.json()["id"]

    await client.post(
        "/api/presets",
        json={"kind": "character", "name": "Villain", "payload": {"age": "old"}},
        headers=h,
    )
    await client.post(
        "/api/presets",
        json={"kind": "camera", "name": "My Setup", "payload": {"camera": "ecu"}},
        headers=h,
    )

    # list all → 3
    assert len(await (await client.get("/api/presets", headers=h)).aread()) > 0
    all_r = await client.get("/api/presets", headers=h)
    assert len(all_r.json()) == 3

    # filter by kind=character → 2
    chars = await client.get("/api/presets?kind=character", headers=h)
    assert len(chars.json()) == 2
    # filter by kind=camera → 1
    cams = await client.get("/api/presets?kind=camera", headers=h)
    assert len(cams.json()) == 1
    assert cams.json()[0]["payload"]["camera"] == "ecu"

    # delete one
    d = await client.delete(f"/api/presets/{char_id}", headers=h)
    assert d.status_code == 204
    assert len((await client.get("/api/presets?kind=character", headers=h)).json()) == 1


async def test_presets_require_auth(client: AsyncClient) -> None:
    assert (await client.get("/api/presets")).status_code == 401
    assert (
        await client.post("/api/presets", json={"kind": "x", "name": "y"})
    ).status_code == 401


async def test_cannot_access_other_users_preset(client: AsyncClient) -> None:
    tok_a = await _auth(client, "a@x.co")
    r = await client.post(
        "/api/presets",
        json={"kind": "character", "name": "Mine", "payload": {}},
        headers={"Authorization": f"Bearer {tok_a}"},
    )
    pid = r.json()["id"]

    tok_b = await _auth(client, "b@x.co")
    h_b = {"Authorization": f"Bearer {tok_b}"}
    assert (await client.get(f"/api/presets/{pid}", headers=h_b)).status_code == 404
    assert (await client.delete(f"/api/presets/{pid}", headers=h_b)).status_code == 404
