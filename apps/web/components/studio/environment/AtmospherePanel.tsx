import { ENVIRONMENT } from "@/lib/environment-mock";

export function AtmospherePanel() {
  return (
    <aside className="w-72 shrink-0 overflow-y-auto border-l border-border bg-surface p-4">
      <h2 className="mb-4 px-1 text-xs uppercase tracking-wider text-muted">Atmosphere</h2>
      <div className="space-y-4">
        {ENVIRONMENT.atmosphere.map((c) => (
          <div key={c.id}>
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
      </div>
    </aside>
  );
}
