"""Billing — stub-mode end-to-end + Stripe provider guard."""

from httpx import AsyncClient


async def _auth(client: AsyncClient, email: str = "bill@x.co") -> str:
    r = await client.post(
        "/api/auth/register",
        json={"email": email, "password": "longenough1", "display_name": ""},
    )
    return r.json()["access_token"]


async def test_default_subscription_is_free(client: AsyncClient) -> None:
    tok = await _auth(client)
    r = await client.get(
        "/api/billing/subscription", headers={"Authorization": f"Bearer {tok}"}
    )
    assert r.status_code == 200
    body = r.json()
    assert body["plan"] == "free"
    assert body["status"] == "none"
    assert body["provider"] == "stub"


async def test_checkout_returns_url(client: AsyncClient) -> None:
    tok = await _auth(client)
    r = await client.post(
        "/api/billing/checkout", headers={"Authorization": f"Bearer {tok}"}
    )
    assert r.status_code == 200
    assert "url" in r.json()
    assert r.json()["url"].startswith("http")


async def test_stub_activate_promotes_to_pro(client: AsyncClient) -> None:
    tok = await _auth(client)
    h = {"Authorization": f"Bearer {tok}"}

    r = await client.post("/api/billing/stub-activate", json={}, headers=h)
    assert r.status_code == 200
    assert r.json()["plan"] == "pro"
    assert r.json()["status"] == "active"

    # subscription endpoint reflects the change
    r2 = await client.get("/api/billing/subscription", headers=h)
    assert r2.json()["plan"] == "pro"


async def test_billing_requires_auth(client: AsyncClient) -> None:
    assert (await client.get("/api/billing/subscription")).status_code == 401
    assert (await client.post("/api/billing/checkout")).status_code == 401


async def test_stripe_provider_misconfig_raises() -> None:
    """StripeBillingProvider should refuse to load without keys."""
    import pytest

    from flova_api.billing import StripeBillingProvider, StripeError

    with pytest.raises(StripeError):
        StripeBillingProvider()
