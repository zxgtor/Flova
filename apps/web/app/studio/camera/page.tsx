"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { StudioNav } from "@/components/studio/StudioNav";
import { CAMERA, type Preset } from "@/lib/camera-mock";
import { RenderCTA, useRenderSubmit } from "@/lib/use-render-submit";

export default function CameraPage() {
  const [cameraId, setCameraId] = useState(
    CAMERA.cameras.find((c) => c.active)?.id ?? CAMERA.cameras[0]?.id ?? "",
  );
  const [lightingId, setLightingId] = useState(
    CAMERA.lighting.find((l) => l.active)?.id ?? CAMERA.lighting[0]?.id ?? "",
  );
  const state = useRenderSubmit("/studio/camera");

  const prompt = useMemo(() => {
    const cam = CAMERA.cameras.find((c) => c.id === cameraId)?.label ?? "wide shot";
    const lit = CAMERA.lighting.find((l) => l.id === lightingId)?.label ?? "natural lighting";
    return `A cinematic shot composed with ${cam.toLowerCase()} and ${lit.toLowerCase()}, professional cinematography.`;
  }, [cameraId, lightingId]);

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
            className="mb-3 w-full rounded-md border border-dashed border-gold/50 py-2 text-sm text-gold hover:bg-gold/10"
          >
            + Save New Custom Preset
          </button>
          <ul className="space-y-2">
            {CAMERA.custom.map((c) => (
              <li
                key={c.id}
                data-testid="custom-preset"
                className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2 text-sm"
              >
                <span className="text-text">{c.label}</span>
                <button
                  type="button"
                  className="text-xs text-muted hover:text-gold"
                  aria-label={`Edit ${c.label}`}
                >
                  Edit
                </button>
              </li>
            ))}
          </ul>
        </section>
        <div className="flex justify-center pt-2">
          <RenderCTA state={state} prompt={prompt} label="Render Sample" promptPreview />
        </div>
      </main>
    </div>
  );
}
