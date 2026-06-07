"""Style marketplace: publish, list, detail, import-to-mine, isolation."""

from httpx import AsyncClient


async def _register(client: AsyncClient, email: str, display: str = "") -> str:
    r = await client.post(
        "/api/auth/register",
        json={"email": email, "password": "longenough1", "display_name": display},
    )
    return r.json()["access_token"]


async def _make_style(client: AsyncClient, h: dict, name: str = "Ghibli") -> dict:
    r = await client.post(
        "/api/presets",
        json={
            "kind": "style",
            "name": name,
            "payload": {"prompt_template": "{prompt}, studio ghibli"},
        },
        headers=h,
    )
    return r.json()


async def test_marketplace_empty_by_default(client: AsyncClient) -> None:
    r = await client.get("/api/community/styles")
    assert r.status_code == 200
    assert r.json() == []


async def test_publish_style_then_appears(client: AsyncClient) -> None:
    tok = await _register(client, "alice@x.co", "Alice")
    h = {"Authorization": f"Bearer {tok}"}
    style = await _make_style(client, h, "Ghibli Watercolor")

    # Private by default → not in marketplace.
    assert (await client.get("/api/community/styles")).json() == []
    assert (
        await client.get(f"/api/community/styles/{style['id']}")
    ).status_code == 404

    # Publish via PATCH.
    upd = await client.patch(
        f"/api/presets/{style['id']}", json={"is_public": True}, headers=h
    )
    assert upd.status_code == 200
    assert upd.json()["is_public"] is True

    listed = (await client.get("/api/community/styles")).json()
    assert len(listed) == 1
    assert listed[0]["author"] == "Alice"
    assert listed[0]["name"] == "Ghibli Watercolor"

    one = (await client.get(f"/api/community/styles/{style['id']}")).json()
    assert one["name"] == "Ghibli Watercolor"


async def test_only_style_kind_in_marketplace(client: AsyncClient) -> None:
    tok = await _register(client, "alice@x.co")
    h = {"Authorization": f"Bearer {tok}"}
    # Public preset but wrong kind.
    p = await client.post(
        "/api/presets",
        json={"kind": "prompt", "name": "P", "payload": {"text": "hi"}},
        headers=h,
    )
    await client.patch(
        f"/api/presets/{p.json()['id']}", json={"is_public": True}, headers=h
    )
    assert (await client.get("/api/community/styles")).json() == []


async def test_import_clones_style_to_caller_library(client: AsyncClient) -> None:
    # Alice authors + publishes a style.
    tok_a = await _register(client, "alice@x.co", "Alice")
    ha = {"Authorization": f"Bearer {tok_a}"}
    style = await _make_style(client, ha, "Ghibli")
    await client.patch(
        f"/api/presets/{style['id']}", json={"is_public": True}, headers=ha
    )

    # Bob imports.
    tok_b = await _register(client, "bob@x.co", "Bob")
    hb = {"Authorization": f"Bearer {tok_b}"}
    imp = await client.post(
        f"/api/community/styles/{style['id']}/import", headers=hb
    )
    assert imp.status_code == 201
    body = imp.json()
    # Fresh row, NOT the same id.
    assert body["id"] != style["id"]
    assert body["kind"] == "style"
    assert body["payload"]["prompt_template"] == "{prompt}, studio ghibli"
    # Imported as private by default.
    assert body["is_public"] is False

    # Now in Bob's library.
    bobs = (await client.get("/api/presets?kind=style", headers=hb)).json()
    assert len(bobs) == 1


async def test_cannot_import_own_style(client: AsyncClient) -> None:
    tok = await _register(client, "alice@x.co")
    h = {"Authorization": f"Bearer {tok}"}
    style = await _make_style(client, h)
    await client.patch(f"/api/presets/{style['id']}", json={"is_public": True}, headers=h)
    r = await client.post(f"/api/community/styles/{style['id']}/import", headers=h)
    assert r.status_code == 400


async def test_import_requires_auth(client: AsyncClient) -> None:
    tok = await _register(client, "alice@x.co")
    h = {"Authorization": f"Bearer {tok}"}
    style = await _make_style(client, h)
    await client.patch(f"/api/presets/{style['id']}", json={"is_public": True}, headers=h)
    r = await client.post(f"/api/community/styles/{style['id']}/import")
    assert r.status_code == 401


async def test_patch_preset_requires_ownership(client: AsyncClient) -> None:
    tok_a = await _register(client, "alice@x.co")
    ha = {"Authorization": f"Bearer {tok_a}"}
    style = await _make_style(client, ha)
    tok_b = await _register(client, "bob@x.co")
    r = await client.patch(
        f"/api/presets/{style['id']}",
        json={"is_public": True},
        headers={"Authorization": f"Bearer {tok_b}"},
    )
    assert r.status_code == 404
