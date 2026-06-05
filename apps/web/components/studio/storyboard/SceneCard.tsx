import Image from "next/image";
import type { BoardScene } from "@/lib/storyboard-mock";

export function SceneCard({ scene }: { scene: BoardScene }) {
  return (
    <article
      data-testid="board-scene"
      className={
        "flex flex-col rounded-xl border bg-surface p-3 " +
        (scene.active ? "border-gold" : "border-border")
      }
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted">Scene {scene.number}</span>
      </div>
      <div className="relative aspect-video w-full overflow-hidden rounded-md border border-border">
        <Image src={scene.image} alt="" fill sizes="33vw" className="object-cover" />
      </div>
      <div className="mt-3 space-y-3 text-xs">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted">Visual Description</div>
          <p className="text-text">{scene.description}</p>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted">Dialogue</div>
          <p className="text-text">{scene.dialogue}</p>
        </div>
        <div className="flex flex-wrap gap-1">
          {scene.tags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
