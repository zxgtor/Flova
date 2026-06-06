"""BillingProvider — abstracts Stripe (or any other provider) away from app code.

Same pattern as StorageProvider / VideoProvider:
- StubBillingProvider — flips a subscription to active immediately. Default; tests
  + offline dev. The "checkout url" it returns just lands back on the success page.
- StripeBillingProvider — creates real Checkout Sessions, customer portal sessions,
  and validates webhook signatures.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol

from flova_api.settings import get_settings


@dataclass(frozen=True)
class CheckoutSession:
    url: str
    external_id: str  # provider-side session id (or "stub" for the stub)


@dataclass(frozen=True)
class WebhookEvent:
    event_type: str  # e.g. "checkout.session.completed"
    customer_id: str | None = None
    subscription_id: str | None = None
    # We only consume status + period end in the skeleton.
    status: str | None = None  # "active" | "past_due" | "canceled" | ...
    current_period_end_unix: int | None = None
    user_id: str | None = None  # carried back via session metadata


class BillingProvider(Protocol):
    def create_checkout(self, user_id: str, user_email: str) -> CheckoutSession: ...
    def create_portal(self, customer_id: str) -> str: ...
    def parse_webhook(self, payload: bytes, signature: str) -> WebhookEvent: ...


# ---------- Stub ----------------------------------------------------------------------


class StubBillingProvider:
    def create_checkout(self, user_id: str, user_email: str) -> CheckoutSession:
        s = get_settings()
        # No real provider; the frontend just lands on the success page which then
        # asks the API to flip the subscription. We surface that flow via the
        # `?session=stub-<user_id>` query so the FE knows it's the stub path.
        return CheckoutSession(
            url=f"{s.billing_success_url}&session=stub-{user_id}",
            external_id=f"stub-{user_id}",
        )

    def create_portal(self, customer_id: str) -> str:
        s = get_settings()
        return s.billing_cancel_url  # stub has no portal; bounce home

    def parse_webhook(self, payload: bytes, signature: str) -> WebhookEvent:
        # Stub never sends webhooks. Tests exercise the activation path directly via
        # the /api/billing/stub-activate endpoint.
        raise RuntimeError("Stub provider receives no webhooks")


# ---------- Stripe --------------------------------------------------------------------


class StripeError(RuntimeError):
    pass


class StripeBillingProvider:
    """Calls Stripe via the official `stripe` SDK."""

    def __init__(self) -> None:
        s = get_settings()
        if not s.stripe_secret_key or not s.stripe_price_id:
            raise StripeError("Stripe is not configured")
        import stripe  # lazy import — keeps dev/test light when stub is in use

        stripe.api_key = s.stripe_secret_key
        self._stripe = stripe
        self._price = s.stripe_price_id
        self._webhook_secret = s.stripe_webhook_secret

    def create_checkout(self, user_id: str, user_email: str) -> CheckoutSession:
        s = get_settings()
        session = self._stripe.checkout.Session.create(
            mode="subscription",
            customer_email=user_email,
            line_items=[{"price": self._price, "quantity": 1}],
            success_url=s.billing_success_url,
            cancel_url=s.billing_cancel_url,
            metadata={"flova_user_id": user_id},
            subscription_data={"metadata": {"flova_user_id": user_id}},
        )
        return CheckoutSession(url=session.url, external_id=session.id)

    def create_portal(self, customer_id: str) -> str:
        s = get_settings()
        portal = self._stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=s.billing_success_url,
        )
        return portal.url

    def parse_webhook(self, payload: bytes, signature: str) -> WebhookEvent:
        if not self._webhook_secret:
            raise StripeError("STRIPE_WEBHOOK_SECRET not set")
        try:
            event = self._stripe.Webhook.construct_event(
                payload, signature, self._webhook_secret
            )
        except Exception as e:  # SignatureVerificationError or value errors
            raise StripeError(f"Invalid webhook signature: {e}") from e

        obj = event["data"]["object"]
        event_type: str = event["type"]
        # Defensive .get's — Stripe payload shape varies a little by event type.
        return WebhookEvent(
            event_type=event_type,
            customer_id=obj.get("customer"),
            subscription_id=obj.get("subscription") or obj.get("id"),
            status=obj.get("status"),
            current_period_end_unix=obj.get("current_period_end"),
            user_id=(obj.get("metadata") or {}).get("flova_user_id"),
        )


def get_billing() -> BillingProvider:
    s = get_settings()
    if s.billing_provider == "stripe":
        return StripeBillingProvider()
    return StubBillingProvider()
