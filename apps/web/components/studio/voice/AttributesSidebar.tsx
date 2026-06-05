import { VOICE } from "@/lib/voice-mock";

export function AttributesSidebar() {
  return (
    <aside className="w-72 shrink-0 overflow-y-auto border-r border-border bg-surface p-4">
      <h2 className="mb-4 px-1 text-xs uppercase tracking-wider text-muted">Voice Attributes</h2>
      <div className="space-y-4">
        {VOICE.attributes.map((s) => (
          <div key={s.id}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-text">{s.label}</span>
              <span className="text-muted">{s.value}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full bg-gradient-to-r from-gold-deep via-gold to-gold-bright"
                style={{ width: `${s.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <h3 className="mb-2 mt-6 px-1 text-xs uppercase tracking-wider text-muted">Emotion</h3>
      <div className="flex flex-wrap gap-2">
        {VOICE.emotions.map((e) => (
          <span
            key={e.id}
            className={
              "rounded-full border px-3 py-1 text-xs " +
              (e.active ? "border-gold bg-gold/10 text-gold" : "border-border text-muted")
            }
          >
            {e.label}
          </span>
        ))}
      </div>
    </aside>
  );
}
