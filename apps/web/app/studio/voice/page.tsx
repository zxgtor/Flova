"use client";

import { useMemo, useState } from "react";
import { StudioNav } from "@/components/studio/StudioNav";
import { PresetPanel } from "@/components/studio/PresetPanel";
import { VOICE } from "@/lib/voice-mock";
import { RenderCTA, useRenderSubmit } from "@/lib/use-render-submit";

type VoicePayload = {
  sliders: Record<string, number>;
  emotion: string;
  script: string;
};

export default function VoicePage() {
  const [sliders, setSliders] = useState(
    Object.fromEntries(VOICE.attributes.map((a) => [a.id, a.value])),
  );
  const [emotion, setEmotion] = useState(
    VOICE.emotions.find((e) => e.active)?.id ?? VOICE.emotions[0]?.id ?? "",
  );
  const [script, setScript] = useState("");
  const state = useRenderSubmit("/studio/voice");

  const prompt = useMemo(() => {
    const sliderText = VOICE.attributes
      .map((a) => `${a.label.toLowerCase()} ${sliders[a.id]}`)
      .join(", ");
    const emo = VOICE.emotions.find((e) => e.id === emotion)?.label.toLowerCase();
    const body = script.trim();
    if (!body) return "";
    return `Voiceover narration with ${emo} delivery (${sliderText}): "${body}"`;
  }, [sliders, emotion, script]);

  return (
    <div className="flex h-screen flex-col">
      <StudioNav title="AI Voice Design Studio" />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 shrink-0 overflow-y-auto border-r border-border bg-surface p-4">
          <h2 className="mb-4 px-1 text-xs uppercase tracking-wider text-muted">Voice Attributes</h2>
          <div className="space-y-4">
            {VOICE.attributes.map((s) => (
              <div key={s.id}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-text">{s.label}</span>
                  <span className="text-muted">{sliders[s.id]}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={sliders[s.id]}
                  onChange={(e) =>
                    setSliders((p) => ({ ...p, [s.id]: Number(e.target.value) }))
                  }
                  aria-label={s.label}
                  className="w-full accent-[var(--gold)]"
                />
              </div>
            ))}
          </div>
          <h3 className="mb-2 mt-6 px-1 text-xs uppercase tracking-wider text-muted">Emotion</h3>
          <div className="flex flex-wrap gap-2">
            {VOICE.emotions.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => setEmotion(e.id)}
                className={
                  "rounded-full border px-3 py-1 text-xs " +
                  (emotion === e.id
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-border text-muted hover:border-gold hover:text-gold")
                }
              >
                {e.label}
              </button>
            ))}
          </div>
        </aside>

        <section className="flex flex-1 flex-col gap-5 overflow-y-auto p-6">
          <div className="rounded-xl border border-border bg-surface p-4">
            <div className="mb-2 text-xs uppercase tracking-wider text-muted">Script &amp; Preview</div>
            <textarea
              name="script"
              rows={5}
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder={VOICE.scriptPlaceholder}
              className="w-full resize-none rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-muted focus:border-gold focus:outline-none"
            />
          </div>
          <div className="flex justify-center">
            <RenderCTA state={state} prompt={prompt} label="Generate Preview" promptPreview />
          </div>
        </section>

        <aside className="w-72 shrink-0 overflow-y-auto border-l border-border bg-surface p-4">
          <PresetPanel<VoicePayload>
            kind="voice"
            payload={{ sliders, emotion, script }}
            onLoad={(p) => {
              if (p.sliders) setSliders(p.sliders);
              if (typeof p.emotion === "string") setEmotion(p.emotion);
              if (typeof p.script === "string") setScript(p.script);
            }}
          />
          <h2 className="mb-3 mt-6 px-1 text-xs uppercase tracking-wider text-muted">
            Voice Library
          </h2>
          <ul className="space-y-2">
            {VOICE.library.map((v) => (
              <li
                key={v.id}
                data-testid="voice-preset"
                className="flex items-center justify-between rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text hover:border-gold"
              >
                <span>{v.label}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-xl border border-border bg-surface-2 p-4 text-center">
            <h3 className="mb-2 text-xs uppercase tracking-wider text-gold">Clone a Voice</h3>
            <div className="flex h-24 flex-col items-center justify-center rounded-md border border-dashed border-border text-xs text-muted">
              <span>Drag &amp; Drop your audio file</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
