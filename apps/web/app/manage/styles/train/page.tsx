"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { HomeNav } from "@/components/home/HomeNav";
import { useAuth } from "@/lib/auth";
import { api, type FileOut, type TrainingJobOut } from "@/lib/api";

const BASE_MODELS = [
  "Wan-AI/Wan2.1-T2V-1.3B",
  "cerspense/zeroscope_v2_576w",
  "ByteDance/AnimateDiff-Lightning",
];

const STATUS_STYLES: Record<string, string> = {
  queued: "bg-surface-2 text-muted",
  running: "bg-gold/20 text-gold",
  done: "bg-emerald-500/20 text-emerald-400",
  failed: "bg-red-500/20 text-red-300",
};

export default function StyleTrainingPage() {
  const auth = useAuth();
  const [files, setFiles] = useState<FileOut[] | null>(null);
  const [jobs, setJobs] = useState<TrainingJobOut[] | null>(null);
  const [pickedFiles, setPickedFiles] = useState<Set<string>>(new Set());

  const [name, setName] = useState("");
  const [baseModel, setBaseModel] = useState<string>(BASE_MODELS[0] ?? "");
  const [strength, setStrength] = useState(75);
  const [steps, setSteps] = useState(1000);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (token: string) => {
    try {
      const [fs, js] = await Promise.all([
        api.listMyFiles(token),
        api.listTrainingJobs(token),
      ]);
      setFiles(fs);
      setJobs(js);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, []);

  useEffect(() => {
    if (auth.loading || !auth.token) return;
    void refresh(auth.token);
  }, [auth.loading, auth.token, refresh]);

  function togglePick(id: string) {
    setPickedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!auth.token || !name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await api.createTrainingJob(auth.token, {
        name: name.trim(),
        base_model: baseModel,
        file_ids: Array.from(pickedFiles),
        params: { strength, steps },
      });
      setName("");
      setPickedFiles(new Set());
      await refresh(auth.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: string) {
    if (!auth.token) return;
    if (!confirm("Delete this training job?")) return;
    await api.deleteTrainingJob(auth.token, id);
    await refresh(auth.token);
  }

  const queuedCount = useMemo(
    () => (jobs ?? []).filter((j) => j.status === "queued").length,
    [jobs],
  );

  if (!auth.loading && !auth.token) {
    return (
      <>
        <HomeNav />
        <main className="p-8 text-center">
          <Link href="/signin?next=/manage/styles/train" className="text-gold hover:underline">
            Sign in
          </Link>{" "}
          to manage style training.
        </main>
      </>
    );
  }

  return (
    <>
      <HomeNav />
      <div className="mx-auto mt-4 max-w-5xl px-6">
        <div
          role="status"
          className="rounded-md border border-gold/40 bg-gold/10 px-4 py-2 text-xs text-gold"
        >
          <strong className="font-semibold">Skeleton mode:</strong> jobs persist and queue,
          but actual LoRA training requires the self-hosted GPU worker described in{" "}
          <Link href="https://github.com/zxgtor/Flova/blob/main/docs/adr/0006-self-hosted-video-model.md" className="underline">
            ADR-0006
          </Link>
          . Until that&apos;s wired in, submitted jobs stay at status &ldquo;queued&rdquo;.
        </div>
      </div>

      <main className="mx-auto max-w-5xl p-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-display text-2xl">Train a Style</h1>
          <Link
            href="/manage/styles"
            className="text-xs text-muted hover:text-gold"
          >
            ← Style Library
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

        <form onSubmit={onSubmit} className="mb-8 rounded-2xl border border-border bg-surface p-5">
          <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">New Training Job</h2>

          <label className="mb-2 block text-xs uppercase tracking-wider text-muted">Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Cinematic Noir v1"
            className="mb-4 w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-muted focus:border-gold focus:outline-none"
          />

          <label className="mb-2 block text-xs uppercase tracking-wider text-muted">
            Base model
          </label>
          <select
            value={baseModel}
            onChange={(e) => setBaseModel(e.target.value)}
            className="mb-4 w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text focus:border-gold focus:outline-none"
          >
            {BASE_MODELS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-text">Style Strength</span>
                <span className="text-muted">{strength}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={strength}
                onChange={(e) => setStrength(Number(e.target.value))}
                aria-label="strength"
                className="w-full accent-[var(--gold)]"
              />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-text">Training Steps</span>
                <span className="text-muted">{steps}</span>
              </div>
              <input
                type="range"
                min={100}
                max={5000}
                step={100}
                value={steps}
                onChange={(e) => setSteps(Number(e.target.value))}
                aria-label="steps"
                className="w-full accent-[var(--gold)]"
              />
            </div>
          </div>

          <label className="mb-2 block text-xs uppercase tracking-wider text-muted">
            Training Data ({pickedFiles.size} selected)
          </label>
          {files === null ? (
            <p className="text-xs text-muted">Loading files…</p>
          ) : files.length === 0 ? (
            <p className="text-xs text-muted">
              No files yet.{" "}
              <Link href="/manage/assets" className="text-gold hover:underline">
                Upload one
              </Link>{" "}
              to use as training data.
            </p>
          ) : (
            <ul
              className="mb-4 grid max-h-48 gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3"
              data-testid="file-pickers"
            >
              {files.map((f) => {
                const on = pickedFiles.has(f.id);
                const label = f.storage_key.split("/").pop() ?? f.id;
                return (
                  <li key={f.id}>
                    <button
                      type="button"
                      onClick={() => togglePick(f.id)}
                      data-testid="file-pick"
                      className={
                        "w-full truncate rounded-md border px-3 py-1.5 text-left text-xs " +
                        (on
                          ? "border-gold bg-gold/10 text-gold"
                          : "border-border bg-surface-2 text-text hover:border-gold")
                      }
                      title={label}
                    >
                      {label}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <button
            type="submit"
            disabled={busy || !name.trim()}
            className="rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-5 py-2 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] disabled:opacity-50"
          >
            {busy ? "Submitting…" : "Submit Training Job"}
          </button>
        </form>

        <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">
          Your Training Jobs {queuedCount > 0 ? `(${queuedCount} queued)` : ""}
        </h2>
        {jobs === null ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : jobs.length === 0 ? (
          <p className="text-sm text-muted">No jobs yet. Submit one above.</p>
        ) : (
          <ul className="space-y-2" data-testid="job-list">
            {jobs.map((j) => (
              <li
                key={j.id}
                data-testid="job-row"
                className="rounded-xl border border-border bg-surface p-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-text">{j.name}</div>
                    <div className="text-xs text-muted">
                      {j.base_model} · {j.file_ids.length} file
                      {j.file_ids.length === 1 ? "" : "s"} ·{" "}
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
                  <button
                    type="button"
                    onClick={() => onDelete(j.id)}
                    className="shrink-0 rounded-md border border-border px-3 py-1 text-xs text-muted hover:border-red-500/50 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
                {j.failure_reason && (
                  <p className="mt-2 text-xs text-red-300">{j.failure_reason}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
