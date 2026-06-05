import { VOICE } from "@/lib/voice-mock";

export function ScriptStage() {
  return (
    <section className="flex flex-1 flex-col gap-5 overflow-y-auto p-6">
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="mb-2 text-xs uppercase tracking-wider text-muted">Script & Preview</div>
        <textarea
          name="script"
          rows={4}
          placeholder={VOICE.scriptPlaceholder}
          className="w-full resize-none rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-muted focus:border-gold focus:outline-none"
        />
      </div>
      <div className="flex justify-center">
        <button
          type="button"
          className="rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-8 py-3 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
        >
          Generate Preview
        </button>
      </div>
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="mb-2 text-xs uppercase tracking-wider text-muted">Waveform</div>
        <div
          aria-label="Waveform preview"
          className="flex h-24 items-end gap-[2px] overflow-hidden rounded-md border border-border bg-surface-2 p-2"
        >
          {Array.from({ length: 64 }, (_, i) => i).map((i) => {
            const h = 20 + ((i * 13) % 60);
            return (
              <span
                key={i}
                className="block w-1 rounded-sm bg-gradient-to-t from-gold-deep via-gold to-gold-bright"
                style={{ height: `${h}%` }}
              />
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-3 text-xs text-muted">
          <button
            type="button"
            className="rounded-full border border-border px-3 py-1 hover:border-gold hover:text-gold"
          >
            ▶ Play
          </button>
          <span>00:00 / 00:08</span>
        </div>
      </div>
    </section>
  );
}
