import { GENRE } from "@/lib/genre-mock";

export function ToneSliders() {
  return (
    <section>
      <h2 className="mb-4 text-xs uppercase tracking-wider text-muted">Tone &amp; Atmosphere</h2>
      <div className="space-y-5">
        {GENRE.tones.map((t) => (
          <div key={t.id}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-text">{t.label}</span>
            </div>
            <div className="relative h-2 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full bg-gradient-to-r from-gold-deep via-gold to-gold-bright"
                style={{ width: `${t.value}%` }}
              />
              <div
                className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold bg-bg"
                style={{ left: `${t.value}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-muted">
              <span>{t.leftLabel}</span>
              <span>{t.rightLabel}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
