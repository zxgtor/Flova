"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { HomeNav } from "@/components/home/HomeNav";
import { useAuth } from "@/lib/auth";
import { api, type PresetOut } from "@/lib/api";

type PromptPayload = {
  text: string;
  style?: string;
  tags?: string[];
};

function payloadOf(p: PresetOut): PromptPayload {
  return p.payload as unknown as PromptPayload;
}

export default function PromptLibraryPage() {
  const auth = useAuth();
  const [items, setItems] = useState<PresetOut[] | null>(null);
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [style, setStyle] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const refresh = useCallback(async (token: string) => {
    try {
      setItems(await api.listPresets(token, "prompt"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, []);

  useEffect(() => {
    if (auth.loading || !auth.token) return;
    void refresh(auth.token);
  }, [auth.loading, auth.token, refresh]);

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!auth.token || !text.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const payload: PromptPayload = {
        text: text.trim(),
        style: style.trim() || undefined,
        tags: tagsInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };
      const label = name.trim() || text.trim().slice(0, 60);
      await api.createPreset(
        auth.token,
        "prompt",
        label,
        payload as unknown as Record<string, unknown>,
      );
      setName("");
      setText("");
      setStyle("");
      setTagsInput("");
      await refresh(auth.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function onCopy(p: PresetOut) {
    const t = payloadOf(p).text;
    if (!t) return;
    try {
      await navigator.clipboard.writeText(t);
      setCopiedId(p.id);
      setTimeout(() => setCopiedId((c) => (c === p.id ? null : c)), 1500);
    } catch {
      /* clipboard might be blocked — silent */
    }
  }

  async function onDelete(id: string) {
    if (!auth.token) return;
    if (!confirm("Delete this prompt?")) return;
    await api.deletePreset(auth.token, id);
    await refresh(auth.token);
  }

  const filtered = useMemo(() => {
    if (!items) return null;
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((p) => {
      const pl = payloadOf(p);
      return (
        p.name.toLowerCase().includes(q) ||
        pl.text?.toLowerCase().includes(q) ||
        pl.style?.toLowerCase().includes(q) ||
        (pl.tags ?? []).some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [items, query]);

  if (!auth.loading && !auth.token) {
    return (
      <>
        <HomeNav />
        <main className="p-8 text-center">
          <Link href="/signin?next=/manage/prompts" className="text-gold hover:underline">
            Sign in
          </Link>{" "}
          to manage prompts.
        </main>
      </>
    );
  }

  return (
    <>
      <HomeNav />
      <main className="mx-auto max-w-4xl p-6">
        <h1 className="mb-6 font-display text-2xl">Prompt Library</h1>

        <form
          onSubmit={onCreate}
          className="mb-8 rounded-2xl border border-border bg-surface p-5"
        >
          <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">Save a Prompt</h2>
          <input
            type="text"
            placeholder="Title (optional — first 60 chars of the prompt by default)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-3 w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-muted focus:border-gold focus:outline-none"
          />
          <textarea
            rows={3}
            required
            placeholder="Prompt text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="mb-3 w-full resize-none rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-muted focus:border-gold focus:outline-none"
          />
          <div className="mb-3 grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Style (optional, e.g. Cinematic Noir)"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-muted focus:border-gold focus:outline-none"
            />
            <input
              type="text"
              placeholder="Tags (comma separated)"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-muted focus:border-gold focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={busy || !text.trim()}
            className="rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-4 py-2 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save Prompt"}
          </button>
          {error && (
            <p role="alert" className="mt-3 text-xs text-red-300">
              {error}
            </p>
          )}
        </form>

        <input
          type="text"
          placeholder="Search saved prompts, styles, or tags…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mb-6 w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-muted focus:border-gold focus:outline-none"
        />

        {filtered === null ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted">
            {items && items.length > 0
              ? "Nothing matches that search."
              : "No saved prompts yet. Save one above to get started."}
          </p>
        ) : (
          <ul className="space-y-3" data-testid="prompt-list">
            {filtered.map((p) => {
              const pl = payloadOf(p);
              return (
                <li
                  key={p.id}
                  data-testid="prompt-card"
                  className="rounded-xl border border-border bg-surface p-4"
                >
                  <div className="mb-2 flex items-baseline justify-between gap-3">
                    <h3 className="truncate text-sm font-medium text-text">{p.name}</h3>
                    <span className="shrink-0 text-[10px] text-muted">
                      Saved {new Date(p.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-text">{pl.text}</p>
                  {(pl.style || (pl.tags && pl.tags.length > 0)) && (
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-muted">
                      {pl.style && <span>Style: {pl.style}</span>}
                      {pl.tags?.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-border bg-surface-2 px-2 py-0.5"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onCopy(p)}
                      className="rounded-md border border-border px-3 py-1 text-xs text-muted hover:border-gold hover:text-gold"
                    >
                      {copiedId === p.id ? "Copied!" : "Copy"}
                    </button>
                    <Link
                      href={`/studio?prompt=${encodeURIComponent(pl.text ?? "")}`}
                      className="rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-3 py-1 text-xs font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
                    >
                      Use in Workspace
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete(p.id)}
                      className="ml-auto rounded-md border border-border px-3 py-1 text-xs text-muted hover:border-red-500/50 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
