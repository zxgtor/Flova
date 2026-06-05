from httpx import AsyncClient


async def test_health(client: AsyncClient) -> None:
    r = await client.get("/api/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "ok"
    assert data["version"]
