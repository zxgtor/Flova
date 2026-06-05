import Image from "next/image";
import type { Preset } from "@/lib/camera-mock";

export function PresetGrid({ presets, label }: { presets: Preset[]; label: string }) {
  return (
    <section>
      <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">{label}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {presets.map((p) => (
          <div
            key={p.id}
            data-testid="preset-tile"
            className={
              "overflow-hidden rounded-xl border bg-surface " +
              (p.active ? "border-gold" : "border-border")
            }
          >
            <div className="relative aspect-video">
              <Image src={p.image} alt={p.label} fill sizes="200px" className="object-cover" />
            </div>
            <div className="px-3 py-2 text-xs text-text">{p.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
