import { FILTERS } from "@/lib/marketplace-mock";

export function Filters() {
  return (
    <aside className="w-64 shrink-0 overflow-y-auto border-r border-border bg-surface p-4">
      <div className="space-y-5">
        {FILTERS.map((g) => (
          <section key={g.id}>
            <h3 className="mb-2 px-1 text-xs uppercase tracking-wider text-muted">{g.label}</h3>
            <ul className="space-y-1 text-sm text-muted">
              {g.options.map((o) => (
                <li key={o} className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="inline-block h-3 w-3 rounded-sm border border-border bg-surface-2"
                  />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </aside>
  );
}
