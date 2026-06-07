"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { StudioNav } from "@/components/studio/StudioNav";
import { PresetPanel } from "@/components/studio/PresetPanel";
import { STORYBOARD, type BoardScene } from "@/lib/storyboard-mock";
import { RenderCTA, useRenderSubmit } from "@/lib/use-render-submit";

type StoryboardPayload = {
  scenes: BoardScene[];
  activeId: string;
};

export default function StoryboardPage() {
  const [scenes, setScenes] = useState<BoardScene[]>(STORYBOARD.scenes);
  const [activeId, setActiveId] = useState(
    STORYBOARD.scenes.find((s) => s.active)?.id ?? STORYBOARD.scenes[0]?.id ?? "",
  );
  const state = useRenderSubmit("/studio/storyboard");

  function updateDescription(id: string, value: string) {
    setScenes((prev) => prev.map((s) => (s.id === id ? { ...s, description: value } : s)));
  }

  const active = scenes.find((s) => s.id === activeId);
  const prompt = useMemo(() => {
    if (!active) return "";
    return `Storyboard Scene ${active.number} — ${active.description} ${active.tags.join(", ")}.`.trim();
  }, [active]);

  return (
    <div className="flex h-screen flex-col">
      <StudioNav title="Visual Storyboard Planner" />
      <main className="flex-1 overflow-y-auto p-6">
        <section>
          <h2 className="mb-4 text-xs uppercase tracking-wider text-muted">Storyboard View</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {scenes.map((s) => (
              <article
                key={s.id}
                data-testid="board-scene"
                onClick={() => setActiveId(s.id)}
                className={
                  "flex cursor-pointer flex-col rounded-xl border bg-surface p-3 " +
                  (s.id === activeId ? "border-gold" : "border-border")
                }
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-muted">Scene {s.number}</span>
                </div>
                <div className="relative aspect-video w-full overflow-hidden rounded-md border border-border">
                  <Image src={s.image} alt="" fill sizes="33vw" className="object-cover" />
                </div>
                <div className="mt-3 space-y-3 text-xs">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted">Visual Description</div>
                    <textarea
                      rows={2}
                      value={s.description}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => updateDescription(s.id, e.target.value)}
                      className="mt-1 w-full resize-none rounded-md border border-border bg-surface-2 px-2 py-1 text-xs text-text focus:border-gold focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {s.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="mt-8 border-t border-border pt-6">
          <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">Global Assets</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {STORYBOARD.assets.map((a) => (
              <div
                key={a.id}
                data-testid="board-asset"
                className="overflow-hidden rounded-md border border-border bg-surface"
              >
                <div className="relative aspect-video">
                  <Image src={a.image} alt={a.label} fill sizes="200px" className="object-cover" />
                </div>
                <div className="px-2 py-1 text-xs text-muted">{a.label}</div>
              </div>
            ))}
          </div>
        </section>
        <div className="mt-8 flex justify-center">
          <RenderCTA state={state} prompt={prompt} label="Render Active Scene" promptPreview />
        </div>
        <section className="mt-8 rounded-xl border border-border bg-surface p-5">
          <PresetPanel<StoryboardPayload>
            kind="storyboard"
            payload={{ scenes, activeId }}
            onLoad={(p) => {
              if (Array.isArray(p.scenes)) setScenes(p.scenes);
              if (typeof p.activeId === "string") setActiveId(p.activeId);
            }}
          />
        </section>
      </main>
    </div>
  );
}
