"""Rate limiter — in tests it's disabled by `ENV=test`, but we verify the wiring."""

from httpx import AsyncClient

from flova_api.ratelimit import limiter


def test_limiter_is_disabled_in_tests() -> None:
    assert limiter.enabled is False


async def test_register_succeeds_in_test_mode(client: AsyncClient) -> None:
    # Twice in quick succession proves the limiter doesn't block.
    for email in ("a@x.co", "b@x.co"):
        r = await client.post(
            "/api/auth/register",
            json={"email": email, "password": "longenough1", "display_name": ""},
        )
        assert r.status_code == 201
