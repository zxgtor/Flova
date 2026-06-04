import { SHOWCASE_ITEMS } from "@/lib/showcase";

export function CommunityShowcase() {
  return (
    <section className="mx-auto max-w-5xl px-8 py-16">
      <h2 className="mb-8 text-center font-display text-3xl font-semibold">Community Showcase</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {SHOWCASE_ITEMS.map((item) => (
          <div
            key={item.id}
            data-testid="showcase-tile"
            className="aspect-video rounded-lg border border-border bg-surface-2 p-3 transition-colors hover:border-gold"
          >
            <div className="flex h-full flex-col justify-end">
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-muted">{item.author}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
