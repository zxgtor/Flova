import Image from "next/image";
import { STORY } from "@/lib/story-mock";

export function ScenePreviewsSidebar() {
  const scenes = STORY.acts.flatMap((a) => a.scenes).filter((s) => s.previewImage);
  return (
    <aside className="w-64 shrink-0 overflow-y-auto border-l border-border bg-surface p-4">
      <h2 className="mb-4 px-1 text-xs uppercase tracking-wider text-muted">Scene Previews</h2>
      <div className="space-y-3">
        {scenes.map((s) => (
          <div
            key={s.id}
            data-testid="scene-preview"
            className="overflow-hidden rounded-md border border-border bg-surface-2"
          >
            <div className="relative aspect-video">
              <Image
                src={s.previewImage as string}
                alt=""
                fill
                sizes="256px"
                className="object-cover"
              />
            </div>
            <div className="px-2 py-1.5 text-xs text-muted">{s.title}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}
