"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";
import { HomeNav } from "@/components/home/HomeNav";
import { useAuth } from "@/lib/auth";
import { api, type ProjectOut, type ProjectStatus } from "@/lib/api";

const STATUSES: ProjectStatus[] = ["draft", "in_progress", "completed", "archived"];

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const auth = useAuth();

  const [project, setProject] = useState<ProjectOut | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("draft");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const load = useCallback(async (token: string) => {
    try {
      const p = await api.getProject(token, id);
      setProject(p);
      setTitle(p.title);
      setDescription(p.description);
      setStatus(p.status);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, [id]);

  useEffect(() => {
    if (auth.loading || !auth.token) return;
    load(auth.token);
  }, [auth.loading, auth.token, load]);

  async function onSave() {
    if (!auth.token) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await api.updateProject(auth.token, id, {
        title,
        description,
        status,
      });
      setProject(updated);
      setSavedAt(Date.now());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  if (!auth.loading && !auth.token) {
    return (
      <>
        <HomeNav />
        <main className="p-8 text-center">
          <Link href={`/signin?next=/manage/projects/${id}`} className="text-gold hover:underline">
            Sign in
          </Link>{" "}
          to view this project.
        </main>
      </>
    );
  }

  return (
    <>
      <HomeNav />
      <main className="mx-auto max-w-3xl p-6">
        <Link
          href="/manage/projects"
          className="mb-4 inline-block text-xs text-muted hover:text-gold"
        >
          ← All projects
        </Link>

        {error && (
          <p role="alert" className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
            {error}
          </p>
        )}

        {project === null && !error ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : (
          project && (
            <section className="rounded-2xl border border-border bg-surface p-6">
              <label className="mb-3 block text-xs uppercase tracking-wider text-muted">
                Title
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm normal-case text-text focus:border-gold focus:outline-none"
                />
              </label>
              <label className="mb-3 block text-xs uppercase tracking-wider text-muted">
                Description
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full resize-none rounded-md border border-border bg-surface-2 px-3 py-2 text-sm normal-case text-text focus:border-gold focus:outline-none"
                />
              </label>
              <label className="mb-4 block text-xs uppercase tracking-wider text-muted">
                Status
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                  className="mt-1 w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm normal-case text-text focus:border-gold focus:outline-none"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onSave}
                  disabled={busy}
                  className="rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-5 py-2 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] disabled:opacity-50"
                >
                  {busy ? "Saving…" : "Save"}
                </button>
                {savedAt && (
                  <span className="text-xs text-muted">Saved.</span>
                )}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-muted">
                <div>
                  <div className="uppercase tracking-wider">Created</div>
                  <div>{new Date(project.created_at).toLocaleString()}</div>
                </div>
                <div>
                  <div className="uppercase tracking-wider">Updated</div>
                  <div>{new Date(project.updated_at).toLocaleString()}</div>
                </div>
              </div>
            </section>
          )
        )}
      </main>
    </>
  );
}
