"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { HomeNav } from "@/components/home/HomeNav";
import { useAuth } from "@/lib/auth";
import { api, type PresetOut } from "@/lib/api";

type StylePayload = {
  description?: string;
  prompt_template: string; // must contain "{prompt}"
};

function applyStyle(template: string, prompt: string): string {
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
  const hue2 = (hue + 60) % 360;
  return `linear-gradient(135deg, hsl(${hue} 60% 32%), hsl(${hue2} 60% 18%))`;
}

export default function StyleLibraryPage() {
  const auth = useAuth();
  const [styles, setStyles] = useState<PresetOut[] | null>(null);
  const [name, setName] = useState("");
  const [template, setTemplate] = useState("{prompt}, studio ghibli style, vibrant colors");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (token: string) => {
    try {
      setStyles(await api.listPresets(token, "style"));
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
    if (!auth.token || !name.trim() || !template.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const payload: StylePayload = {
        prompt_template: template.trim(),
        description: description.trim() || undefined,
      };
      await api.createPreset(
        auth.token,
        "style",
        name.trim(),
        payload as unknown as Record<string, unknown>,
      );
      setName("");
      setDescription("");
      setTemplate("{prompt}, studio ghibli style, vibrant colors");
      await refresh(auth.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: string) {
    if (!auth.token) return;
    if (!confirm("Delete this style?")) return;
    await api.deletePreset(auth.token, id);
    await refresh(auth.token);
  }

  if (!auth.loading && !auth.token) {
    return (
      <>
        <HomeNav />
        <main className="p-8 text-center">
          <Link href="/signin?next=/manage/styles" className="text-gold hover:underline">
            Sign in
          </Link>{" "}
          to manage styles.
        </main>
      </>
    );
  }

  return (
    <>
      <HomeNav />
      <main className="mx-auto max-w-5xl p-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-display text-2xl">Style Library</h1>
          <div className="flex gap-2">
            <Link
              href="/manage/styles/compare"
              className="rounded-md border border-border px-4 py-1.5 text-sm text-muted hover:border-gold hover:text-gold"
            >
              Compare
            </Link>
            <Link
              href="/manage/styles/train"
              className="rounded-md border border-gold px-4 py-1.5 text-sm text-gold hover:bg-gold/10"
            >
              Train New Style
            </Link>
          </div>
        </div>

        <form
          onSubmit={onCreate}
          className="mb-8 rounded-2xl border border-border bg-surface p-5"
        >
          <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">New Style</h2>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name (e.g. Ghibli Watercolor)"
            className="mb-3 w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-muted focus:border-gold focus:outline-none"
          />
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="mb-3 w-full resize-none rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-muted focus:border-gold focus:outline-none"
          />
          <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted">
            Prompt template — use <code className="text-gold">{"{prompt}"}</code> as the placeholder
          </label>
          <textarea
            rows={2}
            required
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            placeholder="{prompt}, studio ghibli style, vibrant colors"
            className="mb-3 w-full resize-none rounded-md border border-border bg-surface-2 px-3 py-2 text-sm font-mono text-text placeholder:text-muted focus:border-gold focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy || !name.trim() || !template.trim()}
            className="rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-4 py-2 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save Style"}
          </button>
          {error && (
            <p role="alert" className="mt-3 text-xs text-red-300">
              {error}
            </p>
          )}
        </form>

        {styles === null ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : styles.length === 0 ? (
          <p className="text-sm text-muted">No styles saved yet. Create one above.</p>
        ) : (
          <ul
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            data-testid="style-list"
          >
            {styles.map((s) => {
              const pl = payloadOf(s);
              const preview = applyStyle(pl.prompt_template, "a sunset over the ocean");
              return (
                <li
                  key={s.id}
                  data-testid="style-card"
                  className="overflow-hidden rounded-xl border border-border bg-surface"
                >
                  <div
                    className="relative aspect-video"
                    style={{ background: gradientFor(s.id) }}
                  >
                    <div className="absolute inset-0 flex items-end p-3">
                      <p className="line-clamp-2 text-xs text-text drop-shadow">
                        {pl.prompt_template}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 text-sm">
                    <div className="mb-1 text-text">{s.name}</div>
                    {pl.description && (
                      <p className="mb-2 line-clamp-2 text-xs text-muted">{pl.description}</p>
                    )}
                    <p
                      className="mb-3 line-clamp-2 rounded-md border border-border bg-surface-2 p-2 text-[10px] text-muted"
                      title={preview}
                    >
                      Preview: &ldquo;{preview}&rdquo;
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/manage/styles/${s.id}`}
                        className="rounded-md border border-border px-3 py-1 text-xs text-muted hover:border-gold hover:text-gold"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/studio?prompt=${encodeURIComponent(applyStyle(pl.prompt_template, "a creative scene"))}`}
                        className="rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-3 py-1 text-xs font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
                      >
                        Apply
                      </Link>
                      <button
                        type="button"
                        onClick={() => onDelete(s.id)}
                        className="ml-auto rounded-md border border-border px-3 py-1 text-xs text-muted hover:border-red-500/50 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
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
