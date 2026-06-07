"""Community feed: only public + done renders, freshest first, author flattened."""

from httpx import AsyncClient


async def _register(client: AsyncClient, email: str, display: str = "") -> str:
    r = await client.post(
        "/api/auth/register",
        json={"email": email, "password": "longenough1", "display_name": display},
    )
    return r.json()["access_token"]


async def test_feed_is_empty_by_default(client: AsyncClient) -> None:
    r = await client.get("/api/community/feed")
    assert r.status_code == 200
    assert r.json() == []


async def test_publish_then_feed(client: AsyncClient) -> None:
    tok = await _register(client, "alice@x.co", "Alice")
    h = {"Authorization": f"Bearer {tok}"}
    job = (
        await client.post("/api/render", json={"prompt": "a galaxy"}, headers=h)
    ).json()
    # Default: not in feed.
    assert (await client.get("/api/community/feed")).json() == []

    # Publish.
    upd = await client.patch(
        f"/api/render/{job['id']}", json={"is_public": True}, headers=h
    )
    assert upd.status_code == 200
    assert upd.json()["is_public"] is True

    feed = (await client.get("/api/community/feed")).json()
    assert len(feed) == 1
    assert feed[0]["author"] == "Alice"
    assert feed[0]["prompt"] == "a galaxy"

    # Un-publish removes it.
    await client.patch(f"/api/render/{job['id']}", json={"is_public": False}, headers=h)
    assert (await client.get("/api/community/feed")).json() == []


async def test_feed_falls_back_to_email_prefix_for_anonymous_author(
    client: AsyncClient,
) -> None:
    tok = await _register(client, "noname@x.co", display="")
    h = {"Authorization": f"Bearer {tok}"}
    job = (await client.post("/api/render", json={"prompt": "x"}, headers=h)).json()
    await client.patch(f"/api/render/{job['id']}", json={"is_public": True}, headers=h)
    feed = (await client.get("/api/community/feed")).json()
    assert feed[0]["author"] == "noname"


async def test_feed_item_only_when_public_and_done(client: AsyncClient) -> None:
    tok = await _register(client, "remix@x.co", "Remi")
    h = {"Authorization": f"Bearer {tok}"}
    job = (await client.post("/api/render", json={"prompt": "a remix prompt"}, headers=h)).json()

    # Private → 404
    assert (await client.get(f"/api/community/feed/{job['id']}")).status_code == 404

    # Publish → 200
    await client.patch(f"/api/render/{job['id']}", json={"is_public": True}, headers=h)
    r = await client.get(f"/api/community/feed/{job['id']}")
    assert r.status_code == 200
    body = r.json()
    assert body["prompt"] == "a remix prompt"
    assert body["author"] == "Remi"

    # Unknown id → 404
    assert (await client.get("/api/community/feed/no-such-id")).status_code == 404


async def test_patch_requires_ownership(client: AsyncClient) -> None:
    tok_a = await _register(client, "a@x.co")
    job = (
        await client.post(
            "/api/render", json={"prompt": "p"}, headers={"Authorization": f"Bearer {tok_a}"}
        )
    ).json()
    tok_b = await _register(client, "b@x.co")
    r = await client.patch(
        f"/api/render/{job['id']}",
        json={"is_public": True},
        headers={"Authorization": f"Bearer {tok_b}"},
    )
    assert r.status_code == 404
