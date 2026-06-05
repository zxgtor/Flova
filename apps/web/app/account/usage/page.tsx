import { HomeNav } from "@/components/home/HomeNav";

const STATS = [
  { label: "Total Credits Used", value: "8,450", sub: "this month" },
  { label: "Project Render Time", value: "124h 30m", sub: "across 12 projects" },
  { label: "Storage Used", value: "350 GB", sub: "of 500 GB (70%)" },
];

const BREAKDOWN = [
  { label: "Video", value: 45, color: "bg-gold" },
  { label: "Image", value: 25, color: "bg-gold-bright" },
  { label: "Voice", value: 20, color: "bg-gold-deep" },
  { label: "Style Training", value: 10, color: "bg-emerald-500/60" },
];

const LOG = [
  { date: "Nov 15, 2024", task: "4K Video Generation (Project Odyssey)", credits: -650, user: "Alex M." },
  { date: "Nov 14, 2024", task: "Voice Training Model v2", credits: -200, user: "Sarah K." },
  { date: "Nov 13, 2024", task: "Image Synthesis Batch (12)", credits: -120, user: "David L." },
  { date: "Nov 12, 2024", task: "Style Comparison Render", credits: -85, user: "Aliyah R." },
  { date: "Nov 11, 2024", task: "Draft Render (Low Q4)", credits: -45, user: "Sarah K." },
];

export default function UsageReportPage() {
  return (
    <>
      <HomeNav />
      <main className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-2xl">Project Usage &amp; Credit Report</h1>
          <button
            type="button"
            className="rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-4 py-1.5 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
          >
            Top Up Credits
          </button>
        </div>
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          {STATS.map((s) => (
            <div
              key={s.label}
              data-testid="usage-stat"
              className="rounded-xl border border-border bg-surface p-4"
            >
              <div className="font-display text-2xl text-text">{s.value}</div>
              <div className="text-xs uppercase tracking-wider text-muted">{s.label}</div>
              <div className="text-xs text-muted">{s.sub}</div>
            </div>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-border bg-surface p-5">
            <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">
              Credit Consumption Over Time
            </h2>
            <div className="flex h-40 items-end gap-1">
              {[35, 42, 60, 48, 70, 52, 65, 80, 55, 72, 88, 95].map((h, i) => (
                <div key={i} className="flex-1 rounded-t bg-gold/60" style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-muted">
              <span>Jan 15</span>
              <span>Jul 15</span>
              <span>Nov 15</span>
            </div>
          </section>
          <section className="rounded-xl border border-border bg-surface p-5">
            <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">
              Breakdown by Category
            </h2>
            <ul className="space-y-3">
              {BREAKDOWN.map((b) => (
                <li key={b.label} className="text-xs">
                  <div className="mb-0.5 flex items-center justify-between">
                    <span className="text-text">{b.label}</span>
                    <span className="text-muted">{b.value}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <div className={"h-full " + b.color} style={{ width: `${b.value}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
        <section className="mt-6 rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">Activity Log</h2>
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="py-2 text-left">Date</th>
                <th className="py-2 text-left">Task</th>
                <th className="py-2 text-right">Credits</th>
                <th className="py-2 text-left">User</th>
              </tr>
            </thead>
            <tbody>
              {LOG.map((l, i) => (
                <tr
                  key={i}
                  data-testid="log-row"
                  className="border-t border-border text-text"
                >
                  <td className="py-2 text-muted">{l.date}</td>
                  <td className="py-2">{l.task}</td>
                  <td className="py-2 text-right text-gold">{l.credits}</td>
                  <td className="py-2 text-muted">{l.user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </>
  );
}
