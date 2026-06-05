import Image from "next/image";
import { HomeNav } from "@/components/home/HomeNav";

const TABS = ["My Creations", "Prompt Library", "Private Drafts"];

const WORKS = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  image: `/mockups/showcase-${(i % 6) + 1}.png`,
  isPublic: i % 3 !== 0,
}));

const STATS = [
  { label: "Total Generations", value: "1,245" },
  { label: "Likes Received", value: "85.2k" },
  { label: "Followers", value: "31k" },
];

export default function UserProfilePage() {
  return (
    <>
      <HomeNav />
      <main className="p-6">
        <header className="mb-6 flex items-center gap-6 rounded-2xl border border-border bg-surface p-6">
          <div className="h-16 w-16 rounded-full border border-gold/50 bg-gradient-to-b from-surface-2 via-surface to-bg" />
          <div className="flex-1">
            <h1 className="font-display text-2xl">@AuraCreator</h1>
            <p className="text-sm text-muted">
              Visionary AI Artist &amp; Storyteller. Exploring the boundaries of generative video.
            </p>
          </div>
          <div className="flex gap-6 text-center">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="font-display text-xl text-text">{s.value}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </header>
        <div className="mb-4 flex gap-6 border-b border-border text-sm">
          {TABS.map((t, i) => (
            <span
              key={t}
              className={"pb-2 " + (i === 0 ? "border-b-2 border-gold text-gold" : "text-muted")}
            >
              {t}
            </span>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {WORKS.map((w) => (
            <div
              key={w.id}
              data-testid="creation-tile"
              className="relative overflow-hidden rounded-xl border border-border bg-surface"
            >
              <div className="relative aspect-video">
                <Image src={w.image} alt="" fill sizes="25vw" className="object-cover" />
                <span
                  className={
                    "absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] " +
                    (w.isPublic ? "bg-gold/20 text-gold" : "bg-bg/70 text-muted")
                  }
                >
                  {w.isPublic ? "Public" : "Private"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
