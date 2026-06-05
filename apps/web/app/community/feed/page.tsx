import Image from "next/image";
import Link from "next/link";
import { HomeNav } from "@/components/home/HomeNav";

const TABS = ["Cinematic", "Abstract", "Anime", "Scenery", "Realistic"];

const FEED = [
  "/mockups/showcase-1.png",
  "/mockups/showcase-2.png",
  "/mockups/showcase-3.png",
  "/mockups/showcase-4.png",
  "/mockups/showcase-5.png",
  "/mockups/showcase-6.png",
  "/mockups/hero-bg.png",
  "/mockups/character.png",
  "/mockups/voice.png",
  "/mockups/story.png",
  "/mockups/templates/script-to-video.png",
  "/mockups/templates/cinematic-story.png",
];

export default function CommunityFeedPage() {
  return (
    <>
      <HomeNav />
      <main className="p-6">
        <div className="mb-6 flex flex-wrap items-center justify-center gap-4 text-sm">
          {TABS.map((t, i) => (
            <span
              key={t}
              className={
                "rounded-full px-4 py-1 " +
                (i === 0 ? "bg-gold/20 text-gold" : "text-muted hover:text-text")
              }
            >
              {t}
            </span>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search community…"
          className="mx-auto mb-6 block w-full max-w-md rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-muted focus:border-gold focus:outline-none"
        />
        <div className="columns-2 gap-3 sm:columns-3 md:columns-4">
          {FEED.map((src, i) => (
            <Link
              key={i}
              href={`/community/remix/${i + 1}`}
              data-testid="feed-tile"
              className="mb-3 block break-inside-avoid overflow-hidden rounded-md border border-border bg-surface"
            >
              <div className="relative aspect-[3/4]">
                <Image src={src} alt="" fill sizes="25vw" className="object-cover" />
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
