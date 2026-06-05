import Link from "next/link";
import { STUDIOS, type Studio } from "@/lib/studios";

function Card({ studio }: { studio: Studio }) {
  const body = (
    <div
      data-testid="studio-card"
      className="flex h-full flex-col rounded-xl border border-border bg-surface p-5 transition-colors group-hover:border-gold"
    >
      <span aria-hidden className="text-3xl">
        {studio.icon}
      </span>
      <h3 className="mt-4 font-display text-base font-semibold">{studio.label}</h3>
      <p className="mt-1 text-sm text-muted">{studio.blurb}</p>
      {!studio.available && (
        <span className="mt-3 self-start rounded-full border border-border px-2 py-0.5 text-xs text-muted">
          Coming soon
        </span>
      )}
    </div>
  );
  return studio.available ? (
    <Link href={`/studio/${studio.slug}`} className="group block">
      {body}
    </Link>
  ) : (
    <div className="group block opacity-70">{body}</div>
  );
}

export function StudioSelector() {
  return (
    <section className="mx-auto grid max-w-5xl gap-4 px-8 py-12 sm:grid-cols-2 lg:grid-cols-3">
      {STUDIOS.map((s) => (
        <Card key={s.slug} studio={s} />
      ))}
    </section>
  );
}
