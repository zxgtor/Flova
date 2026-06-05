import { STORY } from "@/lib/story-mock";
import { AiCoWriter } from "@/components/studio/story/AiCoWriter";

export function SceneEditor() {
  const active = STORY.acts.flatMap((a) => a.scenes).find((s) => s.active);
  if (!active) return null;
  return (
    <section className="flex-1 overflow-y-auto p-8">
      <h2 className="font-display text-2xl font-semibold">{active.title}</h2>
      <div className="mt-5 rounded-lg border border-border bg-surface p-5">
        <div className="mb-2 text-xs uppercase tracking-wider text-muted">Manuscript</div>
        <p className="whitespace-pre-line text-sm leading-relaxed text-text">{active.body}</p>
      </div>
      <AiCoWriter />
    </section>
  );
}
