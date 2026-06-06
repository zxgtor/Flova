"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { HomeNav } from "@/components/home/HomeNav";
import { useAuth } from "@/lib/auth";
import { api, type RenderJobOut } from "@/lib/api";

const POLL_MS = 1500;

function DownloadButton({ fileId, token }: { fileId: string; token: string }) {
  const [busy, setBusy] = useState(false);
  async function onClick() {
    setBusy(true);
    try {
      const res = await fetch(api.fileUrl(fileId), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileId;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="mt-5 rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-5 py-2 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] disabled:opacity-50"
    >
      {busy ? "Downloading…" : "Download Output"}
    </button>
  );
}

export default function RenderJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const auth = useAuth();
  const [job, setJob] = useState<RenderJobOut | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (auth.loading || !auth.token) return;
    let cancelled = false;
    const ctrl = new AbortController();

    async function tick(token: string) {
      try {
        const j = await api.getRender(token, id, ctrl.signal);
        if (cancelled) return;
        setJob(j);
        if (j.status === "queued" || j.status === "running") {
          setTimeout(() => tick(token), POLL_MS);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load job");
      }
    }
    tick(auth.token);

    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [auth.loading, auth.token, id]);

  return (
    <>
      <HomeNav />
      <main className="mx-auto max-w-2xl p-8">
        <h1 className="mb-4 font-display text-2xl">Render Job</h1>
        <div className="text-xs uppercase tracking-wider text-muted">Job ID</div>
        <div className="font-mono text-xs text-text">{id}</div>

        {!auth.loading && !auth.token && (
          <p className="mt-6 rounded-md border border-gold/40 bg-surface p-4 text-sm text-text">
            Please{" "}
            <Link href={`/signin?next=/render/${id}`} className="text-gold hover:underline">
              sign in
            </Link>{" "}
            to view this job.
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-md border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300"
          >
            {error}
          </p>
        )}

        {job && (
          <section className="mt-6 rounded-xl border border-border bg-surface p-5">
            <div className="text-xs uppercase tracking-wider text-muted">Prompt</div>
            <p className="mt-1 text-sm text-text">{job.prompt}</p>

            <div className="mt-4 flex items-center gap-3">
              <span
                data-testid="job-status"
                className={
                  "rounded-full px-3 py-0.5 text-xs " +
                  (job.status === "done"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : job.status === "failed"
                      ? "bg-red-500/20 text-red-300"
                      : "bg-gold/20 text-gold")
                }
              >
                {job.status}
              </span>
              {(job.status === "queued" || job.status === "running") && (
                <span className="text-xs text-muted">Polling every {POLL_MS / 1000}s…</span>
              )}
            </div>

            {job.failure_reason && (
              <p className="mt-3 text-xs text-red-300">{job.failure_reason}</p>
            )}

            {job.status === "done" && job.output_file_id && auth.token && (
              <DownloadButton fileId={job.output_file_id} token={auth.token} />
            )}

            <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="uppercase tracking-wider text-muted">Created</div>
                <div className="text-text">{new Date(job.created_at).toLocaleString()}</div>
              </div>
              <div>
                <div className="uppercase tracking-wider text-muted">Updated</div>
                <div className="text-text">{new Date(job.updated_at).toLocaleString()}</div>
              </div>
            </div>
          </section>
        )}

        <div className="mt-6 flex gap-3">
          <Link
            href="/home"
            className="rounded-md border border-border px-4 py-2 text-sm text-muted hover:border-gold hover:text-gold"
          >
            Back to Home
          </Link>
          <Link
            href="/studio"
            className="rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-4 py-2 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
          >
            New Prompt
          </Link>
        </div>
      </main>
    </>
  );
}
