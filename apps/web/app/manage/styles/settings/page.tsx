import { HomeNav } from "@/components/home/HomeNav";

const CAMERA = [
  { id: "pan", label: "Pan", value: 45 },
  { id: "tilt", label: "Tilt", value: 30 },
  { id: "zoom", label: "Zoom", value: 50 },
];

const MOOD_TABS = ["Cinematic", "Golden Hour", "Moody"];
const QUALITY = [
  { id: "hi-res", label: "High-Resolution Upscale", on: true },
  { id: "char", label: "Constant Character", on: false },
];

export default function AdvancedSettingsPage() {
  return (
    <>
      <HomeNav />
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="mb-6 font-display text-xl">Advanced Controls</h1>
        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-xl border border-border bg-surface p-5">
            <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">Camera Movement</h2>
            {CAMERA.map((c) => (
              <div key={c.id} className="mb-4">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-text">{c.label}</span>
                  <span className="text-muted">{c.value}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full bg-gradient-to-r from-gold-deep via-gold to-gold-bright"
                    style={{ width: `${c.value}%` }}
                  />
                </div>
              </div>
            ))}
            <h3 className="mt-6 mb-2 text-xs uppercase tracking-wider text-muted">
              Lighting &amp; Mood
            </h3>
            <div className="flex gap-2">
              {MOOD_TABS.map((m, i) => (
                <span
                  key={m}
                  className={
                    "rounded-full border px-3 py-1 text-xs " +
                    (i === 0 ? "border-gold bg-gold/10 text-gold" : "border-border text-muted")
                  }
                >
                  {m}
                </span>
              ))}
            </div>
          </section>
          <section className="rounded-xl border border-border bg-surface p-5">
            <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">Enhancement Options</h2>
            <ul className="space-y-2 text-sm">
              {QUALITY.map((q) => (
                <li key={q.id} className="flex items-center justify-between">
                  <span className="text-text">{q.label}</span>
                  <span
                    className={
                      "rounded-full px-3 py-0.5 text-xs " +
                      (q.on ? "bg-gold/20 text-gold" : "bg-surface-2 text-muted")
                    }
                  >
                    {q.on ? "ON" : "OFF"}
                  </span>
                </li>
              ))}
            </ul>
            <h3 className="mt-6 mb-2 text-xs uppercase tracking-wider text-muted">Negative Prompt</h3>
            <textarea
              rows={3}
              placeholder="Avoid blurry faces, distorted hands, overexposed backgrounds, watermarks…"
              className="w-full resize-none rounded-md border border-border bg-surface-2 px-3 py-2 text-xs text-text placeholder:text-muted focus:border-gold focus:outline-none"
            />
          </section>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            className="rounded-md border border-border px-4 py-2 text-sm text-muted hover:border-gold hover:text-gold"
          >
            Reset
          </button>
          <button
            type="button"
            className="rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-4 py-2 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
          >
            Apply Changes
          </button>
        </div>
      </main>
    </>
  );
}
