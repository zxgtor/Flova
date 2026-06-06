"use client";

import { STORY } from "@/lib/story-mock";
import { RenderCTA, useRenderSubmit } from "@/lib/use-render-submit";

export function ConvertBar({ prompt }: { prompt?: string }) {
  const pct = STORY.readiness;
  const state = useRenderSubmit("/studio/story");
  // Fall back to the active scene body if the page didn't pass a composed prompt.
  const renderPrompt = (prompt ?? STORY.acts.flatMap((a) => a.scenes).find((s) => s.active)?.body ?? "").trim();

  return (
    <footer className="flex items-center gap-6 border-t border-border bg-surface px-6 py-3">
      <div className="flex flex-1 items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full bg-gradient-to-r from-gold-deep via-gold to-gold-bright"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs text-muted">{pct}% Ready</span>
      </div>
      <RenderCTA state={state} prompt={renderPrompt} label="Convert to Video" />
      <button
        type="button"
        className="rounded-md border border-border px-4 py-1.5 text-sm text-muted hover:border-gold hover:text-gold"
      >
        Export to Timeline
      </button>
    </footer>
  );
}
