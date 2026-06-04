export function PromptBar() {
  return (
    <form
      action="/studio"
      method="GET"
      className="mx-auto flex w-full max-w-3xl items-center gap-2 rounded-2xl border border-border bg-surface-2/70 px-4 py-3 backdrop-blur"
    >
      <input
        type="text"
        name="prompt"
        autoComplete="off"
        placeholder="What would you like to create today? Ask Flova…"
        className="flex-1 bg-transparent text-base text-text placeholder:text-muted focus:outline-none"
      />
      <button
        type="submit"
        aria-label="Submit prompt"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-gold-bright via-gold to-gold-deep text-bg transition-opacity hover:opacity-90"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m0 0l-6-6m6 6l-6 6" />
        </svg>
      </button>
    </form>
  );
}
