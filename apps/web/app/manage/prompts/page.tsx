import Image from "next/image";
import { HomeNav } from "@/components/home/HomeNav";

const COLLECTIONS = ["My Favorites", "Recent Documents", "Cinematic Styles", "Character Prompts"];

const PROMPTS = [
  {
    id: 1,
    text: "Generate a cinematic 4K video of a futuristic city skyline at dusk with flying vehicles and glowing architecture, using a blue and purple color palette.",
    style: "Cyberpunk Noir",
    saved: "Oct 5, 2025",
    tags: ["Cinematic", "Sci-Fi", "Cityscape"],
    image: "/mockups/showcase-1.png",
  },
  {
    id: 2,
    text: "Create a detailed character portrait of a female astronaut in a suit, smiling with Earth in the background.",
    style: "Realistic, Close-up",
    saved: "Oct 5, 2025",
    tags: ["Character", "Space", "Portrait"],
    image: "/mockups/showcase-2.png",
  },
  {
    id: 3,
    text: "Synthesize a serene nature documentary-style clip of a misty forest with flowing water and wildlife.",
    style: "Documentary, Nature, Slow Motion",
    saved: "Oct 6, 2025",
    tags: ["Nature", "Documentary", "Calm"],
    image: "/mockups/showcase-3.png",
  },
];

export default function PromptLibraryPage() {
  return (
    <>
      <HomeNav />
      <div className="flex">
        <aside className="w-56 shrink-0 overflow-y-auto border-r border-border bg-surface p-4">
          <ul className="space-y-1 text-sm">
            {COLLECTIONS.map((c, i) => (
              <li
                key={c}
                className={
                  "rounded-md px-3 py-1.5 " +
                  (i === 0 ? "bg-surface-2 text-gold" : "text-muted hover:text-text")
                }
              >
                {c}
              </li>
            ))}
            <li className="mt-3 rounded-md border border-dashed border-gold/40 px-3 py-1.5 text-center text-xs text-gold">
              + New Collection
            </li>
          </ul>
        </aside>
        <main className="flex-1 p-6">
          <h1 className="mb-4 font-display text-2xl">Prompt Library</h1>
          <input
            type="text"
            placeholder="Search saved prompts, styles, or tags…"
            className="mb-6 w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-muted focus:border-gold focus:outline-none"
          />
          <ul className="space-y-4">
            {PROMPTS.map((p) => (
              <li
                key={p.id}
                data-testid="prompt-card"
                className="flex gap-4 rounded-xl border border-border bg-surface p-4"
              >
                <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-md">
                  <Image src={p.image} alt="" fill sizes="128px" className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-text">{p.text}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-muted">
                    <span>Style: {p.style}</span>
                    <span>•</span>
                    <span>Saved: {p.saved}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[10px] text-muted"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    className="rounded-md border border-border px-3 py-1 text-xs text-muted hover:border-gold hover:text-gold"
                  >
                    Copy
                  </button>
                  <button
                    type="button"
                    className="rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-3 py-1 text-xs font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
                  >
                    Use in Workspace
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </main>
      </div>
    </>
  );
}
