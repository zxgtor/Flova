"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { HomeNav } from "@/components/home/HomeNav";
import { useAuth } from "@/lib/auth";
import { api, type PresetOut, type RenderJobOut } from "@/lib/api";

type StylePayload = { description?: string; prompt_template: string };
const POLL_MS = 1500;

function apply(template: string, prompt: string): string {
  return template.includes("{prompt}")
    ? template.replace(/\{prompt\}/g, prompt)
    : `${prompt}, ${template}`;
}

function payloadOf(p: PresetOut): StylePayload {
  return p.payload as unknown as StylePayload;
}

function gradientFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  const hue = Math.abs(h) % 360;
  return `linear-gradient(135deg, hsl(${hue} 60% 32%), hsl(${(hue + 60) % 360} 60% 18%))`;
}

const STATUS_STYLES: Record<string, string> = {
  queued: "bg-surface-2 text-muted",
  running: "bg-gold/20 text-gold",
  done: "bg-emerald-500/20 text-emerald-400",
  failed: "bg-red-500/20 text-red-300",
};

export default function StyleComparePage() {
  const auth = useAuth();
  const [styles, setStyles] = useState<PresetOut[] | null>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [prompt, setPrompt] = useState("a sunset over the ocean");
  const [runs, setRuns] = useState<{ style: PresetOut; job: RenderJobOut }[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStyles = useCallback(async (token: string) => {
    try {
      setStyles(await api.listPresets(token, "style"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, []);

  useEffect(() => {
    if (auth.loading || !auth.token) return;
    void loadStyles(auth.token);
  }, [auth.loading, auth.token, loadStyles]);

  // Poll each unresolved run until it lands. Cheap because we expect ≤4 jobs.
  useEffect(() => {
    if (!auth.token || runs.length === 0) return;
    const unfinished = runs.filter(
      (r) => r.job.status === "queued" || r.job.status === "running",
    );
    if (unfinished.length === 0) return;
    let cancelled = false;
    const handle = setTimeout(async () => {
      if (cancelled || !auth.token) return;
      const token = auth.token;
      const updated = await Promise.all(
        runs.map(async (r) => {
          if (r.job.status === "done" || r.job.status === "failed") return r;
          try {
            const fresh = await api.getRender(token, r.job.id);
            return { ...r, job: fresh };
          } catch {
            return r;
          }
        }),
      );
      if (!cancelled) setRuns(updated);
    }, POLL_MS);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [auth.token, runs]);

  function togglePick(id: string) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 4) next.add(id);
      return next;
    });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!auth.token || !prompt.trim() || picked.size === 0) return;
    setBusy(true);
    setError(null);
    setRuns([]);
    try {
      const token = auth.token;
      const chosen = (styles ?? []).filter((s) => picked.has(s.id));
      const newRuns = await Promise.all(
        chosen.map(async (s) => {
          const composed = apply(payloadOf(s).prompt_template, prompt.trim());
          const job = await api.submitRender(token, composed);
          return { style: s, job };
        }),
      );
      setRuns(newRuns);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setBusy(false);
    }
  }

  if (!auth.loading && !auth.token) {
    return (
      <>
        <HomeNav />
        <main className="p-8 text-center">
          <Link
            href="/signin?next=/manage/styles/compare"
            className="text-gold hover:underline"
          >
            Sign in
          </Link>{" "}
          to compare styles.
        </main>
      </>
    );
  }

  return (
    <>
      <HomeNav />
      <main className="mx-auto max-w-6xl p-6">
        <Link
          href="/manage/styles"
          className="mb-4 inline-block text-xs text-muted hover:text-gold"
        >
          ← Style Library
        </Link>
        <h1 className="mb-6 font-display text-2xl">Style Comparison</h1>

        <form
          onSubmit={onSubmit}
          className="mb-6 rounded-2xl border border-border bg-surface p-5"
        >
          <label className="mb-2 block text-xs uppercase tracking-wider text-muted">
            Base prompt
          </label>
          <textarea
            rows={2}
            required
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="a sunset over the ocean"
            className="mb-4 w-full resize-none rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-muted focus:border-gold focus:outline-none"
          />

          <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wider text-muted">
            <span>Pick 1–4 styles</span>
            <span>{picked.size} selected</span>
          </div>
          {styles === null ? (
            <p className="text-sm text-muted">Loading styles…</p>
          ) : styles.length === 0 ? (
            <p className="text-sm text-muted">
              No saved styles yet.{" "}
              <Link href="/manage/styles" className="text-gold hover:underline">
                Create one
              </Link>{" "}
              first.
            </p>
          ) : (
            <ul
              className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4"
              data-testid="style-pickers"
            >
              {styles.map((s) => {
                const on = picked.has(s.id);
                const disabled = !on && picked.size >= 4;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => togglePick(s.id)}
                      disabled={disabled}
                      data-testid="style-pick"
                      className={
                        "w-full rounded-xl border p-3 text-left text-sm transition-colors " +
                        (on
                          ? "border-gold bg-gold/10 text-gold"
                          : "border-border bg-surface-2 text-text hover:border-gold disabled:opacity-50")
                      }
                    >
                      <div className="truncate">{s.name}</div>
                      <div className="mt-1 line-clamp-1 text-[10px] text-muted">
                        {payloadOf(s).prompt_template}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <button
            type="submit"
            disabled={busy || picked.size === 0 || !prompt.trim()}
            className="rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-5 py-2 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] disabled:opacity-50"
          >
            {busy ? "Submitting…" : `Render ${picked.size || ""} side-by-side`}
          </button>
          {error && (
            <p role="alert" className="mt-3 text-xs text-red-300">
              {error}
            </p>
          )}
        </form>

        {runs.length > 0 && (
          <ul
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
            data-testid="run-list"
          >
            {runs.map((r) => (
              <li
                key={r.job.id}
                data-testid="run-card"
                className="overflow-hidden rounded-xl border border-border bg-surface"
              >
                <div
                  className="relative aspect-video"
                  style={{ background: gradientFor(r.style.id) }}
                >
                  <div className="absolute inset-0 flex items-end p-3">
                    <p className="line-clamp-3 text-xs text-text drop-shadow">
                      {r.job.prompt}
                    </p>
                  </div>
                </div>
                <div className="p-3 text-xs">
                  <div className="mb-1 text-text">{r.style.name}</div>
                  <div className="flex items-center justify-between">
                    <span
                      className={
                        "rounded-full px-2 py-0.5 " + (STATUS_STYLES[r.job.status] ?? "")
                      }
                    >
                      {r.job.status}
                    </span>
                    <Link href={`/render/${r.job.id}`} className="text-muted hover:text-gold">
                      Open →
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
