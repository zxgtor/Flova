import { GENRE } from "@/lib/genre-mock";

export function GenreGrid() {
  return (
    <section>
      <h2 className="mb-4 text-xs uppercase tracking-wider text-muted">Genre</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {GENRE.genres.map((g) => (
          <div
            key={g.id}
            data-testid="genre-tile"
            className={
              "flex flex-col items-center gap-2 rounded-xl border p-4 text-center text-sm " +
              (g.active ? "border-gold bg-gold/10 text-gold" : "border-border bg-surface text-text")
            }
          >
            <span aria-hidden className="text-2xl">{g.icon}</span>
            <span>{g.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
