"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { HomeNav } from "@/components/home/HomeNav";
import { useAuth } from "@/lib/auth";
import { api, type PresetOut } from "@/lib/api";
import {
  composePromptWithDefaults,
  DEFAULT_RENDER_DEFAULTS,
  fetchRenderDefaults,
  PRESET_KIND,
  type EnhancementId,
  type RenderDefaults,
} from "@/lib/render-defaults";

const LIGHTING_OPTIONS: { id: RenderDefaults["lighting"]; label: string }[] = [
  { id: "natural", label: "Natural" },
  { id: "cinematic", label: "Cinematic" },
  { id: "golden_hour", label: "Golden Hour" },
  { id: "moody", label: "Moody" },
];

const ENHANCE_LABELS: Record<EnhancementId, string> = {
  denoise: "AI Denoise",
  stabilize: "Auto Stabilize",
  frame: "Frame Interpolation",
  color: "Auto Color",
};

export default function AdvancedSettingsPage() {
  const auth = useAuth();
  const [preset, setPreset] = useState<PresetOut | null>(null);
  const [values, setValues] = useState<RenderDefaults>(DEFAULT_RENDER_DEFAULTS);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const load = useCallback(async (token: string) => {
    try {
      const { preset, values } = await fetchRenderDefaults(token);
      setPreset(preset);
      setValues(values);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, []);

  useEffect(() => {
    if (auth.loading || !auth.token) return;
    void load(auth.token);
  }, [auth.loading, auth.token, load]);

  async function onSave() {
    if (!auth.token) return;
    setBusy(true);
    setError(null);
    try {
      // Singleton semantics: delete any older render-defaults rows so we don't
      // accumulate duplicates.
      const existing = await api.listPresets(auth.token, PRESET_KIND);
      for (const old of existing) {
        await api.deletePreset(auth.token, old.id);
      }
      const fresh = await api.createPreset(
        auth.token,
        PRESET_KIND,
        "Render defaults",
        values as unknown as Record<string, unknown>,
      );
      setPreset(fresh);
      setSavedAt(Date.now());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  function onReset() {
    setValues(DEFAULT_RENDER_DEFAULTS);
  }

  if (!auth.loading && !auth.token) {
    return (
      <>
        <HomeNav />
        <main className="p-8 text-center">
          <Link
            href="/signin?next=/manage/styles/settings"
            className="text-gold hover:underline"
          >
            Sign in
          </Link>{" "}
          to manage render defaults.
        </main>
      </>
    );
  }

  const preview = composePromptWithDefaults("a sunset over the ocean", values);

  return (
    <>
      <HomeNav />
      <div className="mx-auto mt-4 max-w-3xl px-6">
        <div
          role="status"
          className="rounded-md border border-gold/40 bg-gold/10 px-4 py-2 text-xs text-gold"
        >
          <strong className="font-semibold">Render defaults</strong> — these are
          auto-appended to every prompt you submit. Per-render override and per-style
          packs live in your <Link href="/manage/styles" className="underline">Style Library</Link>.
        </div>
      </div>

      <main className="mx-auto max-w-3xl p-6">
        <div className="mb-6 flex items-end justify-between gap-3">
          <h1 className="font-display text-2xl">Render Defaults</h1>
          <Link href="/manage/styles" className="text-xs text-muted hover:text-gold">
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

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface p-5">
            <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">Lighting</h2>
            <div className="flex flex-wrap gap-2">
              {LIGHTING_OPTIONS.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setValues((v) => ({ ...v, lighting: o.id }))}
                  data-testid={`lighting-${o.id}`}
                  className={
                    "rounded-full border px-3 py-1 text-xs " +
                    (values.lighting === o.id
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-border text-muted hover:border-gold hover:text-gold")
                  }
                >
                  {o.label}
                </button>
              ))}
            </div>

            <h3 className="mb-2 mt-5 text-xs uppercase tracking-wider text-muted">Mood</h3>
            <input
              type="text"
              value={values.mood}
              onChange={(e) => setValues((v) => ({ ...v, mood: e.target.value }))}
              placeholder="e.g. melancholic, hopeful, tense"
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-muted focus:border-gold focus:outline-none"
            />
          </div>

          <div className="rounded-xl border border-border bg-surface p-5">
            <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">
              Enhancement Toggles
            </h2>
            <ul className="space-y-2 text-sm">
              {(Object.keys(ENHANCE_LABELS) as EnhancementId[]).map((id) => {
                const on = values.enhancements[id];
                return (
                  <li key={id} className="flex items-center justify-between">
                    <span className="text-text">{ENHANCE_LABELS[id]}</span>
                    <button
                      type="button"
                      data-testid={`toggle-${id}`}
                      onClick={() =>
                        setValues((v) => ({
                          ...v,
                          enhancements: { ...v.enhancements, [id]: !on },
                        }))
                      }
                      className={
                        "rounded-full px-3 py-0.5 text-xs " +
                        (on ? "bg-gold/20 text-gold" : "bg-surface-2 text-muted")
                      }
                    >
                      {on ? "ON" : "OFF"}
                    </button>
                  </li>
                );
              })}
            </ul>

            <h3 className="mb-2 mt-5 text-xs uppercase tracking-wider text-muted">
              Negative Prompt
            </h3>
            <textarea
              rows={3}
              value={values.negative_prompt}
              onChange={(e) =>
                setValues((v) => ({ ...v, negative_prompt: e.target.value }))
              }
              placeholder="blurry, distorted, low quality, watermark…"
              className="w-full resize-none rounded-md border border-border bg-surface-2 px-3 py-2 text-xs text-text placeholder:text-muted focus:border-gold focus:outline-none"
            />
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-2 text-xs uppercase tracking-wider text-muted">
            Preview applied to sample
          </h2>
          <p className="rounded-md border border-border bg-surface-2 p-3 text-sm text-text">
            &ldquo;{preview}&rdquo;
          </p>
        </section>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onReset}
            className="rounded-md border border-border px-4 py-2 text-sm text-muted hover:border-gold hover:text-gold"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={busy}
            data-testid="save-button"
            className="rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-5 py-2 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] disabled:opacity-50"
          >
            {busy ? "Saving…" : preset ? "Save Changes" : "Save"}
          </button>
          {savedAt && <span className="self-center text-xs text-emerald-400">Saved.</span>}
        </div>
      </main>
    </>
  );
}
