export function PortraitStage() {
  return (
    <section className="flex flex-1 flex-col items-center gap-6 p-8">
      <div
        className="relative flex h-[60vh] w-full max-w-md items-center justify-center rounded-2xl border border-gold/30 bg-gradient-to-b from-surface-2 via-surface to-bg"
        aria-label="Portrait preview"
      >
        <span className="text-xs uppercase tracking-wider text-muted">Portrait Preview</span>
      </div>
      <form className="w-full max-w-md rounded-xl border border-border bg-surface p-4">
        <label className="mb-2 block text-xs uppercase tracking-wider text-muted">
          Character Actions
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            name="action"
            placeholder="e.g. walking confidently down a city street"
            className="flex-1 rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-muted focus:border-gold focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-4 py-2 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
          >
            Generate Action
          </button>
        </div>
      </form>
    </section>
  );
}
