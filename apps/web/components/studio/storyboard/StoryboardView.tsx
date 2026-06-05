import { STORYBOARD } from "@/lib/storyboard-mock";
import { SceneCard } from "@/components/studio/storyboard/SceneCard";

export function StoryboardView() {
  return (
    <section>
      <h2 className="mb-4 text-xs uppercase tracking-wider text-muted">Storyboard View</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {STORYBOARD.scenes.map((s) => (
          <SceneCard key={s.id} scene={s} />
        ))}
      </div>
    </section>
  );
}
