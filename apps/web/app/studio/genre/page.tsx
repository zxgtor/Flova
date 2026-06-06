"use client";

import { useMemo, useState } from "react";
import { StudioNav } from "@/components/studio/StudioNav";
import { GENRE } from "@/lib/genre-mock";
import { RenderCTA, useRenderSubmit } from "@/lib/use-render-submit";

export default function GenrePage() {
  const [genreId, setGenreId] = useState(
    GENRE.genres.find((g) => g.active)?.id ?? GENRE.genres[0]?.id ?? "",
  );
  const [tones, setTones] = useState(
    Object.fromEntries(GENRE.tones.map((t) => [t.id, t.value])),
  );
  const state = useRenderSubmit("/studio/genre");

  const prompt = useMemo(() => {
    const g = GENRE.genres.find((x) => x.id === genreId);
    const toneText = GENRE.tones
      .map((t) => {
        const v = tones[t.id] ?? 50;
        const which = v < 33 ? t.leftLabel : v > 66 ? t.rightLabel : "balanced";
        return `${t.label.toLowerCase()}: ${which}`;
      })
      .join(", ");
    return `Establishing shot — ${g?.label ?? "cinematic"} genre. ${toneText}.`;
  }, [genreId, tones]);

  return (
    <div className="flex h-screen flex-col">
      <StudioNav title="AI Genre & Tone Selector" />
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-8 overflow-y-auto p-8">
        <section>
          <h2 className="mb-4 text-xs uppercase tracking-wider text-muted">Genre</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {GENRE.genres.map((g) => {
              const isActive = genreId === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGenreId(g.id)}
                  data-testid="genre-tile"
                  className={
                    "flex flex-col items-center gap-2 rounded-xl border p-4 text-center text-sm " +
                    (isActive
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-border bg-surface text-text hover:border-gold")
                  }
                >
                  <span aria-hidden className="text-2xl">{g.icon}</span>
                  <span>{g.label}</span>
                </button>
              );
            })}
          </div>
        </section>
        <section>
          <h2 className="mb-4 text-xs uppercase tracking-wider text-muted">Tone &amp; Atmosphere</h2>
          <div className="space-y-5">
            {GENRE.tones.map((t) => (
              <div key={t.id}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-text">{t.label}</span>
                  <span className="text-muted">{tones[t.id]}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={tones[t.id]}
                  onChange={(e) =>
                    setTones((p) => ({ ...p, [t.id]: Number(e.target.value) }))
                  }
                  aria-label={t.label}
                  className="w-full accent-[var(--gold)]"
                />
                <div className="mt-1 flex justify-between text-[10px] text-muted">
                  <span>{t.leftLabel}</span>
                  <span>{t.rightLabel}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
        <div className="flex justify-center pt-4">
          <RenderCTA state={state} prompt={prompt} label="Apply to Story" promptPreview />
        </div>
      </main>
    </div>
  );
}
