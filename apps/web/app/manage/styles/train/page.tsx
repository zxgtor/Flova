import { HomeNav } from "@/components/home/HomeNav";

const MODELS = ["Cinematic v1 (default)", "Realistic v3", "Anime v2", "Surreal Art v1"];

const SLIDERS = [
  { id: "strength", label: "Style Strength", value: 75 },
  { id: "abstract", label: "Abstractness", value: 30 },
];

const PROGRESS_STEPS = [
  { label: "Data Processing Complete", done: true },
  { label: "Training Started", done: true },
  { label: "Epoch 10 Completed", done: false },
];

export default function StyleTrainingPage() {
  return (
    <>
      <HomeNav />
      <main className="grid gap-6 p-6 lg:grid-cols-3">
        <section className="rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">Upload Training Data</h2>
          <div className="flex h-44 flex-col items-center justify-center rounded-md border border-dashed border-border bg-surface-2 text-xs text-muted">
            <span>Drag &amp; Drop High-Quality Reference</span>
            <span className="mt-1">Images and Video Clips Here</span>
            <button
              type="button"
              className="mt-3 rounded-md border border-gold px-3 py-1 text-gold hover:bg-gold/10"
            >
              Browse Files
            </button>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                data-testid="training-thumb"
                className="aspect-video rounded-md border border-border bg-surface-2"
              />
            ))}
          </div>
        </section>
        <section className="rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">Training Configuration</h2>
          {SLIDERS.map((s) => (
            <div key={s.id} className="mb-4">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-text">{s.label}</span>
                <span className="text-muted">{s.value}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full bg-gradient-to-r from-gold-deep via-gold to-gold-bright"
                  style={{ width: `${s.value}%` }}
                />
              </div>
            </div>
          ))}
          <h3 className="mt-5 mb-2 text-xs uppercase tracking-wider text-muted">Base Model</h3>
          <ul className="space-y-1 text-sm">
            {MODELS.map((m, i) => (
              <li
                key={m}
                className={
                  "rounded-md border px-3 py-2 " +
                  (i === 0 ? "border-gold bg-gold/10 text-gold" : "border-border text-muted")
                }
              >
                {m}
              </li>
            ))}
          </ul>
          <label className="mt-4 flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" /> Enable Advanced Settings
          </label>
        </section>
        <section className="rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">Training Status</h2>
          <div className="relative mx-auto mb-3 flex h-32 w-32 items-center justify-center rounded-full border-4 border-gold/30">
            <div className="text-2xl font-semibold text-gold">34%</div>
          </div>
          <p className="text-center text-xs text-muted">
            Estimated Time Remaining: 1h 14m 20s
          </p>
          <h3 className="mt-5 mb-2 text-xs uppercase tracking-wider text-muted">
            Intermediate Results
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="aspect-video rounded-md border border-border bg-surface-2"
              />
            ))}
          </div>
          <ul className="mt-5 space-y-1 text-xs">
            {PROGRESS_STEPS.map((s) => (
              <li key={s.label} className={s.done ? "text-text" : "text-muted"}>
                {s.done ? "✓" : "○"} {s.label}
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="mt-5 w-full rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-4 py-2 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
          >
            Begin Training
          </button>
        </section>
      </main>
    </>
  );
}
