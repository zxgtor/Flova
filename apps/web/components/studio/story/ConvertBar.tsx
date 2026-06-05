import { STORY } from "@/lib/story-mock";

export function ConvertBar() {
  const pct = STORY.readiness;
  return (
    <footer className="flex items-center gap-6 border-t border-border bg-surface px-6 py-3">
      <button
        type="button"
        className="rounded-md border border-gold px-4 py-1.5 text-sm text-gold hover:bg-gold hover:text-bg"
      >
        Convert to Video
      </button>
      <div className="flex flex-1 items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full bg-gradient-to-r from-gold-deep via-gold to-gold-bright"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs text-muted">{pct}% Ready</span>
      </div>
      <button
        type="button"
        className="rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-4 py-1.5 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
      >
        Export to Timeline
      </button>
    </footer>
  );
}
