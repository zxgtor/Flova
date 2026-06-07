"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { StudioNav } from "@/components/studio/StudioNav";
import { PresetPanel } from "@/components/studio/PresetPanel";
import { STORY, type Story } from "@/lib/story-mock";
import { RenderCTA, useRenderSubmit } from "@/lib/use-render-submit";

type StoryPayload = {
  story: Story;
};

export default function StoryPage() {
  const [story, setStory] = useState<Story>(STORY);
  const [activeId, setActiveId] = useState<string>(
    STORY.acts.flatMap((a) => a.scenes).find((s) => s.active)?.id ??
      STORY.acts[0]?.scenes[0]?.id ??
      "",
  );

  const state = useRenderSubmit("/studio/story");

  const activeScene = useMemo(
    () => story.acts.flatMap((a) => a.scenes).find((s) => s.id === activeId) ?? null,
    [story, activeId],
  );

  const prompt = (activeScene?.body ?? "").trim();

  function updateActiveBody(value: string) {
    if (!activeScene) return;
    setStory((prev) => ({
      ...prev,
      acts: prev.acts.map((act) => ({
        ...act,
        scenes: act.scenes.map((s) =>
          s.id === activeScene.id ? { ...s, body: value } : s,
        ),
      })),
    }));
  }

  const previewScenes = story.acts.flatMap((a) => a.scenes).filter((s) => s.previewImage);

  return (
    <div className="flex h-screen flex-col">
      <StudioNav title="AI Story Creation Studio" />
      <div className="flex flex-1 overflow-hidden">
        {/* Story structure sidebar */}
        <aside className="w-72 shrink-0 overflow-y-auto border-r border-border bg-surface p-4">
          <h2 className="mb-4 px-2 text-xs uppercase tracking-wider text-muted">
            Story Structure
          </h2>
          <nav className="space-y-1">
            {story.acts.map((act) => (
              <div key={act.id}>
                <div className="rounded-md px-2 py-1.5 text-sm font-medium text-text">
                  {act.title}
                </div>
                <ul className="ml-3 mt-1 space-y-0.5 border-l border-border pl-3">
                  {act.scenes.map((scene) => {
                    const isActive = scene.id === activeId;
                    return (
                      <li key={scene.id}>
                        <button
                          type="button"
                          onClick={() => setActiveId(scene.id)}
                          data-testid={isActive ? "active-scene" : undefined}
                          className={
                            "w-full rounded-md px-2 py-1 text-left text-sm " +
                            (isActive
                              ? "bg-surface-2 text-gold"
                              : "text-muted hover:text-text")
                          }
                        >
                          {scene.title}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
          <div className="mt-6 border-t border-border pt-4">
            <PresetPanel<StoryPayload>
              kind="story"
              payload={{ story }}
              onLoad={(p) => {
                if (p.story) {
                  setStory(p.story);
                  const first = p.story.acts.flatMap((a) => a.scenes)[0];
                  if (first) setActiveId(first.id);
                }
              }}
            />
          </div>
        </aside>

        {/* Scene editor */}
        <section className="flex-1 overflow-y-auto p-8">
          {activeScene ? (
            <>
              <h2 className="font-display text-2xl font-semibold">{activeScene.title}</h2>
              <div className="mt-5 rounded-lg border border-border bg-surface p-5">
                <div className="mb-2 text-xs uppercase tracking-wider text-muted">Manuscript</div>
                <textarea
                  rows={10}
                  value={activeScene.body}
                  onChange={(e) => updateActiveBody(e.target.value)}
                  placeholder="Write the scene body…"
                  className="w-full resize-none bg-transparent text-sm leading-relaxed text-text placeholder:text-muted focus:outline-none"
                />
              </div>
              <div className="mt-4 rounded-lg border border-border bg-surface-2/60 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-gold">AI co-writer</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="rounded-md border border-border px-3 py-1 text-xs text-muted hover:border-gold hover:text-gold"
                    >
                      Expand
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-border px-3 py-1 text-xs text-muted hover:border-gold hover:text-gold"
                    >
                      Change Style
                    </button>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-muted">
                  Pick a line and click <strong className="text-text">Expand</strong> for richer
                  prose, or switch tone with <strong className="text-text">Change Style</strong>.
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted">No active scene.</p>
          )}
        </section>

        {/* Scene previews sidebar */}
        <aside className="w-64 shrink-0 overflow-y-auto border-l border-border bg-surface p-4">
          <h2 className="mb-4 px-1 text-xs uppercase tracking-wider text-muted">
            Scene Previews
          </h2>
          <div className="space-y-3">
            {previewScenes.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveId(s.id)}
                data-testid="scene-preview"
                className={
                  "block w-full overflow-hidden rounded-md border bg-surface-2 text-left " +
                  (s.id === activeId ? "border-gold" : "border-border hover:border-gold")
                }
              >
                <div className="relative aspect-video">
                  <Image
                    src={s.previewImage as string}
                    alt=""
                    fill
                    sizes="256px"
                    className="object-cover"
                  />
                </div>
                <div className="px-2 py-1.5 text-xs text-muted">{s.title}</div>
              </button>
            ))}
          </div>
        </aside>
      </div>

      {/* Convert bar */}
      <footer className="flex items-center gap-6 border-t border-border bg-surface px-6 py-3">
        <div className="flex flex-1 items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full bg-gradient-to-r from-gold-deep via-gold to-gold-bright"
              style={{ width: `${story.readiness}%` }}
            />
          </div>
          <span className="text-xs text-muted">{story.readiness}% Ready</span>
        </div>
        <RenderCTA state={state} prompt={prompt} label="Convert to Video" />
        <button
          type="button"
          className="rounded-md border border-border px-4 py-1.5 text-sm text-muted hover:border-gold hover:text-gold"
        >
          Export to Timeline
        </button>
      </footer>
    </div>
  );
}
