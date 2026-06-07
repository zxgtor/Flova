"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { HomeNav } from "@/components/home/HomeNav";
import { useAuth } from "@/lib/auth";
import { api, type ActivityItem, type MeWorkflow, type WorkflowStage } from "@/lib/api";

const STATUS_STYLES: Record<WorkflowStage["status"], string> = {
  complete: "bg-emerald-500/20 text-emerald-400",
  in_progress: "bg-gold/20 text-gold",
  todo: "bg-surface-2 text-muted",
};

const STAGE_ICON: Record<string, string> = {
  concept: "📝",
  asset: "🎨",
  storyboard: "🗂️",
  editing: "🎬",
  export: "📤",
};

const STAGE_HINT: Record<string, string> = {
  concept: "Save a prompt in the library to start.",
  asset: "Upload reference files or render an output.",
  storyboard: "Save a storyboard preset.",
  editing: "Save an editor configuration.",
  export: "Submit a prompt and let it finish.",
};

const ACTIVITY_BADGE: Record<ActivityItem["type"], string> = {
  render: "bg-gold/20 text-gold",
  file: "bg-emerald-500/20 text-emerald-400",
  preset: "bg-surface-2 text-muted",
};

export default function WorkflowPage() {
  const auth = useAuth();
  const [data, setData] = useState<MeWorkflow | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (token: string) => {
    try {
      setData(await api.meWorkflow(token));
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
          <Link href="/signin?next=/manage/workflow" className="text-gold hover:underline">
            Sign in
          </Link>{" "}
          to view your workflow.
        </main>
      </>
    );
  }

  return (
    <>
      <HomeNav />
      <main className="p-6">
        <div className="mb-6 flex items-end justify-between gap-3">
          <h1 className="font-display text-2xl">Workflow Manager</h1>
          <Link
            href="/home"
            className="rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-4 py-1.5 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
          >
            + New Render
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

        <section className="mb-8">
          <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">Pipeline</h2>
          {data === null ? (
            <p className="text-sm text-muted">Loading…</p>
          ) : (
            <ul
              className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
              data-testid="stage-list"
            >
              {data.stages.map((s) => (
                <li
                  key={s.id}
                  data-testid="stage-card"
                  className="rounded-xl border border-border bg-surface p-4"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <span aria-hidden className="text-2xl">
                      {STAGE_ICON[s.id] ?? "•"}
                    </span>
                    <span
                      className={
                        "rounded-full px-2 py-0.5 text-[10px] " + STATUS_STYLES[s.status]
                      }
                    >
                      {s.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-text">{s.label}</div>
                  <div className="mt-1 text-xs text-muted">
                    {s.count} item{s.count === 1 ? "" : "s"}
                  </div>
                  {s.status === "todo" && (
                    <p className="mt-2 text-[10px] text-muted">{STAGE_HINT[s.id] ?? ""}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">Recent Activity</h2>
          {data === null ? (
            <p className="text-sm text-muted">Loading…</p>
          ) : data.activity.length === 0 ? (
            <p className="text-sm text-muted">
              No activity yet.{" "}
              <Link href="/home" className="text-gold hover:underline">
                Submit your first prompt
              </Link>{" "}
              to populate this feed.
            </p>
          ) : (
            <ul className="space-y-2" data-testid="activity-list">
              {data.activity.map((a, i) => (
                <li
                  key={`${a.type}-${i}`}
                  data-testid="activity-row"
                  className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 text-sm"
                >
                  <span
                    className={
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] " +
                      ACTIVITY_BADGE[a.type]
                    }
                  >
                    {a.type}
                    {a.subtype ? `: ${a.subtype}` : ""}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-text">{a.label}</span>
                  <span className="shrink-0 text-xs text-muted">
                    {new Date(a.created_at).toLocaleString()}
                  </span>
                  {a.link && (
                    <Link
                      href={a.link}
                      className="shrink-0 rounded-md border border-border px-3 py-1 text-xs text-muted hover:border-gold hover:text-gold"
                    >
                      Open
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
