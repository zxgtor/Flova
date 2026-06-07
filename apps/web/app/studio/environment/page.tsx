"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { StudioNav } from "@/components/studio/StudioNav";
import { PresetPanel } from "@/components/studio/PresetPanel";
import { ENVIRONMENT } from "@/lib/environment-mock";
import { RenderCTA, useRenderSubmit } from "@/lib/use-render-submit";

type EnvironmentPayload = {
  activeItems: Record<string, string>;
  atmosphere: Record<string, number>;
};

export default function EnvironmentPage() {
  const [activeItems, setActiveItems] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const g of ENVIRONMENT.groups) {
      const act = g.items.find((i) => i.active);
      if (act) map[g.id] = act.id;
    }
    return map;
  });
  const [atmosphere, setAtmosphere] = useState(
    Object.fromEntries(ENVIRONMENT.atmosphere.map((a) => [a.id, a.value])),
  );

  const state = useRenderSubmit("/studio/environment");

  const prompt = useMemo(() => {
    const groupTerms = ENVIRONMENT.groups
      .map((g) => {
        const id = activeItems[g.id];
        const it = g.items.find((i) => i.id === id);
        return it ? `${g.label.toLowerCase()}: ${it.label}` : null;
      })
      .filter(Boolean)
      .join(", ");
    const top = ENVIRONMENT.atmosphere
      .map((a) => `${a.label.toLowerCase()} ${atmosphere[a.id]}%`)
      .join(", ");
    return `Cinematic environment — ${groupTerms}. Atmosphere: ${top}.`;
  }, [activeItems, atmosphere]);

  return (
    <div className="flex h-screen flex-col">
      <StudioNav title="AI Environment Designer Studio" />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 shrink-0 overflow-y-auto border-r border-border bg-surface p-4">
          <div className="space-y-5">
            {ENVIRONMENT.groups.map((g) => (
              <section key={g.id}>
                <h3 className="mb-2 px-1 text-xs uppercase tracking-wider text-muted">{g.label}</h3>
                <div className="flex flex-wrap gap-2">
                  {g.items.map((it) => {
                    const isActive = activeItems[g.id] === it.id;
                    return (
                      <button
                        key={it.id}
                        type="button"
                        onClick={() =>
                          setActiveItems((p) => ({ ...p, [g.id]: it.id }))
                        }
                        className={
                          "rounded-full border px-3 py-1 text-xs " +
                          (isActive
                            ? "border-gold bg-gold/10 text-gold"
                            : "border-border text-muted hover:border-gold hover:text-gold")
                        }
                      >
                        {it.label}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </aside>

        <section className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
          <div className="rounded-xl border border-border bg-surface p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-muted">Canvas</span>
              <span className="text-xs text-text">Project: {ENVIRONMENT.projectName}</span>
            </div>
            <div className="relative aspect-video w-full overflow-hidden rounded-md border border-border">
              <Image
                src={ENVIRONMENT.previewImage}
                alt=""
                fill
                sizes="(min-width:1024px) 60vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
          <div className="flex justify-center">
            <RenderCTA state={state} prompt={prompt} label="Generate Environment" promptPreview />
          </div>
          <div className="rounded-xl border border-border bg-surface p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-muted">Reference Gallery</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {ENVIRONMENT.references.map((r) => (
                <div
                  key={r.id}
                  data-testid="reference-tile"
                  className="overflow-hidden rounded-md border border-border bg-surface-2"
                >
                  <div className="relative aspect-video">
                    <Image src={r.image} alt={r.label} fill sizes="200px" className="object-cover" />
                  </div>
                  <div className="px-2 py-1 text-xs text-muted">{r.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="w-72 shrink-0 overflow-y-auto border-l border-border bg-surface p-4">
          <PresetPanel<EnvironmentPayload>
            kind="environment"
            payload={{ activeItems, atmosphere }}
            onLoad={(p) => {
              if (p.activeItems) setActiveItems(p.activeItems);
              if (p.atmosphere) setAtmosphere(p.atmosphere);
            }}
          />
          <h2 className="mb-4 mt-6 px-1 text-xs uppercase tracking-wider text-muted">
            Atmosphere
          </h2>
          <div className="space-y-4">
            {ENVIRONMENT.atmosphere.map((c) => (
              <div key={c.id}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-text">{c.label}</span>
                  <span className="text-muted">{atmosphere[c.id]}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={atmosphere[c.id]}
                  onChange={(e) =>
                    setAtmosphere((p) => ({ ...p, [c.id]: Number(e.target.value) }))
                  }
                  aria-label={c.label}
                  className="w-full accent-[var(--gold)]"
                />
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
