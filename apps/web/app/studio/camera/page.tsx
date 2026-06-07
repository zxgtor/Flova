"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StudioNav } from "@/components/studio/StudioNav";
import { CAMERA, type Preset } from "@/lib/camera-mock";
import { useAuth } from "@/lib/auth";
import { api, type PresetOut } from "@/lib/api";
import { RenderCTA, useRenderSubmit } from "@/lib/use-render-submit";

type CameraPayload = { cameraId: string; lightingId: string };

export default function CameraPage() {
  const auth = useAuth();
  const [cameraId, setCameraId] = useState(
    CAMERA.cameras.find((c) => c.active)?.id ?? CAMERA.cameras[0]?.id ?? "",
  );
  const [lightingId, setLightingId] = useState(
    CAMERA.lighting.find((l) => l.active)?.id ?? CAMERA.lighting[0]?.id ?? "",
  );
  const [saved, setSaved] = useState<PresetOut[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const state = useRenderSubmit("/studio/camera");

  const refresh = useCallback(async (token: string) => {
    try {
      setSaved(await api.listPresets(token, "camera"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load presets");
    }
  }, []);

  useEffect(() => {
    if (auth.loading || !auth.token) return;
    refresh(auth.token);
  }, [auth.loading, auth.token, refresh]);

  const prompt = useMemo(() => {
    const cam = CAMERA.cameras.find((c) => c.id === cameraId)?.label ?? "wide shot";
    const lit = CAMERA.lighting.find((l) => l.id === lightingId)?.label ?? "natural lighting";
    return `A cinematic shot composed with ${cam.toLowerCase()} and ${lit.toLowerCase()}, professional cinematography.`;
  }, [cameraId, lightingId]);

  async function onSave() {
    if (!auth.token) return;
    const name = window.prompt("Name this preset:");
    if (!name) return;
    setBusy(true);
    setError(null);
    try {
      const payload: CameraPayload = { cameraId, lightingId };
      await api.createPreset(auth.token, "camera", name, payload as unknown as Record<string, unknown>);
      await refresh(auth.token);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  function onLoad(p: PresetOut) {
    const data = p.payload as unknown as CameraPayload;
    if (data.cameraId) setCameraId(data.cameraId);
    if (data.lightingId) setLightingId(data.lightingId);
  }

  async function onDelete(id: string) {
    if (!auth.token) return;
    if (!confirm("Delete this preset?")) return;
    await api.deletePreset(auth.token, id);
    await refresh(auth.token);
  }

  function Grid({
    presets,
    label,
    activeId,
    onSelect,
  }: {
    presets: Preset[];
    label: string;
    activeId: string;
    onSelect: (id: string) => void;
  }) {
    return (
      <section>
        <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">{label}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {presets.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p.id)}
              data-testid="preset-tile"
              className={
                "overflow-hidden rounded-xl border bg-surface text-left " +
                (activeId === p.id ? "border-gold" : "border-border hover:border-gold")
              }
            >
              <div className="relative aspect-video">
                <Image src={p.image} alt={p.label} fill sizes="200px" className="object-cover" />
              </div>
              <div className="px-3 py-2 text-xs text-text">{p.label}</div>
            </button>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <StudioNav title="Camera & Lighting Presets" />
      <main className="mx-auto w-full max-w-4xl flex-1 space-y-8 overflow-y-auto p-8">
        <Grid presets={CAMERA.cameras} label="Camera" activeId={cameraId} onSelect={setCameraId} />
        <Grid presets={CAMERA.lighting} label="Lighting" activeId={lightingId} onSelect={setLightingId} />
        <section>
          <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">Custom</h2>
          <button
            type="button"
            onClick={onSave}
            disabled={busy || !auth.token}
            className="mb-3 w-full rounded-md border border-dashed border-gold/50 py-2 text-sm text-gold hover:bg-gold/10 disabled:opacity-50"
          >
            {busy ? "Saving…" : auth.token ? "+ Save New Custom Preset" : "Sign in to save"}
          </button>
          {error && (
            <p role="alert" className="mb-2 text-xs text-red-300">
              {error}
            </p>
          )}
          {saved.length === 0 ? (
            <p className="text-xs text-muted">No custom presets yet.</p>
          ) : (
            <ul className="space-y-2" data-testid="custom-list">
              {saved.map((p) => (
                <li
                  key={p.id}
                  data-testid="custom-preset"
                  className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2 text-sm"
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
                    className="ml-2 text-xs text-muted hover:text-red-300"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
        <div className="flex justify-center pt-2">
          <RenderCTA state={state} prompt={prompt} label="Render Sample" promptPreview />
        </div>
      </main>
    </div>
  );
}
