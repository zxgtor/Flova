"""Billing endpoints.

- GET  /api/billing/subscription — current user's subscription state.
- POST /api/billing/checkout     — create a provider checkout session, return URL.
- POST /api/billing/portal       — create a customer portal session (Stripe only).
- POST /api/billing/stub-activate — stub-only: flip the user to Pro immediately.
- POST /api/billing/webhook      — Stripe webhook receiver.
"""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from flova_api.billing import StubBillingProvider, get_billing
from flova_api.db import get_session
from flova_api.models import Subscription, SubscriptionPlan, SubscriptionStatus, User
from flova_api.schemas import CheckoutOut, SubscriptionOut
from flova_api.security import current_user
from flova_api.settings import get_settings

router = APIRouter(prefix="/api/billing", tags=["billing"])


async def _load_or_create(session: AsyncSession, user: User) -> Subscription:
    row = await session.execute(select(Subscription).where(Subscription.user_id == user.id))
    sub = row.scalar_one_or_none()
    if sub is None:
        sub = Subscription(user_id=user.id)
        session.add(sub)
        await session.commit()
        await session.refresh(sub)
    return sub


@router.get("/subscription", response_model=SubscriptionOut)
async def get_subscription(
    user: Annotated[User, Depends(current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> SubscriptionOut:
    sub = await _load_or_create(session, user)
    return SubscriptionOut(
        plan=sub.plan,
        status=sub.status,
        current_period_end=sub.current_period_end,
        provider=get_settings().billing_provider,
    )


@router.post("/checkout", response_model=CheckoutOut)
async def create_checkout(
    user: Annotated[User, Depends(current_user)],
) -> CheckoutOut:
    session = get_billing().create_checkout(user.id, user.email)
    return CheckoutOut(url=session.url)


@router.post("/portal", response_model=CheckoutOut)
async def create_portal(
    user: Annotated[User, Depends(current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> CheckoutOut:
    sub = await _load_or_create(session, user)
    if not sub.stripe_customer_id:
        raise HTTPException(status_code=400, detail="No customer record yet")
    url = get_billing().create_portal(sub.stripe_customer_id)
    return CheckoutOut(url=url)


class _StubActivate(BaseModel):
    pass


@router.post("/stub-activate", response_model=SubscriptionOut)
async def stub_activate(
    _body: _StubActivate,
    user: Annotated[User, Depends(current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> SubscriptionOut:
    """Stub-only convenience: complete the 'checkout' without an external provider."""
    if not isinstance(get_billing(), StubBillingProvider):
        raise HTTPException(status_code=403, detail="stub-activate disabled")

    sub = await _load_or_create(session, user)
    sub.plan = SubscriptionPlan.pro
    sub.status = SubscriptionStatus.active
    sub.updated_at = datetime.now(UTC)
    await session.commit()
    await session.refresh(sub)
    return SubscriptionOut(
        plan=sub.plan,
        status=sub.status,
        current_period_end=sub.current_period_end,
        provider="stub",
    )


@router.post("/webhook", status_code=204)
async def webhook(
    request: Request,
    session: Annotated[AsyncSession, Depends(get_session)],
    stripe_signature: Annotated[str | None, Header(alias="Stripe-Signature")] = None,
) -> None:
    payload = await request.body()
    if not stripe_signature:
        raise HTTPException(status_code=400, detail="missing signature")
    event = get_billing().parse_webhook(payload, stripe_signature)

    if not event.user_id:
        # Nothing actionable without a user mapping.
        return

    row = await session.execute(
        select(Subscription).where(Subscription.user_id == event.user_id)
    )
    sub = row.scalar_one_or_none()
    if sub is None:
        sub = Subscription(user_id=event.user_id)
        session.add(sub)

    if event.event_type in {"checkout.session.completed", "customer.subscription.created"}:
        sub.plan = SubscriptionPlan.pro
        sub.status = SubscriptionStatus.active
    elif event.event_type == "customer.subscription.updated":
        if event.status == "active":
            sub.status = SubscriptionStatus.active
        elif event.status == "past_due":
            sub.status = SubscriptionStatus.past_due
        elif event.status in {"canceled", "incomplete_expired"}:
            sub.status = SubscriptionStatus.canceled
            sub.plan = SubscriptionPlan.free
    elif event.event_type == "customer.subscription.deleted":
        sub.status = SubscriptionStatus.canceled
        sub.plan = SubscriptionPlan.free

    if event.customer_id:
        sub.stripe_customer_id = event.customer_id
    if event.subscription_id:
        sub.stripe_subscription_id = event.subscription_id
    if event.current_period_end_unix:
        sub.current_period_end = datetime.fromtimestamp(
            event.current_period_end_unix, tz=UTC
        )
    sub.updated_at = datetime.now(UTC)
    await session.commit()
