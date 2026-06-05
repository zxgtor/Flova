import Image from "next/image";
import { CHARACTER } from "@/lib/character-mock";

export function VariantsSidebar() {
  return (
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
        className="mt-4 w-full rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-4 py-2 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
      >
        Save Character
      </button>
    </aside>
  );
}
