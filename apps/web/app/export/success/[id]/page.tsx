"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";
import { HomeNav } from "@/components/home/HomeNav";
import { useAuth } from "@/lib/auth";
import { api, type RenderJobOut } from "@/lib/api";

type Social = { label: string; color: string; intent: (url: string, text: string) => string };

const SOCIALS: Social[] = [
  {
    label: "Twitter",
    color: "bg-blue-500/20 text-blue-300",
    intent: (url, text) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  },
  {
    label: "Facebook",
    color: "bg-indigo-500/20 text-indigo-300",
    intent: (url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    label: "LinkedIn",
    color: "bg-sky-500/20 text-sky-300",
    intent: (url) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    label: "Reddit",
    color: "bg-orange-500/20 text-orange-300",
    intent: (url, text) =>
      `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
  },
];

function gradientFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  const hue = Math.abs(h) % 360;
  return `linear-gradient(135deg, hsl(${hue} 60% 32%), hsl(${(hue + 60) % 360} 60% 18%))`;
}

export default function PublishSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const auth = useAuth();
  const [job, setJob] = useState<RenderJobOut | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

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

  const publicUrl =
    typeof window !== "undefined" && job?.is_public
      ? `${window.location.origin}/community/remix/${job.id}`
      : null;

  async function onCopy() {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard may be blocked */
    }
  }

  async function onDownload() {
    if (!auth.token || !job?.output_file_id) return;
    setDownloading(true);
    try {
      const res = await fetch(api.fileUrl(job.output_file_id), {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `flova-${job.id}`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  if (!auth.loading && !auth.token) {
    return (
      <>
        <HomeNav />
        <main className="p-8 text-center">
          <Link
            href={`/signin?next=/export/success/${id}`}
            className="text-gold hover:underline"
          >
            Sign in
          </Link>{" "}
          to view the share screen.
        </main>
      </>
    );
  }

  return (
    <>
      <HomeNav />
      <main className="mx-auto max-w-5xl p-6">
        {error && (
          <p
            role="alert"
            className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300"
          >
            {error}
          </p>
        )}

        {job === null && !error ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : (
          job && (
            <>
              <section
                className="relative overflow-hidden rounded-2xl border border-gold/50"
                style={{ background: gradientFor(job.id) }}
              >
                <div className="relative flex h-64 flex-col items-center justify-center bg-bg/40 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold text-3xl text-gold">
                    ✓
                  </div>
                  <h1 className="mt-4 font-display text-3xl font-semibold">Production Complete</h1>
                  <p className="mt-1 max-w-md px-4 text-sm text-muted line-clamp-2">
                    {job.prompt}
                  </p>
                </div>
              </section>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <section className="rounded-xl border border-border bg-surface p-5">
                  <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">
                    Download Original
                  </h2>
                  <button
                    type="button"
                    onClick={onDownload}
                    disabled={downloading || !job.output_file_id}
                    data-testid="download-button"
                    className="w-full rounded-md border border-gold px-3 py-2 text-sm text-gold hover:bg-gold/10 disabled:opacity-50"
                  >
                    {downloading
                      ? "Downloading…"
                      : job.output_file_id
                        ? "Download File"
                        : "No output yet"}
                  </button>
                </section>

                <section className="rounded-xl border border-border bg-surface p-5">
                  <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">
                    Copy Public Link
                  </h2>
                  <div className="flex items-center gap-2 rounded-md border border-border bg-surface-2 px-3 py-2 text-xs">
                    <span className="flex-1 truncate text-muted">
                      {publicUrl ?? "Not published yet"}
                    </span>
                    <button
                      type="button"
                      onClick={onCopy}
                      disabled={!publicUrl}
                      data-testid="copy-button"
                      className="rounded-md border border-gold px-2 py-1 text-gold hover:bg-gold/10 disabled:opacity-50"
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  {!job.is_public && (
                    <p className="mt-2 text-[10px] text-muted">
                      <Link href={`/export/review/${job.id}`} className="text-gold hover:underline">
                        Publish first
                      </Link>{" "}
                      to make a public link.
                    </p>
                  )}
                </section>
              </div>

              <section className="mt-6 rounded-xl border border-border bg-surface p-5">
                <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">
                  Share to World
                </h2>
                <div className="grid gap-2 sm:grid-cols-4">
                  {SOCIALS.map((s) => (
                    <div
                      key={s.label}
                      data-testid="share-target"
                      className="flex items-center justify-between rounded-md border border-border bg-surface-2 px-3 py-2 text-sm"
                    >
                      <span className={"rounded-full px-2 py-0.5 text-xs " + s.color}>
                        {s.label}
                      </span>
                      {publicUrl ? (
                        <a
                          href={s.intent(publicUrl, job.prompt.slice(0, 100))}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Share to ${s.label}`}
                          className="text-xs text-gold hover:underline"
                        >
                          Share
                        </a>
                      ) : (
                        <span
                          aria-label={`Share to ${s.label}`}
                          className="text-xs text-muted opacity-50"
                          title="Publish first"
                        >
                          Share
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <div className="mt-8 flex justify-center">
                <Link
                  href="/home"
                  className="rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-6 py-2 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
                >
                  Start New Project
                </Link>
              </div>
            </>
          )
        )}
      </main>
    </>
  );
}
