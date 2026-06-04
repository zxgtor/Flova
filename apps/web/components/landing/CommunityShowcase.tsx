import Image from "next/image";
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
            className="group relative aspect-video overflow-hidden rounded-lg border border-border bg-surface-2 transition-colors hover:border-gold"
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              sizes="(min-width: 768px) 33vw, 50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(14,15,18,0.85) 0%, rgba(14,15,18,0) 50%)",
              }}
            />
            <div className="absolute inset-x-3 bottom-3">
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-muted">{item.author}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
