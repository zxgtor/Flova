import Image from "next/image";
import { HomeNav } from "@/components/home/HomeNav";

const PRESETS = ["Cinematic v1", "Anime v2", "Abstract v3"];
const CUSTOM = ["My Style 1", "My Style 2", "My Style 3"];
const PREVIEWS = [
  { id: 1, title: "Preset Style 1", image: "/mockups/showcase-1.png", render: "12.3s", adherence: "92%", aesthetic: "8.7" },
  { id: 2, title: "Preset Style 2", image: "/mockups/showcase-2.png", render: "14.8s", adherence: "89%", aesthetic: "8.9" },
  { id: 3, title: "Preset Style 3", image: "/mockups/showcase-3.png", render: "11.4s", adherence: "94%", aesthetic: "9.0", winner: true },
  { id: 4, title: "Preset Style 4", image: "/mockups/showcase-4.png", render: "13.7s", adherence: "90%", aesthetic: "8.6" },
];

export default function StyleComparisonPage() {
  return (
    <>
      <HomeNav />
      <main className="grid gap-6 p-6 lg:grid-cols-[1fr_3fr]">
        <aside className="rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">Source &amp; Selection</h2>
          <div className="mb-4 flex h-24 items-center justify-center rounded-md border border-dashed border-border bg-surface-2 text-xs text-muted">
            Upload Base Video
          </div>
          <h3 className="mb-2 text-xs uppercase tracking-wider text-muted">Preset Styles</h3>
          <ul className="mb-4 space-y-1 text-sm text-muted">
            {PRESETS.map((p) => (
              <li key={p} className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-sm border border-border bg-surface-2" />
                {p}
              </li>
            ))}
          </ul>
          <h3 className="mb-2 text-xs uppercase tracking-wider text-muted">Custom Library</h3>
          <ul className="space-y-1 text-sm text-muted">
            {CUSTOM.map((p) => (
              <li key={p} className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-sm border border-border bg-surface-2" />
                {p}
              </li>
            ))}
          </ul>
        </aside>
        <section>
          <h1 className="mb-4 font-display text-xl">Style Comparison Benchmark</h1>
          <div className="grid gap-4 md:grid-cols-2">
            {PREVIEWS.map((p) => (
              <article
                key={p.id}
                data-testid="comparison-tile"
                className={
                  "overflow-hidden rounded-xl border bg-surface " +
                  (p.winner ? "border-gold" : "border-border")
                }
              >
                <div className="relative aspect-video">
                  <Image src={p.image} alt={p.title} fill sizes="50vw" className="object-cover" />
                  {p.winner && (
                    <span className="absolute right-3 top-3 rounded-full bg-gold/20 px-2 py-0.5 text-xs text-gold">
                      Winner
                    </span>
                  )}
                </div>
                <dl className="grid grid-cols-3 gap-2 p-3 text-[10px]">
                  <div>
                    <dt className="uppercase tracking-wider text-muted">Render</dt>
                    <dd className="text-text">{p.render}</dd>
                  </div>
                  <div>
                    <dt className="uppercase tracking-wider text-muted">Adherence</dt>
                    <dd className="text-text">{p.adherence}</dd>
                  </div>
                  <div>
                    <dt className="uppercase tracking-wider text-muted">Aesthetic</dt>
                    <dd className="text-text">{p.aesthetic}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-end gap-4 text-sm">
            <span className="text-muted">Winner Selection:</span>
            <button
              type="button"
              className="rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-4 py-2 font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
            >
              Promote Winner to Timeline
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
