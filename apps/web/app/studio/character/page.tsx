"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StudioNav } from "@/components/studio/StudioNav";
import { CHARACTER, type AttributeGroup } from "@/lib/character-mock";
import { useAuth } from "@/lib/auth";
import { api, type PresetOut } from "@/lib/api";
import { RenderCTA, useRenderSubmit } from "@/lib/use-render-submit";

type CharacterPayload = {
  groups: AttributeGroup[];
  action: string;
};

export default function CharacterPage() {
  const auth = useAuth();
  const [groups, setGroups] = useState(CHARACTER.groups);
  const [action, setAction] = useState("walking confidently down a city street");
  const [saved, setSaved] = useState<PresetOut[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const state = useRenderSubmit("/studio/character");

  const refresh = useCallback(async (token: string) => {
    try {
      setSaved(await api.listPresets(token, "character"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load presets");
    }
  }, []);

  useEffect(() => {
    if (auth.loading || !auth.token) return;
    refresh(auth.token);
  }, [auth.loading, auth.token, refresh]);

  const prompt = useMemo(() => {
    const flat = groups
      .flatMap((g) => g.fields)
      .map((f) => `${f.label.toLowerCase()}: ${f.value}`)
      .join(", ");
    return `Character — ${flat}. Action: ${action}`;
  }, [groups, action]);

  function updateField(groupIdx: number, fieldIdx: number, value: string) {
    setGroups((prev) =>
      prev.map((g, gi) =>
        gi === groupIdx
          ? { ...g, fields: g.fields.map((f, fi) => (fi === fieldIdx ? { ...f, value } : f)) }
          : g,
      ),
    );
  }

  async function onSave() {
    if (!auth.token) return;
    const name = window.prompt("Name this character:");
    if (!name) return;
    setBusy(true);
    setError(null);
    try {
      const payload: CharacterPayload = { groups, action };
      await api.createPreset(auth.token, "character", name, payload as unknown as Record<string, unknown>);
      await refresh(auth.token);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  function onLoad(p: PresetOut) {
    const data = p.payload as unknown as CharacterPayload;
    if (data.groups) setGroups(data.groups);
    if (typeof data.action === "string") setAction(data.action);
  }

  async function onDelete(id: string) {
    if (!auth.token) return;
    if (!confirm("Delete this character?")) return;
    await api.deletePreset(auth.token, id);
    await refresh(auth.token);
  }

  return (
    <div className="flex h-screen flex-col">
      <StudioNav title="AI Character Design Studio" />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 shrink-0 overflow-y-auto border-r border-border bg-surface p-4">
          <h2 className="mb-4 px-2 text-xs uppercase tracking-wider text-muted">
            Character Attributes
          </h2>
          <div className="space-y-5">
            {groups.map((g, gi) => (
              <section key={g.id}>
                <h3 className="mb-2 text-sm font-medium text-text">{g.label}</h3>
                <dl className="space-y-2">
                  {g.fields.map((f, fi) => (
                    <div key={f.label} className="rounded-md border border-border bg-surface-2 p-2">
                      <dt className="text-[10px] uppercase tracking-wider text-muted">{f.label}</dt>
                      <dd>
                        <input
                          type="text"
                          value={f.value}
                          onChange={(e) => updateField(gi, fi, e.target.value)}
                          className="w-full bg-transparent text-sm text-text focus:outline-none"
                        />
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
            <section>
              <h3 className="mb-2 text-sm font-medium text-text">Face Lock</h3>
              <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-border bg-surface-2 text-xs text-muted">
                Upload Reference Image
              </div>
            </section>
          </div>
        </aside>

        <section className="flex flex-1 flex-col items-center gap-6 p-8">
          <div
            className="relative flex h-[55vh] w-full max-w-md items-center justify-center rounded-2xl border border-gold/30 bg-gradient-to-b from-surface-2 via-surface to-bg"
            aria-label="Portrait preview"
          >
            <span className="text-xs uppercase tracking-wider text-muted">Portrait Preview</span>
          </div>
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-4">
            <label className="mb-2 block text-xs uppercase tracking-wider text-muted">
              Character Action
            </label>
            <input
              type="text"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="e.g. walking confidently down a city street"
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-muted focus:border-gold focus:outline-none"
            />
          </div>
          <RenderCTA state={state} prompt={prompt} label="Generate Action" promptPreview />
        </section>

        <aside className="w-64 shrink-0 overflow-y-auto border-l border-border bg-surface p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs uppercase tracking-wider text-muted">Saved Characters</h2>
            <button
              type="button"
              onClick={onSave}
              disabled={busy || !auth.token}
              className="rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-3 py-1 text-xs font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] disabled:opacity-50"
            >
              {busy ? "…" : "Save"}
            </button>
          </div>
          {error && (
            <p role="alert" className="mb-2 text-xs text-red-300">
              {error}
            </p>
          )}

          {saved.length === 0 ? (
            <p className="mb-4 text-xs text-muted">
              {auth.token ? "No saved characters yet." : "Sign in to save."}
            </p>
          ) : (
            <ul className="mb-4 space-y-2" data-testid="saved-list">
              {saved.map((p) => (
                <li
                  key={p.id}
                  data-testid="saved-row"
                  className="flex items-center justify-between rounded-md border border-border bg-surface-2 px-2 py-1.5 text-xs"
                >
                  <button
                    type="button"
                    onClick={() => onLoad(p)}
                    className="flex-1 truncate text-left text-text hover:text-gold"
                  >
                    {p.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(p.id)}
                    aria-label={`Delete ${p.name}`}
                    className="ml-2 text-muted hover:text-red-300"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}

          <h3 className="mb-2 text-xs uppercase tracking-wider text-muted">Variants</h3>
          <div className="space-y-3">
            {CHARACTER.variants.map((v) => (
              <div
                key={v.id}
                data-testid="variant-tile"
                className="overflow-hidden rounded-md border border-border bg-surface-2"
              >
                <div className="relative aspect-[4/5]">
                  <Image src={v.image} alt={v.label} fill sizes="256px" className="object-cover" />
                </div>
                <div className="px-2 py-1.5 text-xs text-muted">{v.label}</div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
