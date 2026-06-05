import Image from "next/image";
import { HomeNav } from "@/components/home/HomeNav";

const QUEUE = [
  { id: 1, title: "Scene 1: Cityscape Sunset", status: "In Progress", progress: 75, image: "/mockups/showcase-1.png" },
  { id: 2, title: "Scene 2: Abstract Motion",  status: "Queued",      progress: 0,  image: "/mockups/showcase-2.png" },
  { id: 3, title: "Scene 3: Forest Walk",      status: "Completed",   progress: 100,image: "/mockups/showcase-3.png" },
  { id: 4, title: "Scene 4: Character Animation", status: "Queued",   progress: 0,  image: "/mockups/showcase-4.png" },
  { id: 5, title: "Scene 5: Ocean View",       status: "Queued",      progress: 0,  image: "/mockups/showcase-5.png" },
  { id: 6, title: "Scene 6: Space Station",    status: "Queued",      progress: 0,  image: "/mockups/showcase-6.png" },
];

export default function BatchRenderPage() {
  return (
    <>
      <HomeNav />
      <main className="p-6">
        <h1 className="mb-6 font-display text-2xl">Batch Render Dashboard</h1>
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface p-4">
            <div className="text-xs uppercase tracking-wider text-muted">Total Scenes</div>
            <div className="mt-2 font-display text-2xl">24</div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4">
            <div className="text-xs uppercase tracking-wider text-muted">Rendering Power</div>
            <div className="mt-2 font-display text-2xl">Pro Tier (8 GPUs)</div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4">
            <div className="text-xs uppercase tracking-wider text-muted">Estimated Completion</div>
            <div className="mt-2 font-display text-2xl">01h 45m</div>
          </div>
        </div>
        <div className="mb-6 flex gap-3">
          <button
            type="button"
            className="rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-5 py-2 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
          >
            Start Batch
          </button>
          <button
            type="button"
            className="rounded-md border border-border px-5 py-2 text-sm text-muted hover:border-gold hover:text-gold"
          >
            Pause All
          </button>
        </div>
        <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">Rendering Queue</h2>
        <div className="space-y-3">
          {QUEUE.map((q) => (
            <article
              key={q.id}
              data-testid="render-row"
              className="flex items-center gap-4 rounded-xl border border-border bg-surface p-3"
            >
              <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-md border border-border">
                <Image src={q.image} alt="" fill sizes="120px" className="object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text">{q.title}</span>
                  <span
                    className={
                      "rounded-full px-2 py-0.5 text-xs " +
                      (q.status === "Completed"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : q.status === "In Progress"
                          ? "bg-gold/20 text-gold"
                          : "bg-surface-2 text-muted")
                    }
                  >
                    {q.status}
                  </span>
                </div>
                {q.status !== "Queued" && (
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full bg-gradient-to-r from-gold-deep via-gold to-gold-bright"
                      style={{ width: `${q.progress}%` }}
                    />
                  </div>
                )}
              </div>
              <button
                type="button"
                className="rounded-md border border-border px-3 py-1 text-xs text-muted hover:border-gold hover:text-gold"
              >
                {q.status === "Completed" ? "Preview" : "Cancel"}
              </button>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
