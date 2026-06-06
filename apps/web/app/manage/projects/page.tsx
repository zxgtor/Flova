"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { HomeNav } from "@/components/home/HomeNav";
import { useAuth } from "@/lib/auth";
import { api, type ProjectOut } from "@/lib/api";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-surface-2 text-muted",
  in_progress: "bg-gold/20 text-gold",
  completed: "bg-emerald-500/20 text-emerald-400",
  archived: "bg-surface-2 text-muted",
};

export default function ProjectsPage() {
  const auth = useAuth();
  const [projects, setProjects] = useState<ProjectOut[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (token: string) => {
    try {
      setProjects(await api.listProjects(token));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, []);

  useEffect(() => {
    if (auth.loading || !auth.token) return;
    refresh(auth.token);
  }, [auth.loading, auth.token, refresh]);

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!auth.token || !title.trim()) return;
    setCreating(true);
    setError(null);
    try {
      await api.createProject(auth.token, title.trim(), description.trim());
      setTitle("");
      setDescription("");
      await refresh(auth.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setCreating(false);
    }
  }

  async function onDelete(id: string) {
    if (!auth.token) return;
    if (!confirm("Delete this project?")) return;
    await api.deleteProject(auth.token, id);
    await refresh(auth.token);
  }

  if (!auth.loading && !auth.token) {
    return (
      <>
        <HomeNav />
        <main className="p-8 text-center">
          <Link href="/signin?next=/manage/projects" className="text-gold hover:underline">
            Sign in
          </Link>{" "}
          to manage projects.
        </main>
      </>
    );
  }

  return (
    <>
      <HomeNav />
      <main className="mx-auto max-w-4xl p-6">
        <h1 className="mb-6 font-display text-2xl">Projects</h1>

        <form
          onSubmit={onCreate}
          className="mb-8 rounded-2xl border border-border bg-surface p-5"
        >
          <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">New Project</h2>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Project title"
            className="mb-3 w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-muted focus:border-gold focus:outline-none"
          />
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description (optional)"
            className="mb-3 w-full resize-none rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-muted focus:border-gold focus:outline-none"
          />
          <button
            type="submit"
            disabled={creating || !title.trim()}
            className="rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-4 py-2 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] disabled:opacity-50"
          >
            {creating ? "Creating…" : "Create Project"}
          </button>
          {error && (
            <p role="alert" className="mt-3 text-xs text-red-300">
              {error}
            </p>
          )}
        </form>

        {projects === null ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : projects.length === 0 ? (
          <p className="text-sm text-muted">No projects yet. Create your first above.</p>
        ) : (
          <ul className="space-y-3" data-testid="project-list">
            {projects.map((p) => (
              <li
                key={p.id}
                data-testid="project-row"
                className="flex items-center justify-between rounded-xl border border-border bg-surface p-4"
              >
                <Link href={`/manage/projects/${p.id}`} className="flex-1">
                  <div className="text-sm text-text">{p.title}</div>
                  {p.description && (
                    <div className="mt-1 line-clamp-1 text-xs text-muted">{p.description}</div>
                  )}
                </Link>
                <span
                  className={
                    "ml-3 rounded-full px-2 py-0.5 text-xs " + (STATUS_STYLES[p.status] ?? "")
                  }
                >
                  {p.status}
                </span>
                <button
                  type="button"
                  onClick={() => onDelete(p.id)}
                  className="ml-3 rounded-md border border-border px-3 py-1 text-xs text-muted hover:border-red-500/50 hover:text-red-300"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
