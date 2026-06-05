import { CHARACTER } from "@/lib/character-mock";

export function AttributesSidebar() {
  return (
    <aside className="w-72 shrink-0 overflow-y-auto border-r border-border bg-surface p-4">
      <h2 className="mb-4 px-2 text-xs uppercase tracking-wider text-muted">
        Character Attributes
      </h2>
      <div className="space-y-5">
        {CHARACTER.groups.map((g) => (
          <section key={g.id}>
            <h3 className="mb-2 text-sm font-medium text-text">{g.label}</h3>
            <dl className="space-y-2">
              {g.fields.map((f) => (
                <div key={f.label} className="rounded-md border border-border bg-surface-2 p-2">
                  <dt className="text-[10px] uppercase tracking-wider text-muted">{f.label}</dt>
                  <dd className="text-sm text-text">{f.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
        <section>
          <h3 className="mb-2 text-sm font-medium text-text">Face Lock</h3>
          <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-border bg-surface-2 text-xs text-muted">
            Upload Reference Image
          </div>
        </section>
      </div>
    </aside>
  );
}
