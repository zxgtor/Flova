# ADR-0004: Stripe Billing With a Provider Abstraction

Date: 2026-06-06
Status: Accepted

## Context
Frontend has a `/account/billing` page that was rendering static mock data
(plan, seat table, invoices). To make billing real we need: (a) a way to
take a payment without writing PCI code, (b) a place to record who's on which
plan, (c) a way to keep dev/test cheap and offline.

## Decision
Mirror the `VideoProvider` / `StorageProvider` pattern:

- **`BillingProvider` Protocol** with two methods that matter for the skeleton:
  `create_checkout`, `parse_webhook`, plus `create_portal` for Stripe's hosted
  management UI.
- **`StubBillingProvider`** is the default. It returns a "checkout URL" that
  just loops back to the frontend, and exposes a `/api/billing/stub-activate`
  endpoint the FE can call to instantly upgrade the user. Tests + offline dev
  never touch the network.
- **`StripeBillingProvider`** uses the official `stripe` SDK. Lazy import keeps
  startup light when the stub is selected.
- **`subscriptions` table** holds plan, status, period end, and the Stripe
  identifiers (`stripe_customer_id`, `stripe_subscription_id`). Unique on
  `user_id` — one subscription per user; team billing is a separate, deferred
  problem.
- **Webhook handler** maps the 4 Stripe events we care about
  (`checkout.session.completed`, `customer.subscription.{created,updated,deleted}`)
  onto our enum status. User mapping is carried through Stripe's `metadata`
  field (`flova_user_id`) so we never have to query.

## Consequences
- **Pricing is one Stripe price.** Multi-tier / annual / regional pricing is a
  follow-up (just add `stripe_price_id` per plan and a plan selector in
  `/api/billing/checkout`).
- **No seats.** When Group H (collaboration) gets real, this table will gain a
  `team_id` and seat-count, and Stripe's quantity field will be driven by
  team-member count.
- **Webhook security.** Stub mode rejects webhook calls (no signature secret).
  Stripe mode requires `STRIPE_WEBHOOK_SECRET`; the signature is verified via
  the SDK's `Webhook.construct_event`.
- **Idempotency.** Webhook handler is naturally idempotent (it reconciles on
  every call); Stripe also retries on non-2xx, so a transient DB error simply
  re-runs the same upsert.
