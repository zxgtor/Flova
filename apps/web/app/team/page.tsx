import Image from "next/image";
import Link from "next/link";
import { HomeNav } from "@/components/home/HomeNav";

const FOLDERS = ["Marketing Campaigns", "Product Demos", "Social Media Assets"];
const ACTIVE = ["Q4 Launch Video", "Project: Eco-Friendly Future", "Client Testimonial Series"];

const PROJECTS = [
  { id: 1, title: "Q4 Launch Video", status: "Editing", image: "/mockups/showcase-1.png" },
  { id: 2, title: "Project: Eco-Friendly Future", status: "Mastering", image: "/mockups/showcase-2.png" },
  { id: 3, title: "Brand Identity Films", status: "Mastering", image: "/mockups/showcase-3.png" },
  { id: 4, title: "Project: Urban Mobility", status: "Editing", image: "/mockups/showcase-4.png" },
  { id: 5, title: "Project: Global Connection", status: "Editing", image: "/mockups/showcase-5.png" },
];

const ACTIVITY = [
  { user: "Sarah K.", text: "left a comment on Q4 Launch Video", time: "5m ago" },
  { user: "Alex M.", text: "uploaded ‘B-roll_v3.mp4’ to Brand Identity Films", time: "26m ago" },
  { user: "David L.", text: "approved Eco-Friendly Future cut v3", time: "1h ago" },
];

export default function TeamWorkspacePage() {
  return (
    <>
      <HomeNav />
      <div className="flex">
        <aside className="w-60 shrink-0 overflow-y-auto border-r border-border bg-surface p-4">
          <h1 className="mb-4 font-display text-lg">Shared Team Workspace</h1>
          <Link
            href="/team/invite"
            className="mb-5 block rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-3 py-1.5 text-center text-xs font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
          >
            + New Team Project
          </Link>
          <h2 className="mb-2 text-xs uppercase tracking-wider text-muted">Team Folders</h2>
          <ul className="mb-5 space-y-1 text-sm text-muted">
            {FOLDERS.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <h2 className="mb-2 text-xs uppercase tracking-wider text-muted">Active Projects</h2>
          <ul className="space-y-1 text-sm text-muted">
            {ACTIVE.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </aside>
        <main className="flex-1 p-6">
          <div className="mb-6 flex items-center justify-end gap-3 text-xs">
            <span className="text-muted">Live Collaboration</span>
            <span className="rounded-full bg-gold/20 px-3 py-0.5 text-gold">ON</span>
            <Link
              href="/team/invite"
              className="rounded-md border border-gold px-3 py-1 text-gold hover:bg-gold/10"
            >
              + Invite
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {PROJECTS.map((p) => (
              <article
                key={p.id}
                data-testid="team-project"
                className="overflow-hidden rounded-xl border border-border bg-surface"
              >
                <div className="relative aspect-video">
                  <Image src={p.image} alt="" fill sizes="33vw" className="object-cover" />
                </div>
                <div className="p-3">
                  <div className="text-sm text-text">{p.title}</div>
                  <div className="mt-1 text-xs text-gold">{p.status}</div>
                </div>
              </article>
            ))}
          </div>
        </main>
        <aside className="w-72 shrink-0 overflow-y-auto border-l border-border bg-surface p-4">
          <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">Team Activity Feed</h2>
          <ul className="space-y-3" data-testid="activity-feed">
            {ACTIVITY.map((a, i) => (
              <li key={i} className="text-xs">
                <div className="text-text">
                  <span className="text-gold">{a.user}</span> {a.text}
                </div>
                <div className="text-muted">{a.time}</div>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </>
  );
}
