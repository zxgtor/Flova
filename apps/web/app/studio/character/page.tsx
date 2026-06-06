"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { StudioNav } from "@/components/studio/StudioNav";
import { CHARACTER } from "@/lib/character-mock";
import { RenderCTA, useRenderSubmit } from "@/lib/use-render-submit";

export default function CharacterPage() {
  const [groups, setGroups] = useState(CHARACTER.groups);
  const [action, setAction] = useState("walking confidently down a city street");
  const state = useRenderSubmit("/studio/character");

  const prompt = useMemo(() => {
    const flat = groups.flatMap((g) => g.fields).map((f) => `${f.label.toLowerCase()}: ${f.value}`).join(", ");
    return `${CHARACTER.name === "Untitled Character" ? "Character" : CHARACTER.name} — ${flat}. Action: ${action}`;
  }, [groups, action]);

  function updateField(groupIdx: number, fieldIdx: number, value: string) {
    setGroups((prev) =>
      prev.map((g, gi) =>
        gi === groupIdx
          ? { ...g, fields: g.fields.map((f, fi) => (fi === fieldIdx ? { ...f, value } : f)) }
          : g,
      ),
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <StudioNav title="AI Character Design Studio" />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 shrink-0 overflow-y-auto border-r border-border bg-surface p-4">
          <h2 className="mb-4 px-2 text-xs uppercase tracking-wider text-muted">
            Character Attributes
          </h2>
          <div className="space-y-5">
            {groups.map((g, gi) => (
              <section key={g.id}>
                <h3 className="mb-2 text-sm font-medium text-text">{g.label}</h3>
                <dl className="space-y-2">
                  {g.fields.map((f, fi) => (
                    <div key={f.label} className="rounded-md border border-border bg-surface-2 p-2">
                      <dt className="text-[10px] uppercase tracking-wider text-muted">{f.label}</dt>
                      <dd>
                        <input
                          type="text"
                          value={f.value}
                          onChange={(e) => updateField(gi, fi, e.target.value)}
                          className="w-full bg-transparent text-sm text-text focus:outline-none"
                        />
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
            <section>
              <h3 className="mb-2 text-sm font-medium text-text">Face Lock</h3>
              <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-border bg-surface-2 text-xs text-muted">
                Upload Reference Image
              </div>
            </section>
          </div>
        </aside>

        <section className="flex flex-1 flex-col items-center gap-6 p-8">
          <div
            className="relative flex h-[55vh] w-full max-w-md items-center justify-center rounded-2xl border border-gold/30 bg-gradient-to-b from-surface-2 via-surface to-bg"
            aria-label="Portrait preview"
          >
            <span className="text-xs uppercase tracking-wider text-muted">Portrait Preview</span>
          </div>
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-4">
            <label className="mb-2 block text-xs uppercase tracking-wider text-muted">
              Character Action
            </label>
            <input
              type="text"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="e.g. walking confidently down a city street"
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-muted focus:border-gold focus:outline-none"
            />
          </div>
          <RenderCTA state={state} prompt={prompt} label="Generate Action" promptPreview />
        </section>

        <aside className="w-64 shrink-0 overflow-y-auto border-l border-border bg-surface p-4">
          <h2 className="mb-4 px-1 text-xs uppercase tracking-wider text-muted">Character Variants</h2>
          <div className="space-y-3">
            {CHARACTER.variants.map((v) => (
              <div
                key={v.id}
                data-testid="variant-tile"
                className="overflow-hidden rounded-md border border-border bg-surface-2"
              >
                <div className="relative aspect-[4/5]">
                  <Image src={v.image} alt={v.label} fill sizes="256px" className="object-cover" />
                </div>
                <div className="px-2 py-1.5 text-xs text-muted">{v.label}</div>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-4 w-full rounded-md border border-gold px-4 py-2 text-sm text-gold hover:bg-gold/10"
          >
            Save Character
          </button>
        </aside>
      </div>
    </div>
  );
}
