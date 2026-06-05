import { CAMERA } from "@/lib/camera-mock";

export function CustomPresets() {
  return (
    <section>
      <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">Custom</h2>
      <button
        type="button"
        className="mb-3 w-full rounded-md border border-dashed border-gold/50 py-2 text-sm text-gold hover:bg-gold/10"
      >
        + Save New Custom Preset
      </button>
      <ul className="space-y-2">
        {CAMERA.custom.map((c) => (
          <li
            key={c.id}
            data-testid="custom-preset"
            className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2 text-sm"
          >
            <span className="text-text">{c.label}</span>
            <button
              type="button"
              className="text-xs text-muted hover:text-gold"
              aria-label={`Edit ${c.label}`}
            >
              Edit
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
