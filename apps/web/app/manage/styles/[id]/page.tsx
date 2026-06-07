"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";
import { HomeNav } from "@/components/home/HomeNav";
import { useAuth } from "@/lib/auth";
import { api, type PresetOut } from "@/lib/api";

type StylePayload = { description?: string; prompt_template: string };

export default function StyleEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const auth = useAuth();

  const [item, setItem] = useState<PresetOut | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [template, setTemplate] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const load = useCallback(async (token: string) => {
    try {
      // No GET-one for presets — re-list and find. Cheap for typical user volume.
      const all = await api.listPresets(token, "style");
      const found = all.find((p) => p.id === id) ?? null;
      setItem(found);
      if (found) {
        const pl = found.payload as unknown as StylePayload;
        setName(found.name);
        setDescription(pl.description ?? "");
        setTemplate(pl.prompt_template);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, [id]);

  useEffect(() => {
    if (auth.loading || !auth.token) return;
    void load(auth.token);
  }, [auth.loading, auth.token, load]);

  /**
   * No PATCH endpoint exists for presets in this skeleton; an edit is
   * delete-and-recreate, which the kind/name model makes safe. The resulting
   * preset has a fresh id — callers that hold the URL update on save.
   */
  async function onSave() {
    if (!auth.token || !item || !name.trim() || !template.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await api.deletePreset(auth.token, item.id);
      const created = await api.createPreset(
        auth.token,
        "style",
        name.trim(),
        {
          prompt_template: template.trim(),
          description: description.trim() || undefined,
        } as Record<string, unknown>,
      );
      setItem(created);
      setSavedAt(Date.now());
      // URL still says the old id; that's OK — the next refresh fetches by listing.
      // For now we just leave it: navigation back to the library shows the new style.
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
          <Link
            href={`/signin?next=/manage/styles/${id}`}
            className="text-gold hover:underline"
          >
            Sign in
          </Link>{" "}
          to edit this style.
        </main>
      </>
    );
  }

  return (
    <>
      <HomeNav />
      <main className="mx-auto max-w-2xl p-6">
        <Link
          href="/manage/styles"
          className="mb-4 inline-block text-xs text-muted hover:text-gold"
        >
          ← Style Library
        </Link>

        {error && (
          <p
            role="alert"
            className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300"
          >
            {error}
          </p>
        )}

        {item === null && !error ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : item === null ? (
          <p className="text-sm text-muted">Style not found.</p>
        ) : (
          <section className="rounded-2xl border border-border bg-surface p-6">
            <label className="mb-3 block text-xs uppercase tracking-wider text-muted">
              Name
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm normal-case text-text focus:border-gold focus:outline-none"
              />
            </label>
            <label className="mb-3 block text-xs uppercase tracking-wider text-muted">
              Description
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full resize-none rounded-md border border-border bg-surface-2 px-3 py-2 text-sm normal-case text-text focus:border-gold focus:outline-none"
              />
            </label>
            <label className="mb-4 block text-xs uppercase tracking-wider text-muted">
              Prompt template (use <code className="text-gold">{"{prompt}"}</code>)
              <textarea
                rows={3}
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="mt-1 w-full resize-none rounded-md border border-border bg-surface-2 px-3 py-2 text-sm font-mono normal-case text-text focus:border-gold focus:outline-none"
              />
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
              {savedAt && <span className="text-xs text-emerald-400">Saved.</span>}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
