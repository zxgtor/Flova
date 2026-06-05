export function AiCoWriter() {
  return (
    <div className="mt-4 rounded-lg border border-border bg-surface-2/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-gold">AI co-writer</span>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-md border border-border px-3 py-1 text-xs text-muted hover:border-gold hover:text-gold"
          >
            Expand
          </button>
          <button
            type="button"
            className="rounded-md border border-border px-3 py-1 text-xs text-muted hover:border-gold hover:text-gold"
          >
            Change Style
          </button>
        </div>
      </div>
      <p className="text-xs leading-relaxed text-muted">
        Pick a line and click <strong className="text-text">Expand</strong> for richer prose, or
        switch tone with <strong className="text-text">Change Style</strong>.
      </p>
    </div>
  );
}
