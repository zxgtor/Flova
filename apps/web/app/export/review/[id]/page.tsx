"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HomeNav } from "@/components/home/HomeNav";
import { useAuth } from "@/lib/auth";
import { api, type RenderJobOut } from "@/lib/api";

function gradientFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  const hue = Math.abs(h) % 360;
  return `linear-gradient(135deg, hsl(${hue} 60% 32%), hsl(${(hue + 60) % 360} 60% 18%))`;
}

const STATUS_STYLES: Record<RenderJobOut["status"], string> = {
  queued: "bg-surface-2 text-muted",
  running: "bg-gold/20 text-gold",
  done: "bg-emerald-500/20 text-emerald-400",
  failed: "bg-red-500/20 text-red-300",
};

export default function ReviewExportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const auth = useAuth();
  const router = useRouter();

  const [job, setJob] = useState<RenderJobOut | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (token: string) => {
    try {
      setJob(await api.getRender(token, id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, [id]);

  useEffect(() => {
    if (auth.loading || !auth.token) return;
    void load(auth.token);
  }, [auth.loading, auth.token, load]);

  async function onPublish() {
    if (!auth.token || !job) return;
    setBusy(true);
    setError(null);
    try {
      if (!job.is_public) {
        await api.setRenderPublic(auth.token, job.id, true);
      }
      router.push(`/export/success/${job.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Publish failed");
      setBusy(false);
    }
  }

  if (!auth.loading && !auth.token) {
    return (
      <>
        <HomeNav />
        <main className="p-8 text-center">
          <Link
            href={`/signin?next=/export/review/${id}`}
            className="text-gold hover:underline"
          >
            Sign in
          </Link>{" "}
          to review this render.
        </main>
      </>
    );
  }

  return (
    <>
      <HomeNav />
      <main className="mx-auto max-w-4xl p-6">
        <Link href={`/render/${id}`} className="mb-4 inline-block text-xs text-muted hover:text-gold">
          ← Back to render
        </Link>
        <h1 className="mb-6 font-display text-2xl">Final Review &amp; Export</h1>

        {error && (
          <p role="alert" className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
            {error}
          </p>
        )}

        {job === null && !error ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : (
          job && (
            <article className="rounded-2xl border border-border bg-surface p-6">
              <div
                className="relative aspect-video overflow-hidden rounded-xl border border-border"
                style={{ background: gradientFor(job.id) }}
              >
                <div className="absolute inset-0 flex items-end p-4">
                  <p className="line-clamp-3 text-sm text-text drop-shadow">{job.prompt}</p>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <dt className="uppercase tracking-wider text-muted">Status</dt>
                  <dd>
                    <span className={"mt-1 inline-block rounded-full px-2 py-0.5 " + STATUS_STYLES[job.status]}>
                      {job.status}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wider text-muted">Visibility</dt>
                  <dd className="text-text">
                    {job.is_public ? "Public" : "Private (you only)"}
                  </dd>
                </div>
              </dl>

              {job.failure_reason && (
                <p className="mt-3 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
                  {job.failure_reason}
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {job.status === "done" ? (
                  <>
                    <button
                      type="button"
                      onClick={onPublish}
                      disabled={busy}
                      data-testid="publish-button"
                      className="rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-5 py-2 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] disabled:opacity-50"
                    >
                      {busy
                        ? "Publishing…"
                        : job.is_public
                          ? "Open Share Screen"
                          : "Final Export & Publish"}
                    </button>
                    {job.is_public && (
                      <Link
                        href={`/community/remix/${job.id}`}
                        className="rounded-md border border-gold px-4 py-2 text-sm text-gold hover:bg-gold/10"
                      >
                        View Public Page
                      </Link>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted">
                    Render is {job.status}. Wait until it finishes before exporting.
                  </p>
                )}
                <Link
                  href={`/render/${job.id}`}
                  className="ml-auto rounded-md border border-border px-4 py-2 text-sm text-muted hover:border-gold hover:text-gold"
                >
                  Edit in Timeline
                </Link>
              </div>
            </article>
          )
        )}
      </main>
    </>
  );
}
