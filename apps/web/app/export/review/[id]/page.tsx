import Image from "next/image";
import { HomeNav } from "@/components/home/HomeNav";

const COMMENTS = [
  { user: "Sarah M.", time: "10:14 AM", text: "Lighting feels a tad harsh here." },
  { user: "Dave L.", time: "10:30 AM", text: "Excellent composition!" },
  { user: "Aliyah R.", time: "10:55 AM", text: "Consider adding more punch around the climax." },
];

const TIMELINE = ["Scene 1: Arrival", "Scene 2: The Discovery", "Scene 3: The Sequence", "Scene 4: The Departure"];

type Props = { params: Promise<{ id: string }> };

export default async function ReviewExportPage({ params }: Props) {
  await params;
  return (
    <>
      <HomeNav />
      <main className="mx-auto max-w-6xl p-6">
        <header className="mb-6 text-center">
          <h1 className="font-display text-3xl font-semibold">Final Movie Review &amp; Export</h1>
          <p className="mt-1 text-sm text-muted">Project: The Silent Horizon</p>
        </header>
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="relative aspect-video overflow-hidden rounded-xl border border-border">
            <Image
              src="/mockups/hero-bg.png"
              alt=""
              fill
              sizes="66vw"
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-bg/80 p-2 text-xs text-muted">
              <button type="button" aria-label="Play">▶</button>
              <span>00:14:30 / 00:16:50</span>
            </div>
          </div>
          <aside className="rounded-xl border border-border bg-surface p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xs uppercase tracking-wider text-muted">Review &amp; Feedback</h2>
              <button type="button" className="text-xs text-gold hover:underline">
                Export Settings
              </button>
            </div>
            <ul className="space-y-3" data-testid="review-comments">
              {COMMENTS.map((c, i) => (
                <li key={i} className="rounded-md border border-border bg-surface-2 p-3 text-xs">
                  <div className="flex items-center justify-between text-[10px] text-muted">
                    <span>{c.user}</span>
                    <span>{c.time}</span>
                  </div>
                  <p className="mt-1 text-text">{c.text}</p>
                </li>
              ))}
            </ul>
          </aside>
        </div>
        <section className="mt-8">
          <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">Review Timeline</h2>
          <div className="grid gap-3 sm:grid-cols-4">
            {TIMELINE.map((t) => (
              <div
                key={t}
                data-testid="timeline-item"
                className="rounded-md border border-border bg-surface p-3 text-xs text-text"
              >
                {t}
              </div>
            ))}
          </div>
        </section>
        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            className="rounded-md border border-border px-5 py-2 text-sm text-muted hover:border-gold hover:text-gold"
          >
            Edit in Timeline
          </button>
          <button
            type="button"
            className="rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-5 py-2 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
          >
            Final Export &amp; Publish
          </button>
        </div>
      </main>
    </>
  );
}
