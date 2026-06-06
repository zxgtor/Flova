"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { HomeNav } from "@/components/home/HomeNav";
import { useAuth } from "@/lib/auth";
import { api, type SubscriptionOut } from "@/lib/api";

const PLAN_LABEL: Record<string, string> = {
  free: "Free",
  pro: "Pro",
};

const STATUS_STYLES: Record<string, string> = {
  none: "bg-surface-2 text-muted",
  active: "bg-emerald-500/20 text-emerald-400",
  past_due: "bg-amber-500/20 text-amber-300",
  canceled: "bg-red-500/20 text-red-300",
};

export default function BillingPage() {
  const auth = useAuth();
  const [sub, setSub] = useState<SubscriptionOut | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (token: string) => {
    try {
      setSub(await api.getSubscription(token));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, []);

  useEffect(() => {
    if (auth.loading || !auth.token) return;
    refresh(auth.token);
  }, [auth.loading, auth.token, refresh]);

  async function onUpgrade() {
    if (!auth.token || !sub) return;
    setBusy(true);
    setError(null);
    try {
      if (sub.provider === "stub") {
        // Stub provider: flip server-side and refresh inline. No redirect needed.
        const updated = await api.stubActivate(auth.token);
        setSub(updated);
      } else {
        const { url } = await api.checkout(auth.token);
        window.location.href = url;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upgrade failed");
    } finally {
      setBusy(false);
    }
  }

  async function onManage() {
    if (!auth.token) return;
    setBusy(true);
    try {
      const { url } = await api.portal(auth.token);
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Portal unavailable");
    } finally {
      setBusy(false);
    }
  }

  if (!auth.loading && !auth.token) {
    return (
      <>
        <HomeNav />
        <main className="p-8 text-center">
          <Link href="/signin?next=/account/billing" className="text-gold hover:underline">
            Sign in
          </Link>{" "}
          to manage billing.
        </main>
      </>
    );
  }

  return (
    <>
      <HomeNav />
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="mb-6 font-display text-2xl">Billing &amp; Subscription</h1>

        {error && (
          <p role="alert" className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
            {error}
          </p>
        )}

        {sub === null ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : (
          <section
            data-testid="subscription-card"
            className="rounded-2xl border border-border bg-surface p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted">Current Plan</div>
                <div className="mt-1 font-display text-2xl">{PLAN_LABEL[sub.plan]}</div>
              </div>
              <span
                data-testid="subscription-status"
                className={"rounded-full px-3 py-1 text-xs " + (STATUS_STYLES[sub.status] ?? "")}
              >
                {sub.status}
              </span>
            </div>

            {sub.current_period_end && (
              <p className="text-xs text-muted">
                Renews on {new Date(sub.current_period_end).toLocaleDateString()}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              {sub.plan === "free" && (
                <button
                  type="button"
                  onClick={onUpgrade}
                  disabled={busy}
                  className="rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-5 py-2 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] disabled:opacity-50"
                >
                  {busy ? "…" : "Upgrade to Pro"}
                </button>
              )}
              {sub.plan === "pro" && sub.provider === "stripe" && (
                <button
                  type="button"
                  onClick={onManage}
                  disabled={busy}
                  className="rounded-md border border-gold px-5 py-2 text-sm text-gold hover:bg-gold/10 disabled:opacity-50"
                >
                  Manage Subscription
                </button>
              )}
            </div>

            <p className="mt-6 text-[10px] uppercase tracking-wider text-muted">
              Provider: {sub.provider}
            </p>
          </section>
        )}
      </main>
    </>
  );
}
