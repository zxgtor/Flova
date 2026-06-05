import Image from "next/image";
import { HomeNav } from "@/components/home/HomeNav";

const DISCOVERY = [
  { id: 1, label: "New York Timelapse", image: "/mockups/showcase-1.png" },
  { id: 2, label: "Tokyo Night", image: "/mockups/showcase-2.png" },
  { id: 3, label: "Friday Eve", image: "/mockups/showcase-3.png" },
  { id: 4, label: "Narrator Voice A", image: "/mockups/showcase-4.png" },
  { id: 5, label: "Subway Entrance", image: "/mockups/showcase-5.png" },
];

const LIBRARY = [
  { id: 1, label: "Street Scene 01", image: "/mockups/showcase-2.png" },
  { id: 2, label: "City Park", image: "/mockups/showcase-3.png" },
  { id: 3, label: "Voiceover Take 1", image: "/mockups/showcase-4.png" },
  { id: 4, label: "Riverside Shot", image: "/mockups/showcase-5.png" },
];

const INBOX = ["New York Timelapse", "Narrator Voice A", "Subway Entrance"];

export default function ResearchHubPage() {
  return (
    <>
      <HomeNav />
      <main className="p-6">
        <h1 className="mb-6 text-center font-display text-2xl">Unified AI Asset Research Hub</h1>
        <div className="mx-auto mb-8 flex max-w-3xl items-center gap-3 rounded-2xl border border-gold/40 bg-surface px-5 py-4">
          <input
            type="text"
            placeholder="Find cinematic urban environments and matching voice profiles…"
            className="flex-1 bg-transparent text-sm text-text placeholder:text-muted focus:outline-none"
          />
          <button
            type="button"
            className="rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-4 py-1.5 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
          >
            Analyze with AI
          </button>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_18rem_1fr]">
          <section className="rounded-xl border border-border bg-surface p-4">
            <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">Internet Discovery</h2>
            <div className="grid grid-cols-2 gap-3">
              {DISCOVERY.map((d) => (
                <div
                  key={d.id}
                  data-testid="discovery-tile"
                  className="overflow-hidden rounded-md border border-border bg-surface-2"
                >
                  <div className="relative aspect-video">
                    <Image src={d.image} alt="" fill sizes="200px" className="object-cover" />
                  </div>
                  <div className="px-2 py-1 text-xs text-muted">{d.label}</div>
                </div>
              ))}
            </div>
          </section>
          <aside className="rounded-xl border border-gold/40 bg-surface p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xs uppercase tracking-wider text-muted">Project Inbox</h2>
              <button
                type="button"
                className="rounded-md border border-gold px-2 py-1 text-xs text-gold hover:bg-gold/10"
              >
                Create Project
              </button>
            </div>
            <ul className="space-y-2 text-sm" data-testid="inbox-list">
              {INBOX.map((t) => (
                <li
                  key={t}
                  className="rounded-md border border-border bg-surface-2 px-3 py-2 text-text"
                >
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-3 flex h-24 flex-col items-center justify-center rounded-md border border-dashed border-border text-xs text-muted">
              Drag assets here
            </div>
          </aside>
          <section className="rounded-xl border border-border bg-surface p-4">
            <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">My Library</h2>
            <div className="grid grid-cols-2 gap-3">
              {LIBRARY.map((d) => (
                <div
                  key={d.id}
                  data-testid="library-tile"
                  className="overflow-hidden rounded-md border border-border bg-surface-2"
                >
                  <div className="relative aspect-video">
                    <Image src={d.image} alt="" fill sizes="200px" className="object-cover" />
                  </div>
                  <div className="px-2 py-1 text-xs text-muted">{d.label}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
