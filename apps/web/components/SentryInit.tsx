"use client";

import { useEffect } from "react";

/**
 * Frontend Sentry bootstrap.
 *
 * Init runs once in the browser only when NEXT_PUBLIC_SENTRY_DSN is set, so
 * dev/test environments stay silent and there's no dynamic import cost on
 * every render. We import lazily so the SDK only lands in the bundle of
 * sessions that actually report.
 */
export function SentryInit() {
  useEffect(() => {
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
    if (!dsn) return;
    let cancelled = false;
    void import("@sentry/browser").then((Sentry) => {
      if (cancelled) return;
      Sentry.init({
        dsn,
        environment: process.env.NEXT_PUBLIC_SENTRY_ENV ?? "production",
        // Conservative defaults — flip these on in env vars when needed.
        tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES ?? "0"),
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}
