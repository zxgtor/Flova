"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { HomeNav } from "@/components/home/HomeNav";
import { useAuth } from "@/lib/auth";
import { api, type MeUsage, type RenderJobOut } from "@/lib/api";

function humanBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function monthLabel(key: string): string {
  // "2025-11" → "Nov"
  const [, m] = key.split("-");
  const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months[Number(m)] ?? key;
}

export default function UsageReportPage() {
  const auth = useAuth();
  const [usage, setUsage] = useState<MeUsage | null>(null);
  const [recent, setRecent] = useState<RenderJobOut[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (token: string) => {
    try {
      const [u, r] = await Promise.all([
        api.meUsage(token),
        api.meRecentRenders(token, 10),
      ]);
      setUsage(u);
      setRecent(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, []);

  useEffect(() => {
    if (auth.loading || !auth.token) return;
    void load(auth.token);
  }, [auth.loading, auth.token, load]);

  if (!auth.loading && !auth.token) {
    return (
      <>
        <HomeNav />
        <main className="p-8 text-center">
          <Link href="/signin?next=/account/usage" className="text-gold hover:underline">
            Sign in
          </Link>{" "}
          to view your usage report.
        </main>
      </>
    );
  }

  const maxMonthly = usage
    ? Math.max(1, ...usage.renders_by_month.map((m) => m.count))
    : 1;

  return (
    <>
      <HomeNav />
      <main className="p-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h1 className="font-display text-2xl">Usage Report</h1>
          <Link
            href="/account/billing"
            className="rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-4 py-1.5 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
          >
            Manage Plan
          </Link>
        </div>

        {error && (
          <p
            role="alert"
            className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300"
          >
            {error}
          </p>
        )}

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <Card
            label="Total Renders"
            value={usage?.total_renders ?? "…"}
            hint={
              usage
                ? `${usage.successful_renders} done · ${usage.failed_renders} failed`
                : undefined
            }
          />
          <Card
            label="Storage Used"
            value={usage ? humanBytes(usage.storage_bytes) : "…"}
            hint={usage ? `${usage.file_count} file${usage.file_count === 1 ? "" : "s"}` : undefined}
          />
          <Card
            label="Failure Rate"
            value={
              usage && usage.total_renders > 0
                ? `${Math.round((usage.failed_renders / usage.total_renders) * 100)}%`
                : "—"
            }
            hint={usage && usage.failed_renders > 0 ? "Investigate failures below" : undefined}
            accent={
              usage && usage.failed_renders > 0 && usage.total_renders > 0
                ? "warn"
                : undefined
            }
          />
        </section>

        <section className="mb-6 rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">
            Renders Over Time (last 12 months)
          </h2>
          {usage === null ? (
            <p className="text-sm text-muted">Loading…</p>
          ) : (
            <>
              <div className="flex h-40 items-end gap-1" data-testid="monthly-chart">
                {usage.renders_by_month.map((m) => (
                  <div
                    key={m.month}
                    data-testid="monthly-bar"
                    title={`${m.month}: ${m.count}`}
                    className="flex-1 rounded-t bg-gold/60"
                    style={{ height: `${(m.count / maxMonthly) * 100}%`, minHeight: "2px" }}
                  />
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-muted">
                {usage.renders_by_month
                  .filter((_, i) => i % 3 === 0)
                  .map((m) => (
                    <span key={m.month}>{monthLabel(m.month)}</span>
                  ))}
                <span>{monthLabel(usage.renders_by_month[11]?.month ?? "")}</span>
              </div>
            </>
          )}
        </section>

        <section className="rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">Activity Log</h2>
          {recent === null ? (
            <p className="text-sm text-muted">Loading…</p>
          ) : recent.length === 0 ? (
            <p className="text-sm text-muted">
              No render activity yet.{" "}
              <Link href="/home" className="text-gold hover:underline">
                Submit a prompt
              </Link>{" "}
              to populate this report.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="py-2 text-left">Date</th>
                  <th className="py-2 text-left">Prompt</th>
                  <th className="py-2 text-left">Status</th>
                  <th className="py-2 text-right"></th>
                </tr>
              </thead>
              <tbody>
                {recent.map((j) => (
                  <tr
                    key={j.id}
                    data-testid="log-row"
                    className="border-t border-border text-text"
                  >
                    <td className="py-2 text-muted">
                      {new Date(j.created_at).toLocaleDateString()}
                    </td>
                    <td className="max-w-md truncate py-2">{j.prompt}</td>
                    <td className="py-2">
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
                    </td>
                    <td className="py-2 text-right">
                      <Link
                        href={`/render/${j.id}`}
                        className="text-xs text-muted hover:text-gold"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
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
