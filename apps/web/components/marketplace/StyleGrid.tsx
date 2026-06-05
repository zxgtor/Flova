import Image from "next/image";
import Link from "next/link";
import { TOP_SELLERS } from "@/lib/marketplace-mock";

const TABS = ["Top Sellers", "New Arrivals", "My Purchases"];

export function StyleGrid() {
  return (
    <section className="mt-6">
      <div className="mb-4 flex gap-6 border-b border-border text-sm">
        {TABS.map((t, i) => (
          <span
            key={t}
            className={
              "pb-2 " + (i === 0 ? "border-b-2 border-gold text-gold" : "text-muted")
            }
          >
            {t}
          </span>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {TOP_SELLERS.map((s) => (
          <Link
            key={s.id}
            href={`/community/marketplace/${s.id}`}
            data-testid="style-card"
            className="group block overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-gold"
          >
            <div className="relative aspect-video w-full">
              <Image
                src={s.image}
                alt=""
                fill
                sizes="(min-width:1280px) 25vw, 50vw"
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <div className="p-3">
              <div className="text-sm font-medium text-text">{s.title}</div>
              <div className="mt-1 flex items-center justify-between text-xs text-muted">
                <span>{s.author}</span>
                <span className="text-gold">★ {s.rating}</span>
              </div>
              <div className="mt-2 text-sm font-semibold text-gold">${s.price}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
