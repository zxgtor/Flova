"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { HomeNav } from "@/components/home/HomeNav";
import { useAuth } from "@/lib/auth";
import { api, type MeStats, type RenderJobOut } from "@/lib/api";

export default function UserProfilePage() {
  const auth = useAuth();
  const [stats, setStats] = useState<MeStats | null>(null);
  const [recent, setRecent] = useState<RenderJobOut[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (token: string) => {
    try {
      const [s, r] = await Promise.all([
        api.meStats(token),
        api.meRecentRenders(token, 12),
      ]);
      setStats(s);
      setRecent(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, []);

  useEffect(() => {
    if (auth.loading || !auth.token) return;
    load(auth.token);
  }, [auth.loading, auth.token, load]);

  if (!auth.loading && !auth.token) {
    return (
      <>
        <HomeNav />
        <main className="p-8 text-center">
          <Link href="/signin?next=/account/profile" className="text-gold hover:underline">
            Sign in
          </Link>{" "}
          to view your profile.
        </main>
      </>
    );
  }

  const handle =
    auth.user?.display_name?.trim() || auth.user?.email.split("@")[0] || "you";

  return (
    <>
      <HomeNav />
      <main className="p-6">
        <header className="mb-6 flex items-center gap-6 rounded-2xl border border-border bg-surface p-6">
          <div className="h-16 w-16 rounded-full border border-gold/50 bg-gradient-to-b from-surface-2 via-surface to-bg" />
          <div className="flex-1">
            <h1 className="font-display text-2xl">@{handle}</h1>
            <p className="text-sm text-muted">{auth.user?.email}</p>
          </div>
          <div className="flex gap-6 text-center">
            <Stat label="Total Renders" value={stats?.total_renders ?? "…"} />
            <Stat label="Successful" value={stats?.successful_renders ?? "…"} />
            <Stat label="Failed" value={stats?.failed_renders ?? "…"} />
          </div>
        </header>

        {error && (
          <p
            role="alert"
            className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300"
          >
            {error}
          </p>
        )}

        <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">Recent Renders</h2>
        {recent === null ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : recent.length === 0 ? (
          <p className="text-sm text-muted">
            No renders yet.{" "}
            <Link href="/home" className="text-gold hover:underline">
              Submit your first prompt
            </Link>{" "}
            to get started.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" data-testid="recent-list">
            {recent.map((j) => (
              <li
                key={j.id}
                data-testid="recent-row"
                className="rounded-xl border border-border bg-surface p-4 text-sm"
              >
                <div className="line-clamp-2 text-text">{j.prompt}</div>
                <div className="mt-2 flex items-center justify-between">
                  <span
                    className={
                      "rounded-full px-2 py-0.5 text-xs " +
                      (j.status === "done"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : j.status === "failed"
                          ? "bg-red-500/20 text-red-300"
                          : "bg-gold/20 text-gold")
                    }
                  >
                    {j.status}
                  </span>
                  <Link
                    href={`/render/${j.id}`}
                    className="text-xs text-muted hover:text-gold"
                  >
                    Open →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="font-display text-xl text-text">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted">{label}</div>
    </div>
  );
}
