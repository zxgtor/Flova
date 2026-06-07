"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { HomeNav } from "@/components/home/HomeNav";
import { useAuth } from "@/lib/auth";
import { api, type MeStats, type RenderJobOut, type RenderStatus } from "@/lib/api";

type Filter = "all" | RenderStatus;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "queued", label: "Queued" },
  { id: "running", label: "Running" },
  { id: "done", label: "Done" },
  { id: "failed", label: "Failed" },
];

const STATUS_STYLES: Record<RenderStatus, string> = {
  queued: "bg-surface-2 text-muted",
  running: "bg-gold/20 text-gold",
  done: "bg-emerald-500/20 text-emerald-400",
  failed: "bg-red-500/20 text-red-300",
};

export default function BatchRenderPage() {
  const auth = useAuth();
  const [stats, setStats] = useState<MeStats | null>(null);
  const [jobs, setJobs] = useState<RenderJobOut[] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (token: string, f: Filter) => {
      try {
        const status = f === "all" ? undefined : f;
        const [s, j] = await Promise.all([
          api.meStats(token),
          api.meRecentRenders(token, 50, status),
        ]);
        setStats(s);
        setJobs(j);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load");
      }
    },
    [],
  );

  useEffect(() => {
    if (auth.loading || !auth.token) return;
    void load(auth.token, filter);
  }, [auth.loading, auth.token, filter, load]);

  if (!auth.loading && !auth.token) {
    return (
      <>
        <HomeNav />
        <main className="p-8 text-center">
          <Link href="/signin?next=/manage/render" className="text-gold hover:underline">
            Sign in
          </Link>{" "}
          to view your renders.
        </main>
      </>
    );
  }

  const queued = jobs?.filter((j) => j.status === "queued").length ?? 0;
  const running = jobs?.filter((j) => j.status === "running").length ?? 0;

  return (
    <>
      <HomeNav />
      <main className="p-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h1 className="font-display text-2xl">Render Dashboard</h1>
          <Link
            href="/home"
            className="rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-4 py-1.5 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
          >
            + New Render
          </Link>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <Card label="Total" value={stats?.total_renders ?? "…"} />
          <Card label="Active" value={queued + running} hint="Queued + Running" />
          <Card label="Completed" value={stats?.successful_renders ?? "…"} />
          <Card
            label="Failed"
            value={stats?.failed_renders ?? "…"}
            accent={stats && stats.failed_renders > 0 ? "warn" : undefined}
          />
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              data-testid="filter-pill"
              className={
                "rounded-full border px-3 py-1 text-xs " +
                (filter === f.id
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-border text-muted hover:border-gold hover:text-gold")
              }
            >
              {f.label}
            </button>
          ))}
        </div>

        {error && (
          <p role="alert" className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
            {error}
          </p>
        )}

        {jobs === null ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : jobs.length === 0 ? (
          <p className="text-sm text-muted">
            {filter === "all"
              ? "No renders yet."
              : `No ${filter} renders.`}{" "}
            {filter === "all" && (
              <Link href="/home" className="text-gold hover:underline">
                Submit your first prompt
              </Link>
            )}
          </p>
        ) : (
          <ul className="space-y-2" data-testid="render-list">
            {jobs.map((j) => (
              <li
                key={j.id}
                data-testid="render-row"
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-text">{j.prompt}</div>
                  <div className="mt-0.5 text-xs text-muted">
                    {new Date(j.created_at).toLocaleString()}
                  </div>
                </div>
                <span
                  className={
                    "shrink-0 rounded-full px-2 py-0.5 text-xs " + STATUS_STYLES[j.status]
                  }
                >
                  {j.status}
                </span>
                <Link
                  href={`/render/${j.id}`}
                  className="shrink-0 rounded-md border border-border px-3 py-1 text-xs text-muted hover:border-gold hover:text-gold"
                >
                  Open
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}

function Card({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "warn";
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="text-xs uppercase tracking-wider text-muted">{label}</div>
      <div
        className={
          "mt-2 font-display text-2xl " + (accent === "warn" ? "text-red-300" : "text-text")
        }
      >
        {value}
      </div>
      {hint && <div className="mt-1 text-[10px] text-muted">{hint}</div>}
    </div>
  );
}
