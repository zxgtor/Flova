import Image from "next/image";
import { HomeNav } from "@/components/home/HomeNav";

const SIDEBAR = ["All Assets", "Characters", "Voices", "Environments", "Soundtrack"];

const ASSETS = [
  { id: 1, title: "Anya — Synth Voice", type: "Character", image: "/mockups/showcase-1.png" },
  { id: 2, title: "Neon Cityscape — District 7", type: "Environment", image: "/mockups/showcase-2.png" },
  { id: 3, title: "Narrator — Deep Male", type: "Voice", image: "/mockups/showcase-3.png" },
  { id: 4, title: "Drone — Delivery Unit", type: "Character", image: "/mockups/showcase-4.png" },
  { id: 5, title: "Ancient Temple Ruins", type: "Environment", image: "/mockups/showcase-5.png" },
  { id: 6, title: "Upbeat Electronic Track", type: "Soundtrack", image: "/mockups/showcase-6.png" },
];

export default function AssetsHubPage() {
  return (
    <>
      <HomeNav />
      <div className="flex">
        <aside className="w-56 shrink-0 overflow-y-auto border-r border-border bg-surface p-4">
          <ul className="space-y-1 text-sm">
            {SIDEBAR.map((s, i) => (
              <li
                key={s}
                className={
                  "rounded-md px-3 py-1.5 " +
                  (i === 0 ? "bg-surface-2 text-gold" : "text-muted hover:text-text")
                }
              >
                {s}
              </li>
            ))}
          </ul>
        </aside>
        <main className="flex-1 p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h1 className="font-display text-2xl">Global Project Assets Hub</h1>
            <div className="flex flex-1 items-center gap-3">
              <input
                type="text"
                placeholder="Search assets, types, or tags…"
                className="flex-1 rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-muted focus:border-gold focus:outline-none"
              />
              <button
                type="button"
                className="rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-4 py-2 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
              >
                Create New Asset
              </button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {ASSETS.map((a) => (
              <article
                key={a.id}
                data-testid="asset-card"
                className="overflow-hidden rounded-xl border border-border bg-surface"
              >
                <div className="relative aspect-video">
                  <Image src={a.image} alt={a.title} fill sizes="33vw" className="object-cover" />
                </div>
                <div className="p-3">
                  <div className="text-sm text-text">{a.title}</div>
                  <div className="text-xs text-muted">{a.type}</div>
                </div>
              </article>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}
