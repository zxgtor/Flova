"""Teams + members: create, list, invite-by-existing-email, remove, isolation."""

from httpx import AsyncClient


async def _register(client: AsyncClient, email: str, display: str = "") -> str:
    r = await client.post(
        "/api/auth/register",
        json={"email": email, "password": "longenough1", "display_name": display},
    )
    return r.json()["access_token"]


async def test_create_team_makes_owner_a_member(client: AsyncClient) -> None:
    tok = await _register(client, "alice@x.co", "Alice")
    h = {"Authorization": f"Bearer {tok}"}

    r = await client.post("/api/teams", json={"name": "Aurora Studio"}, headers=h)
    assert r.status_code == 201
    team = r.json()
    assert team["name"] == "Aurora Studio"
    assert team["my_role"] == "owner"

    # Listed for the owner.
    listed = (await client.get("/api/teams", headers=h)).json()
    assert len(listed) == 1
    assert listed[0]["id"] == team["id"]

    # Members has exactly the owner.
    members = (await client.get(f"/api/teams/{team['id']}/members", headers=h)).json()
    assert len(members) == 1
    assert members[0]["email"] == "alice@x.co"
    assert members[0]["role"] == "owner"


async def test_add_existing_user_as_member(client: AsyncClient) -> None:
    tok_a = await _register(client, "a@x.co", "Alice")
    ha = {"Authorization": f"Bearer {tok_a}"}
    team = (
        await client.post("/api/teams", json={"name": "T1"}, headers=ha)
    ).json()

    # Bob exists.
    await _register(client, "bob@x.co", "Bob")
    add = await client.post(
        f"/api/teams/{team['id']}/members",
        json={"email": "bob@x.co", "role": "editor"},
        headers=ha,
    )
    assert add.status_code == 201
    assert add.json()["role"] == "editor"

    members = (
        await client.get(f"/api/teams/{team['id']}/members", headers=ha)
    ).json()
    assert {m["email"] for m in members} == {"a@x.co", "bob@x.co"}

    # Bob can now see the team in his own list.
    tok_b = (
        await client.post(
            "/api/auth/login", json={"email": "bob@x.co", "password": "longenough1"}
        )
    ).json()["access_token"]
    hb = {"Authorization": f"Bearer {tok_b}"}
    bobs = (await client.get("/api/teams", headers=hb)).json()
    assert len(bobs) == 1
    assert bobs[0]["my_role"] == "editor"


async def test_invite_unknown_email_404s(client: AsyncClient) -> None:
    tok = await _register(client, "a@x.co")
    h = {"Authorization": f"Bearer {tok}"}
    team = (await client.post("/api/teams", json={"name": "T"}, headers=h)).json()
    r = await client.post(
        f"/api/teams/{team['id']}/members",
        json={"email": "ghost@x.co", "role": "viewer"},
        headers=h,
    )
    assert r.status_code == 404


async def test_non_owner_cant_add_members(client: AsyncClient) -> None:
    tok_a = await _register(client, "a@x.co")
    ha = {"Authorization": f"Bearer {tok_a}"}
    team = (await client.post("/api/teams", json={"name": "T"}, headers=ha)).json()
    await _register(client, "b@x.co")
    await client.post(
        f"/api/teams/{team['id']}/members",
        json={"email": "b@x.co", "role": "viewer"},
        headers=ha,
    )
    tok_b = (
        await client.post(
            "/api/auth/login", json={"email": "b@x.co", "password": "longenough1"}
        )
    ).json()["access_token"]
    await _register(client, "c@x.co")
    r = await client.post(
        f"/api/teams/{team['id']}/members",
        json={"email": "c@x.co", "role": "viewer"},
        headers={"Authorization": f"Bearer {tok_b}"},
    )
    assert r.status_code == 403


async def test_owner_removes_member(client: AsyncClient) -> None:
    tok_a = await _register(client, "a@x.co")
    ha = {"Authorization": f"Bearer {tok_a}"}
    team = (await client.post("/api/teams", json={"name": "T"}, headers=ha)).json()
    await _register(client, "b@x.co")
    add = (
        await client.post(
            f"/api/teams/{team['id']}/members",
            json={"email": "b@x.co", "role": "viewer"},
            headers=ha,
        )
    ).json()
    rm = await client.delete(
        f"/api/teams/{team['id']}/members/{add['id']}", headers=ha
    )
    assert rm.status_code == 204
    members = (
        await client.get(f"/api/teams/{team['id']}/members", headers=ha)
    ).json()
    assert len(members) == 1


async def test_non_member_gets_404_on_team_endpoints(client: AsyncClient) -> None:
    tok_a = await _register(client, "a@x.co")
    ha = {"Authorization": f"Bearer {tok_a}"}
    team = (await client.post("/api/teams", json={"name": "T"}, headers=ha)).json()
    tok_outsider = await _register(client, "out@x.co")
    ho = {"Authorization": f"Bearer {tok_outsider}"}
    assert (await client.get(f"/api/teams/{team['id']}", headers=ho)).status_code == 404
    assert (
        await client.get(f"/api/teams/{team['id']}/members", headers=ho)
    ).status_code == 404


async def test_teams_endpoints_require_auth(client: AsyncClient) -> None:
    assert (await client.get("/api/teams")).status_code == 401
    assert (await client.post("/api/teams", json={"name": "x"})).status_code == 401
