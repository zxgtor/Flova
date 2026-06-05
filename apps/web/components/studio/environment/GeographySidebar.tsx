import { ENVIRONMENT } from "@/lib/environment-mock";

export function GeographySidebar() {
  return (
    <aside className="w-72 shrink-0 overflow-y-auto border-r border-border bg-surface p-4">
      <div className="space-y-5">
        {ENVIRONMENT.groups.map((g) => (
          <section key={g.id}>
            <h3 className="mb-2 px-1 text-xs uppercase tracking-wider text-muted">{g.label}</h3>
            <div className="flex flex-wrap gap-2">
              {g.items.map((it) => (
                <span
                  key={it.id}
                  className={
                    "rounded-full border px-3 py-1 text-xs " +
                    (it.active
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-border text-muted")
                  }
                >
                  {it.label}
                </span>
              ))}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}
