from httpx import AsyncClient


async def test_register_login_me(client: AsyncClient) -> None:
    body = {"email": "a@b.co", "password": "longenough1", "display_name": "Aria"}
    r = await client.post("/api/auth/register", json=body)
    assert r.status_code == 201, r.text
    token = r.json()["access_token"]

    me = await client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["email"] == "a@b.co"

    again = await client.post(
        "/api/auth/login", json={"email": "a@b.co", "password": "longenough1"}
    )
    assert again.status_code == 200
    assert again.json()["access_token"]


async def test_login_rejects_bad_password(client: AsyncClient) -> None:
    await client.post(
        "/api/auth/register",
        json={"email": "a@b.co", "password": "longenough1", "display_name": ""},
    )
    bad = await client.post(
        "/api/auth/login", json={"email": "a@b.co", "password": "wrongpass1"}
    )
    assert bad.status_code == 401


async def test_me_requires_token(client: AsyncClient) -> None:
    r = await client.get("/api/auth/me")
    assert r.status_code == 401
