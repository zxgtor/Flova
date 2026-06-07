"use client";

import { useCallback, useEffect, useState } from "react";
import { api, type PresetOut } from "@/lib/api";
import { useAuth } from "@/lib/auth";

/**
 * Reusable Save / Load / Delete panel for studio presets.
 *
 * - `kind` namespaces the preset in the generic `studio_presets` table.
 * - `payload` is whatever the studio wants to round-trip; the panel only
 *   forwards it via `api.createPreset`.
 * - `onLoad(payload)` is called when the user clicks an entry — the studio
 *   takes the payload and restores its state.
 *
 * Anonymous users see a "Sign in to save" notice instead of the controls.
 */
export function PresetPanel<TPayload extends Record<string, unknown>>({
  kind,
  payload,
  onLoad,
  emptyHint = "No saved presets yet.",
}: {
  kind: string;
  payload: TPayload;
  onLoad: (payload: TPayload) => void;
  emptyHint?: string;
}) {
  const auth = useAuth();
  const [saved, setSaved] = useState<PresetOut[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(
    async (token: string) => {
      try {
        setSaved(await api.listPresets(token, kind));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load");
      }
    },
    [kind],
  );

  useEffect(() => {
    if (auth.loading || !auth.token) return;
    void refresh(auth.token);
  }, [auth.loading, auth.token, refresh]);

  if (!auth.loading && !auth.token) {
    return (
      <p className="text-xs text-muted">Sign in to save presets.</p>
    );
  }

  async function onSave() {
    if (!auth.token) return;
    const name = window.prompt("Name this preset:");
    if (!name) return;
    setBusy(true);
    setError(null);
    try {
      await api.createPreset(auth.token, kind, name, payload);
      await refresh(auth.token);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: string) {
    if (!auth.token) return;
    if (!confirm("Delete this preset?")) return;
    await api.deletePreset(auth.token, id);
    await refresh(auth.token);
  }

  return (
    <div data-testid={`preset-panel-${kind}`}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted">Saved</span>
        <button
          type="button"
          onClick={onSave}
          disabled={busy}
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
        <p className="text-xs text-muted">{emptyHint}</p>
      ) : (
        <ul className="space-y-1" data-testid={`preset-list-${kind}`}>
          {saved.map((p) => (
            <li
              key={p.id}
              data-testid="preset-item"
              className="flex items-center justify-between rounded-md border border-border bg-surface-2 px-2 py-1 text-xs"
            >
              <button
                type="button"
                onClick={() => onLoad(p.payload as TPayload)}
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
    </div>
  );
}
