import Image from "next/image";
import Link from "next/link";
import { HomeNav } from "@/components/home/HomeNav";

const STYLES = [
  { id: "1", title: "Cinematic Noir", version: "v2", before: "/mockups/showcase-1.png", after: "/mockups/showcase-2.png", popular: true },
  { id: "2", title: "Ethereal Glow", version: "v4", before: "/mockups/showcase-3.png", after: "/mockups/showcase-4.png", popular: true },
  { id: "3", title: "Retro Anime", version: "v3", before: "/mockups/showcase-5.png", after: "/mockups/showcase-6.png", popular: false },
  { id: "4", title: "Cinematic Noir", version: "v1", before: "/mockups/showcase-2.png", after: "/mockups/showcase-3.png", popular: false },
  { id: "5", title: "Ethereal Glow", version: "v3", before: "/mockups/showcase-4.png", after: "/mockups/showcase-5.png", popular: false },
  { id: "6", title: "Surreal Landscape", version: "v1", before: "/mockups/showcase-6.png", after: "/mockups/showcase-1.png", popular: false },
];

const TABS = ["My Styles", "Shared with Me", "Community Marketplace"];

export default function CustomStyleLibraryPage() {
  return (
    <>
      <HomeNav />
      <main className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="font-display text-xl">Custom Style Library</h1>
          <Link
            href="/manage/styles/train"
            className="rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-4 py-1.5 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
          >
            Train New Style
          </Link>
        </div>
        <div className="mb-6 flex gap-6 border-b border-border text-sm">
          {TABS.map((t, i) => (
            <span
              key={t}
              className={"pb-2 " + (i === 0 ? "border-b-2 border-gold text-gold" : "text-muted")}
            >
              {t}
            </span>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {STYLES.map((s) => (
            <article
              key={s.id}
              data-testid="library-style"
              className="overflow-hidden rounded-xl border border-border bg-surface"
            >
              <div className="grid grid-cols-2">
                <div className="relative aspect-square border-r border-border">
                  <Image src={s.before} alt="before" fill sizes="200px" className="object-cover" />
                  <span className="absolute left-2 top-2 rounded-full bg-bg/70 px-2 text-[10px] text-muted">
                    BEFORE
                  </span>
                </div>
                <div className="relative aspect-square">
                  <Image src={s.after} alt="after" fill sizes="200px" className="object-cover" />
                  <span className="absolute left-2 top-2 rounded-full bg-gold/20 px-2 text-[10px] text-gold">
                    AFTER
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 text-sm">
                <div>
                  <div className="text-text">
                    {s.title} <span className="text-muted">({s.version})</span>
                  </div>
                </div>
                <div className="flex gap-2 text-xs">
                  <button type="button" className="rounded-md border border-gold px-2 py-1 text-gold hover:bg-gold/10">
                    Apply
                  </button>
                  <button type="button" className="rounded-md border border-border px-2 py-1 text-muted hover:border-gold hover:text-gold">
                    Edit
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
