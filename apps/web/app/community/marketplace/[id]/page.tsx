import Image from "next/image";
import { HomeNav } from "@/components/home/HomeNav";
import { TOP_SELLERS } from "@/lib/marketplace-mock";

const SHOWCASE = ["/mockups/showcase-2.png", "/mockups/showcase-3.png", "/mockups/showcase-4.png"];
const USE_CASES = ["Digital Art", "Portrait Photography", "Fantasy Concept", "Music Videos"];

type Props = { params: Promise<{ id: string }> };

export default async function StyleDetailPage({ params }: Props) {
  const { id } = await params;
  const style =
    TOP_SELLERS.find((s) => s.id === id) ?? {
      id,
      title: "Ethereal Realism",
      author: "@Kura Studio",
      price: 49,
      rating: 4.9,
      image: "/mockups/showcase-1.png",
    };
  return (
    <>
      <HomeNav />
      <main className="mx-auto max-w-6xl px-6 py-6">
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="relative aspect-video overflow-hidden rounded-xl border border-border">
            <Image src={style.image} alt={style.title} fill sizes="66vw" className="object-cover" />
          </div>
          <aside className="rounded-xl border border-border bg-surface p-5">
            <h1 className="font-display text-2xl font-semibold">{style.title}</h1>
            <p className="mt-1 text-sm text-muted">By {style.author}</p>
            <div className="mt-3 text-3xl font-semibold text-gold">${style.price}</div>
            <button
              type="button"
              className="mt-4 w-full rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-4 py-2 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
            >
              Buy Now
            </button>
          </aside>
        </div>
        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-lg">About the Style</h2>
            <p className="mt-2 text-sm text-muted">
              Originating from a custom-trained model on impressionist and fantasy art,{" "}
              {style.title} excels with subjects emphasizing soft light, texture, and a subtle
              atmospheric glow. Perfect for creative portraits and evocative landscapes.
            </p>
          </div>
          <div>
            <h2 className="font-display text-lg">Best Use Cases</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {USE_CASES.map((u) => (
                <span
                  key={u}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted"
                >
                  {u}
                </span>
              ))}
            </div>
          </div>
        </section>
        <section className="mt-8">
          <h2 className="font-display text-lg">Style Showcase</h2>
          <div className="mt-3 grid gap-4 md:grid-cols-3">
            {SHOWCASE.map((s, i) => (
              <div
                key={s}
                data-testid="style-showcase"
                className="relative aspect-video overflow-hidden rounded-md border border-border"
              >
                <Image src={s} alt={`Sample ${i + 1}`} fill sizes="33vw" className="object-cover" />
              </div>
            ))}
          </div>
        </section>
        <section className="mt-8 rounded-xl border border-border bg-surface p-5">
          <h2 className="font-display text-lg">Technical Specs</h2>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted">Base Model</dt>
              <dd className="text-text">SDXL 1.0, MidJourney V6</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted">Avg Render Time</dt>
              <dd className="text-text">70s @ 1080p, 42s @ 720p</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted">Resolution</dt>
              <dd className="text-text">Up to 4K</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted">File Format</dt>
              <dd className="text-text">.safetensors</dd>
            </div>
          </dl>
        </section>
      </main>
    </>
  );
}
