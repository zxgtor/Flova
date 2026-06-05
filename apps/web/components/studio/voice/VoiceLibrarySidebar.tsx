import { VOICE } from "@/lib/voice-mock";

export function VoiceLibrarySidebar() {
  return (
    <aside className="w-72 shrink-0 overflow-y-auto border-l border-border bg-surface p-4">
      <h2 className="mb-3 px-1 text-xs uppercase tracking-wider text-muted">Voice Library</h2>
      <ul className="space-y-2">
        {VOICE.library.map((v) => (
          <li
            key={v.id}
            data-testid="voice-preset"
            className="flex items-center justify-between rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text hover:border-gold"
          >
            <span>{v.label}</span>
            <button
              type="button"
              className="text-xs text-muted hover:text-gold"
              aria-label={`Play ${v.label}`}
            >
              ▶
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-6 rounded-xl border border-border bg-surface-2 p-4 text-center">
        <h3 className="mb-2 text-xs uppercase tracking-wider text-gold">Clone a Voice</h3>
        <div className="flex h-24 flex-col items-center justify-center rounded-md border border-dashed border-border text-xs text-muted">
          <span>Drag &amp; Drop your audio file</span>
          <span className="mt-1">or click to browse</span>
        </div>
      </div>
    </aside>
  );
}
