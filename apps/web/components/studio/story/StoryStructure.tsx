import { STORY } from "@/lib/story-mock";

export function StoryStructure() {
  return (
    <aside className="w-72 shrink-0 overflow-y-auto border-r border-border bg-surface p-4">
      <h2 className="mb-4 px-2 text-xs uppercase tracking-wider text-muted">Story Structure</h2>
      <nav className="space-y-1">
        {STORY.acts.map((act) => (
          <div key={act.id}>
            <div className="rounded-md px-2 py-1.5 text-sm font-medium text-text">{act.title}</div>
            <ul className="ml-3 mt-1 space-y-0.5 border-l border-border pl-3">
              {act.scenes.map((scene) => (
                <li key={scene.id}>
                  <div
                    data-testid={scene.active ? "active-scene" : undefined}
                    className={
                      "rounded-md px-2 py-1 text-sm " +
                      (scene.active ? "bg-surface-2 text-gold" : "text-muted hover:text-text")
                    }
                  >
                    {scene.title}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
