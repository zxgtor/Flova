import Image from "next/image";
import { STORYBOARD } from "@/lib/storyboard-mock";

export function GlobalAssets() {
  return (
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
  );
}
