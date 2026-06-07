"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StudioNav } from "@/components/studio/StudioNav";
import { PresetPanel } from "@/components/studio/PresetPanel";
import { useAuth } from "@/lib/auth";
import { api, type FileOut, type RenderJobOut } from "@/lib/api";

type EnhanceId = "denoise" | "stabilize" | "frame" | "color";
type EditorPayload = {
  enhancements: Record<EnhanceId, boolean>;
  motion: { speed: number; scale: number; rotate: number };
  color: { exposure: number; contrast: number; shadows: number };
};

const ENHANCE: { id: EnhanceId; label: string }[] = [
  { id: "denoise", label: "AI Denoise" },
  { id: "stabilize", label: "Auto Stabilize" },
  { id: "frame", label: "Frame Interpolation" },
  { id: "color", label: "Auto Color" },
];

const DEFAULT_STATE: EditorPayload = {
  enhancements: { denoise: true, stabilize: true, frame: false, color: true },
  motion: { speed: 100, scale: 100, rotate: 0 },
  color: { exposure: 50, contrast: 65, shadows: 40 },
};

const TRACKS = [
  { id: "v1", label: "Video 1", color: "bg-gold/30" },
  { id: "v2", label: "Video 2", color: "bg-gold/15" },
  { id: "a1", label: "Audio 1", color: "bg-gold-bright/30" },
  { id: "a2", label: "Audio 2", color: "bg-gold-deep/30" },
  { id: "sfx", label: "SFX", color: "bg-gold/20" },
];

function humanBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

export default function EditorPage() {
  const auth = useAuth();
  const [state, setState] = useState<EditorPayload>(DEFAULT_STATE);
  const [files, setFiles] = useState<FileOut[] | null>(null);
  const [recent, setRecent] = useState<RenderJobOut[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (token: string) => {
    try {
      const [f, r] = await Promise.all([
        api.listMyFiles(token),
        api.meRecentRenders(token, 8, "done"),
      ]);
      setFiles(f);
      setRecent(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, []);

  useEffect(() => {
    if (auth.loading || !auth.token) return;
    void load(auth.token);
  }, [auth.loading, auth.token, load]);

  const assets = useMemo(() => {
    const fromFiles = (files ?? []).map((f) => ({
      key: f.id,
      label: f.storage_key.split("/").pop() ?? f.id,
      sub: humanBytes(f.byte_size),
    }));
    const fromRenders = (recent ?? []).map((r) => ({
      key: r.id,
      label: r.prompt.slice(0, 60),
      sub: "Render output",
    }));
    return [...fromRenders, ...fromFiles];
  }, [files, recent]);

  function toggleEnhance(id: EnhanceId) {
    setState((p) => ({
      ...p,
      enhancements: { ...p.enhancements, [id]: !p.enhancements[id] },
    }));
  }

  if (!auth.loading && !auth.token) {
    return (
      <>
        <StudioNav title="Video Editing Workspace" />
        <main className="p-8 text-center">
          <Link href="/signin?next=/editor" className="text-gold hover:underline">
            Sign in
          </Link>{" "}
          to open the editor.
        </main>
      </>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <StudioNav title="Video Editing Workspace" />
      <div className="grid flex-1 grid-cols-[14rem_1fr_18rem] overflow-hidden">
        <aside className="flex flex-col overflow-hidden border-r border-border bg-surface">
          <div className="border-b border-border p-3">
            <h2 className="mb-2 px-1 text-xs uppercase tracking-wider text-muted">
              Asset Library
            </h2>
            <input
              type="text"
              placeholder="Search…"
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-1.5 text-xs text-text placeholder:text-muted focus:border-gold focus:outline-none"
            />
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {error && (
              <p role="alert" className="mb-2 text-xs text-red-300">
                {error}
              </p>
            )}
            {assets.length === 0 ? (
              <p className="text-xs text-muted">
                {files === null
                  ? "Loading…"
                  : "No assets yet. Render a prompt or upload a file."}
              </p>
            ) : (
              <ul className="space-y-2">
                {assets.map((a) => (
                  <li
                    key={a.key}
                    data-testid="editor-asset"
                    className="flex items-center gap-2 rounded-md border border-border bg-surface-2 p-2 text-xs text-muted hover:border-gold"
                  >
                    <div className="h-10 w-14 shrink-0 rounded bg-gradient-to-br from-surface-2 via-surface to-bg" />
                    <div className="min-w-0">
                      <div className="truncate text-text">{a.label}</div>
                      <div className="text-[10px] text-muted">{a.sub}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        <section className="flex flex-col overflow-hidden">
          <div className="flex flex-1 items-center justify-center bg-bg p-6">
            <div className="relative aspect-video w-full max-w-3xl overflow-hidden rounded-md border border-border bg-gradient-to-br from-surface-2 via-surface to-bg">
              <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-bg/80 p-2 text-xs text-muted">
                <button type="button" aria-label="Play">
                  ▶
                </button>
                <span>00:00:00:00</span>
                <span className="ml-auto rounded-md border border-gold px-2 py-0.5 text-gold">
                  PREVIEW
                </span>
              </div>
            </div>
          </div>
          <div className="border-t border-border bg-surface p-3">
            <div className="space-y-1">
              {TRACKS.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-2 rounded-sm text-xs"
                  data-testid="timeline-track"
                >
                  <span className="w-16 shrink-0 text-muted">{t.label}</span>
                  <div className={"h-5 flex-1 rounded-sm " + t.color} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="overflow-y-auto border-l border-border bg-surface p-4">
          <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">Properties</h2>

          <h3 className="mb-2 text-xs uppercase tracking-wider text-gold">AI Enhancements</h3>
          <ul className="mb-5 space-y-1.5 text-xs">
            {ENHANCE.map((e) => {
              const on = state.enhancements[e.id];
              return (
                <li key={e.id} className="flex items-center justify-between">
                  <span className="text-text">{e.label}</span>
                  <button
                    type="button"
                    onClick={() => toggleEnhance(e.id)}
                    data-testid={`toggle-${e.id}`}
                    className={
                      "rounded-full px-2 py-0.5 text-[10px] " +
                      (on
                        ? "bg-gold/20 text-gold"
                        : "bg-surface-2 text-muted hover:text-gold")
                    }
                  >
                    {on ? "ON" : "OFF"}
                  </button>
                </li>
              );
            })}
          </ul>

          <h3 className="mb-2 text-xs uppercase tracking-wider text-gold">Motion</h3>
          {(["speed", "scale", "rotate"] as const).map((k) => (
            <div key={k} className="mb-3">
              <div className="mb-0.5 flex items-center justify-between text-xs">
                <span className="text-text">
                  {k === "speed" ? "Speed" : k === "scale" ? "Scale" : "Rotate"}
                </span>
                <span className="text-muted">{state.motion[k]}</span>
              </div>
              <input
                type="range"
                min={k === "rotate" ? -180 : 0}
                max={k === "rotate" ? 180 : 200}
                value={state.motion[k]}
                onChange={(e) =>
                  setState((p) => ({
                    ...p,
                    motion: { ...p.motion, [k]: Number(e.target.value) },
                  }))
                }
                aria-label={k}
                className="w-full accent-[var(--gold)]"
              />
            </div>
          ))}

          <h3 className="mb-2 text-xs uppercase tracking-wider text-gold">Color Grading</h3>
          {(["exposure", "contrast", "shadows"] as const).map((k) => (
            <div key={k} className="mb-3">
              <div className="mb-0.5 flex items-center justify-between text-xs">
                <span className="text-text capitalize">{k}</span>
                <span className="text-muted">{state.color[k]}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={state.color[k]}
                onChange={(e) =>
                  setState((p) => ({
                    ...p,
                    color: { ...p.color, [k]: Number(e.target.value) },
                  }))
                }
                aria-label={k}
                className="w-full accent-[var(--gold)]"
              />
            </div>
          ))}

          <div className="mt-6 border-t border-border pt-4">
            <PresetPanel<EditorPayload>
              kind="editor"
              payload={state}
              onLoad={(p) => setState({ ...DEFAULT_STATE, ...p })}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
