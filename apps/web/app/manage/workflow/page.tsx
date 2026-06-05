import { HomeNav } from "@/components/home/HomeNav";

const STEPS = [
  { id: "concept", label: "Concept & Script", status: "Edit", icon: "📝" },
  { id: "assets", label: "Asset Creation", status: "In Progress", icon: "🎨" },
  { id: "storyboard", label: "Storyboard & Scene Layout", status: "In Progress", icon: "🗂️" },
  { id: "editing", label: "Editing & VFX", status: "In Progress", icon: "🎬" },
  { id: "export", label: "Final Export", status: "0 ready", icon: "📤" },
];

const ACTIVITY = [
  "Storyboard updated for Alex at 10:42 AM — Scene 4 layout completed.",
  "New character models imported to Asset Creation by @raj.designs.",
  "Script draft v3 submitted to Concept & Script by Mark at 9:12 AM.",
  "Environment assets for Level 4 finalized to Asset Creation at yesterday 4:18 PM.",
  "Editing timeline for Sequence 2 added to Editing & VFX at yesterday 11:50 AM.",
];

export default function WorkflowPage() {
  return (
    <>
      <HomeNav />
      <main className="p-6">
        <h1 className="mb-6 font-display text-2xl">Video Generation Workflow Manager</h1>
        <div className="grid gap-4 md:grid-cols-5">
          {STEPS.map((s) => (
            <div
              key={s.id}
              data-testid="workflow-step"
              className="rounded-xl border border-border bg-surface p-4 text-center"
            >
              <div aria-hidden className="text-3xl">{s.icon}</div>
              <div className="mt-2 text-sm font-medium text-text">{s.label}</div>
              <div className="mt-2 text-xs text-gold">{s.status}</div>
            </div>
          ))}
        </div>
        <section className="mt-8">
          <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">Recent Activity</h2>
          <ul className="space-y-2 text-sm text-text">
            {ACTIVITY.map((a, i) => (
              <li
                key={i}
                className="rounded-md border border-border bg-surface px-4 py-2"
              >
                {a}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
