# Group C0 + C1 — `/studio` Framework & Story Studio

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Steps use `- [ ]`.

**Goal:** Turn `/studio` from a placeholder into the studio launcher (reads `?prompt=` / `?template=`, shows 7 studio cards), add 6 placeholder sub-routes for the other studios, and build a fully-styled mockup of `/studio/story` (AI Story Creation Studio).

**Architecture:** Pure frontend, no state, no backend. `/studio` is a server component that reads `searchParams` to surface the prompt/template context. Studios registry in `lib/studios.ts`. Each studio gets its own folder under `app/studio/<slug>/`. Story studio is composed from small isolated components under `components/studio/story/`. All copy is hardcoded mock data.

**Tech Stack:** Inherited.

**Out of scope:** real editing, real AI co-writer, persistence, share/collab, the other 6 studios' real UIs (placeholders only).

---

## Design Decisions

| Decision | Choice |
|---|---|
| Studio routes | `app/studio/<slug>/page.tsx` (per-folder) — easier to grow each studio independently |
| Studios registry | `lib/studios.ts` — one source of truth for slug / label / blurb / icon / `available` flag |
| `/studio` query params | Server component reads `searchParams.prompt` and `searchParams.template`; surfaces in a "Starting from" banner |
| Studio nav | New `StudioNav` (different from HomeNav) — shows the studio title left, simple page nav right; reused by all studio pages |
| Studio cards on `/studio` | Linked to `/studio/<slug>` if `available`; otherwise rendered disabled with "Coming soon" |
| Story studio components | All static, isolated, individually testable: `StoryStructure`, `SceneEditor`, `AiCoWriter`, `ScenePreviewsSidebar`, `ConvertBar` |
| Story studio data | Hardcoded in `lib/story-mock.ts` (acts/scenes/text), thumbnails reuse existing design PNGs |
| Tests | One Vitest per non-trivial component; per-page composition test |

---

## File Structure

```
apps/web/
├─ app/studio/
│  ├─ page.tsx                         # MODIFY — launcher (reads searchParams)
│  ├─ story/page.tsx                   # NEW — full Story studio composition
│  ├─ character/page.tsx               # NEW — placeholder
│  ├─ environment/page.tsx             # NEW — placeholder
│  ├─ voice/page.tsx                   # NEW — placeholder
│  ├─ genre/page.tsx                   # NEW — placeholder
│  ├─ storyboard/page.tsx              # NEW — placeholder
│  └─ camera/page.tsx                  # NEW — placeholder
├─ components/studio/
│  ├─ StudioNav.tsx                    # NEW — shared studio top bar
│  ├─ StudioSelector.tsx               # NEW — grid of 7 studio cards
│  ├─ StartingFromBanner.tsx           # NEW — shows prompt/template context
│  └─ story/                           # NEW
│     ├─ StoryStructure.tsx            #   collapsible Act/Scene tree
│     ├─ SceneEditor.tsx               #   scene text + AI co-writer panel
│     ├─ AiCoWriter.tsx                #   "AI co-writer" subpanel inside SceneEditor
│     ├─ ScenePreviewsSidebar.tsx
│     └─ ConvertBar.tsx                #   progress + Convert/Export buttons
├─ lib/studios.ts                       # NEW — studios registry
├─ lib/story-mock.ts                    # NEW — Story studio mock data
```

`StudioNav` does NOT replace `HomeNav` — they live side by side. `/home` keeps `HomeNav`, studio pages use `StudioNav` (different IA inside a studio).

---

## Task 1: Studios registry

**Files:**
- Create: `apps/web/lib/studios.ts`
- Test: `apps/web/test/studios.test.ts`

- [ ] **Step 1: Failing test**

```ts
import { describe, it, expect } from "vitest";
import { STUDIOS, getStudio } from "@/lib/studios";

describe("studios registry", () => {
  it("lists all seven studios with unique slugs", () => {
    const slugs = STUDIOS.map((s) => s.slug);
    expect(slugs).toHaveLength(7);
    expect(new Set(slugs).size).toBe(7);
  });

  it("marks story as available and others as coming-soon", () => {
    const story = STUDIOS.find((s) => s.slug === "story");
    expect(story?.available).toBe(true);
    expect(STUDIOS.filter((s) => !s.available)).toHaveLength(6);
  });

  it("getStudio returns matching studio or undefined", () => {
    expect(getStudio("story")?.label).toBe("Story Creation");
    expect(getStudio("nope")).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run failing**

`cd D:/Apps/Flova/apps/web && npx vitest run test/studios.test.ts`
Expected FAIL (module missing).

- [ ] **Step 3: Implementation**

```ts
export type Studio = {
  slug: string;
  label: string;
  blurb: string;
  icon: string; // emoji for now; can swap to SVG later
  available: boolean;
};

export const STUDIOS: Studio[] = [
  { slug: "story",      label: "Story Creation",   blurb: "Plot scenes and write screenplays with an AI co-writer.", icon: "📖", available: true },
  { slug: "character",  label: "Character Design", blurb: "Build consistent, reusable AI characters.",                icon: "🎭", available: false },
  { slug: "environment",label: "Environment",      blurb: "Generate locations and set pieces.",                       icon: "🏞️", available: false },
  { slug: "voice",      label: "Voice Forge",      blurb: "Craft, clone, and tune expressive voices.",                icon: "🎙️", available: false },
  { slug: "genre",      label: "Genre & Tone",     blurb: "Pick the mood, era, and visual genre.",                    icon: "🎚️", available: false },
  { slug: "storyboard", label: "Storyboard",       blurb: "Plan shots visually before generation.",                   icon: "🗂️", available: false },
  { slug: "camera",     label: "Camera & Light",   blurb: "Preset cinematography and lighting rigs.",                 icon: "🎥", available: false },
];

export function getStudio(slug: string): Studio | undefined {
  return STUDIOS.find((s) => s.slug === slug);
}
```

- [ ] **Step 4: Run passing**

`cd D:/Apps/Flova/apps/web && npx vitest run test/studios.test.ts` → PASS.

- [ ] **Step 5: Commit**

```bash
cd D:/Apps/Flova
git add apps/web/lib/studios.ts apps/web/test/studios.test.ts
git commit -m "feat(web): add studios registry"
```

---

## Task 2: `StudioNav` shared top bar

**Files:**
- Create: `apps/web/components/studio/StudioNav.tsx`
- Test: `apps/web/test/studio-nav.test.tsx`

- [ ] **Step 1: Failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StudioNav } from "@/components/studio/StudioNav";

describe("StudioNav", () => {
  it("renders the studio title and back link to /home", () => {
    render(<StudioNav title="AI Story Creation Studio" />);
    expect(screen.getByRole("heading", { name: /ai story creation studio/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /home/i })).toHaveAttribute("href", "/home");
  });

  it("renders Projects / Collaboration / Settings links", () => {
    render(<StudioNav title="x" />);
    expect(screen.getByRole("link", { name: /projects/i })).toHaveAttribute("href", "/manage/projects");
    expect(screen.getByRole("link", { name: /collaboration/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /settings/i })).toHaveAttribute("href", "/account/settings");
  });
});
```

- [ ] **Step 2: Run failing**

`npx vitest run test/studio-nav.test.tsx` → FAIL.

- [ ] **Step 3: Implementation**

```tsx
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

type Props = { title: string };

export function StudioNav({ title }: Props) {
  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-3">
      <div className="flex items-center gap-4">
        <Link href="/home" aria-label="Home" className="opacity-80 hover:opacity-100">
          <Logo wordmark={false} />
        </Link>
        <h1 className="font-display text-base font-medium text-text">{title}</h1>
      </div>
      <nav className="flex items-center gap-6 text-sm text-muted">
        <Link href="/manage/projects" className="hover:text-text">Projects</Link>
        <Link href="/community" className="hover:text-text">Collaboration</Link>
        <Link href="/account/settings" className="hover:text-text">Settings</Link>
      </nav>
    </header>
  );
}
```

- [ ] **Step 4: Run passing**

`npx vitest run test/studio-nav.test.tsx` → PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/studio/StudioNav.tsx apps/web/test/studio-nav.test.tsx
git commit -m "feat(web): add StudioNav shared top bar"
```

---

## Task 3: `StartingFromBanner` (prompt/template context)

**Files:**
- Create: `apps/web/components/studio/StartingFromBanner.tsx`
- Test: `apps/web/test/starting-from-banner.test.tsx`

- [ ] **Step 1: Failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StartingFromBanner } from "@/components/studio/StartingFromBanner";

describe("StartingFromBanner", () => {
  it("renders nothing when no prompt and no template", () => {
    const { container } = render(<StartingFromBanner />);
    expect(container.firstChild).toBeNull();
  });

  it("shows the prompt when given", () => {
    render(<StartingFromBanner prompt="a cat in space" />);
    expect(screen.getByText(/a cat in space/i)).toBeInTheDocument();
  });

  it("shows the template label when given", () => {
    render(<StartingFromBanner template="script_to_video" />);
    expect(screen.getByText(/script_to_video/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run failing → FAIL.**

- [ ] **Step 3: Implementation**

```tsx
type Props = { prompt?: string; template?: string };

export function StartingFromBanner({ prompt, template }: Props) {
  if (!prompt && !template) return null;
  return (
    <div className="mx-auto mt-8 max-w-3xl rounded-xl border border-gold/40 bg-surface-2/60 px-5 py-4 text-sm">
      <span className="mr-2 text-gold">Starting from:</span>
      {prompt && <span className="text-text">"{prompt}"</span>}
      {!prompt && template && <code className="text-text">{template}</code>}
    </div>
  );
}
```

- [ ] **Step 4: Run passing → PASS.**

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/studio/StartingFromBanner.tsx apps/web/test/starting-from-banner.test.tsx
git commit -m "feat(web): add StartingFromBanner"
```

---

## Task 4: `StudioSelector` (grid of 7 cards)

**Files:**
- Create: `apps/web/components/studio/StudioSelector.tsx`
- Test: `apps/web/test/studio-selector.test.tsx`

- [ ] **Step 1: Failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StudioSelector } from "@/components/studio/StudioSelector";

describe("StudioSelector", () => {
  it("renders all 7 studios with the Story card linking to /studio/story", () => {
    render(<StudioSelector />);
    expect(screen.getAllByTestId("studio-card")).toHaveLength(7);
    expect(screen.getByRole("link", { name: /story creation/i })).toHaveAttribute(
      "href",
      "/studio/story",
    );
  });

  it("renders unavailable studios as non-links labelled Coming soon", () => {
    render(<StudioSelector />);
    expect(screen.getAllByText(/coming soon/i)).toHaveLength(6);
    expect(screen.queryByRole("link", { name: /character design/i })).toBeNull();
  });
});
```

- [ ] **Step 2: Run failing → FAIL.**

- [ ] **Step 3: Implementation**

```tsx
import Link from "next/link";
import { STUDIOS, type Studio } from "@/lib/studios";

function Card({ studio }: { studio: Studio }) {
  const body = (
    <div
      data-testid="studio-card"
      className="flex h-full flex-col rounded-xl border border-border bg-surface p-5 transition-colors group-hover:border-gold"
    >
      <span aria-hidden className="text-3xl">{studio.icon}</span>
      <h3 className="mt-4 font-display text-base font-semibold">{studio.label}</h3>
      <p className="mt-1 text-sm text-muted">{studio.blurb}</p>
      {!studio.available && (
        <span className="mt-3 self-start rounded-full border border-border px-2 py-0.5 text-xs text-muted">
          Coming soon
        </span>
      )}
    </div>
  );
  return studio.available ? (
    <Link href={`/studio/${studio.slug}`} className="group block">
      {body}
    </Link>
  ) : (
    <div className="group block opacity-70">{body}</div>
  );
}

export function StudioSelector() {
  return (
    <section className="mx-auto grid max-w-5xl gap-4 px-8 py-12 sm:grid-cols-2 lg:grid-cols-3">
      {STUDIOS.map((s) => (
        <Card key={s.slug} studio={s} />
      ))}
    </section>
  );
}
```

- [ ] **Step 4: Run passing → PASS.**

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/studio/StudioSelector.tsx apps/web/test/studio-selector.test.tsx
git commit -m "feat(web): add StudioSelector grid"
```

---

## Task 5: Rewrite `/studio` page (reads searchParams + uses HomeNav-style nav)

**Files:**
- Modify: `apps/web/app/studio/page.tsx`
- Test: `apps/web/test/studio-page.test.tsx`

- [ ] **Step 1: Failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StudioPage from "@/app/studio/page";

describe("StudioPage", () => {
  it("renders the studio selector when no params", async () => {
    const ui = await StudioPage({ searchParams: Promise.resolve({}) });
    render(ui);
    expect(screen.getAllByTestId("studio-card")).toHaveLength(7);
  });

  it("renders the Starting From banner when prompt is given", async () => {
    const ui = await StudioPage({ searchParams: Promise.resolve({ prompt: "hello" }) });
    render(ui);
    expect(screen.getByText(/hello/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run failing → FAIL (current placeholder doesn't accept props).**

- [ ] **Step 3: Implementation**

```tsx
import { HomeNav } from "@/components/home/HomeNav";
import { StartingFromBanner } from "@/components/studio/StartingFromBanner";
import { StudioSelector } from "@/components/studio/StudioSelector";

type Props = {
  searchParams: Promise<{ prompt?: string; template?: string }>;
};

export default async function StudioPage({ searchParams }: Props) {
  const { prompt, template } = await searchParams;
  return (
    <>
      <HomeNav />
      <main>
        <section className="px-8 pt-12 text-center">
          <h1 className="font-display text-3xl font-semibold">
            Pick a <span className="text-gold-gradient">studio</span> to start
          </h1>
          <p className="mt-3 text-muted">Each studio shapes a different piece of your video.</p>
          <StartingFromBanner prompt={prompt} template={template} />
        </section>
        <StudioSelector />
      </main>
    </>
  );
}
```

- [ ] **Step 4: Run passing → PASS.**

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/studio/page.tsx apps/web/test/studio-page.test.tsx
git commit -m "feat(web): /studio launcher with prompt/template context"
```

---

## Task 6: 6 placeholder sub-route pages

**Files:** Create one tiny page per slug under `app/studio/<slug>/page.tsx` for **character, environment, voice, genre, storyboard, camera**.

- [ ] **Step 1: Write all six placeholders (same shape)**

For each `<slug>` in `[character, environment, voice, genre, storyboard, camera]`:

```tsx
// apps/web/app/studio/<slug>/page.tsx
import { StudioNav } from "@/components/studio/StudioNav";
import { getStudio } from "@/lib/studios";

export default function Page() {
  const studio = getStudio("<slug>")!;
  return (
    <>
      <StudioNav title={studio.label} />
      <main className="mx-auto max-w-3xl p-12 text-center">
        <h2 className="font-display text-2xl">{studio.label}</h2>
        <p className="mt-2 text-muted">{studio.blurb}</p>
        <p className="mt-6 text-sm text-muted">This studio is coming soon.</p>
      </main>
    </>
  );
}
```

- [ ] **Step 2: Smoke test build**

`cd D:/Apps/Flova/apps/web && npm run typecheck` → exit 0.

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/studio/character apps/web/app/studio/environment apps/web/app/studio/voice apps/web/app/studio/genre apps/web/app/studio/storyboard apps/web/app/studio/camera
git commit -m "feat(web): placeholder sub-routes for non-Story studios"
```

---

## Task 7: Story mock data

**Files:**
- Create: `apps/web/lib/story-mock.ts`
- Test: `apps/web/test/story-mock.test.ts`

- [ ] **Step 1: Failing test**

```ts
import { describe, it, expect } from "vitest";
import { STORY } from "@/lib/story-mock";

describe("story mock", () => {
  it("contains 3 acts with at least one scene each", () => {
    expect(STORY.acts).toHaveLength(3);
    for (const act of STORY.acts) expect(act.scenes.length).toBeGreaterThan(0);
  });
  it("flags the first scene as active", () => {
    const first = STORY.acts[0].scenes[0];
    expect(first.active).toBe(true);
  });
});
```

- [ ] **Step 2: Run failing → FAIL.**

- [ ] **Step 3: Implementation**

```ts
export type Scene = {
  id: string;
  title: string;
  body: string;
  active?: boolean;
  previewImage?: string;
};
export type Act = { id: string; title: string; scenes: Scene[] };
export type Story = { title: string; readiness: number; acts: Act[] };

export const STORY: Story = {
  title: "Untitled Story",
  readiness: 85,
  acts: [
    {
      id: "act-1",
      title: "Act 1: The Setup",
      scenes: [
        {
          id: "1-1",
          title: "Scene 1: The Call to Adventure",
          body:
            "ELARA, hungrily stumbles atomast a worn slab of old parchment. ELARA, a young heroine, stumbles upon a glowing tome.",
          active: true,
          previewImage: "/mockups/showcase-1.png",
        },
        { id: "1-2", title: "Scene 2: Crossing the Threshold", body: "", previewImage: "/mockups/showcase-2.png" },
        { id: "1-3", title: "Scene 3: The Confrontation", body: "", previewImage: "/mockups/showcase-3.png" },
      ],
    },
    { id: "act-2", title: "Act 2: Confrontation", scenes: [{ id: "2-1", title: "Scene 1", body: "" }] },
    { id: "act-3", title: "Act 3: Resolution", scenes: [{ id: "3-1", title: "Scene 1", body: "" }] },
  ],
};
```

- [ ] **Step 4: Run passing → PASS.**

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/story-mock.ts apps/web/test/story-mock.test.ts
git commit -m "feat(web): add story mock data"
```

---

## Task 8: `StoryStructure` sidebar

**Files:**
- Create: `apps/web/components/studio/story/StoryStructure.tsx`
- Test: `apps/web/test/story-structure.test.tsx`

- [ ] **Step 1: Failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StoryStructure } from "@/components/studio/story/StoryStructure";

describe("StoryStructure", () => {
  it("lists the three acts", () => {
    render(<StoryStructure />);
    expect(screen.getByText(/act 1: the setup/i)).toBeInTheDocument();
    expect(screen.getByText(/act 2/i)).toBeInTheDocument();
    expect(screen.getByText(/act 3/i)).toBeInTheDocument();
  });
  it("highlights the active scene", () => {
    render(<StoryStructure />);
    const active = screen.getByTestId("active-scene");
    expect(active).toHaveTextContent(/call to adventure/i);
  });
});
```

- [ ] **Step 2: Run failing → FAIL.**

- [ ] **Step 3: Implementation**

```tsx
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
```

- [ ] **Step 4: Run passing → PASS.**

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/studio/story/StoryStructure.tsx apps/web/test/story-structure.test.tsx
git commit -m "feat(web): add StoryStructure sidebar"
```

---

## Task 9: `AiCoWriter` subpanel

**Files:**
- Create: `apps/web/components/studio/story/AiCoWriter.tsx`
- Test: `apps/web/test/ai-co-writer.test.tsx`

- [ ] **Step 1: Failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AiCoWriter } from "@/components/studio/story/AiCoWriter";

describe("AiCoWriter", () => {
  it("renders Expand and Change Style controls", () => {
    render(<AiCoWriter />);
    expect(screen.getByRole("button", { name: /expand/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /change style/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run failing → FAIL.**

- [ ] **Step 3: Implementation**

```tsx
export function AiCoWriter() {
  return (
    <div className="mt-4 rounded-lg border border-border bg-surface-2/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-gold">AI co-writer</span>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-md border border-border px-3 py-1 text-xs text-muted hover:border-gold hover:text-gold"
          >
            Expand
          </button>
          <button
            type="button"
            className="rounded-md border border-border px-3 py-1 text-xs text-muted hover:border-gold hover:text-gold"
          >
            Change Style
          </button>
        </div>
      </div>
      <p className="text-xs leading-relaxed text-muted">
        Pick a line and click <strong className="text-text">Expand</strong> for richer prose, or
        switch tone with <strong className="text-text">Change Style</strong>.
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Run passing → PASS.**

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/studio/story/AiCoWriter.tsx apps/web/test/ai-co-writer.test.tsx
git commit -m "feat(web): add AI co-writer subpanel"
```

---

## Task 10: `SceneEditor`

**Files:**
- Create: `apps/web/components/studio/story/SceneEditor.tsx`
- Test: `apps/web/test/scene-editor.test.tsx`

- [ ] **Step 1: Failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SceneEditor } from "@/components/studio/story/SceneEditor";

describe("SceneEditor", () => {
  it("renders the active scene title and body", () => {
    render(<SceneEditor />);
    expect(screen.getByRole("heading", { name: /call to adventure/i })).toBeInTheDocument();
    expect(screen.getByText(/ELARA/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run failing → FAIL.**

- [ ] **Step 3: Implementation**

```tsx
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
```

- [ ] **Step 4: Run passing → PASS.**

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/studio/story/SceneEditor.tsx apps/web/test/scene-editor.test.tsx
git commit -m "feat(web): add SceneEditor"
```

---

## Task 11: `ScenePreviewsSidebar`

**Files:**
- Create: `apps/web/components/studio/story/ScenePreviewsSidebar.tsx`
- Test: `apps/web/test/scene-previews-sidebar.test.tsx`

- [ ] **Step 1: Failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScenePreviewsSidebar } from "@/components/studio/story/ScenePreviewsSidebar";

describe("ScenePreviewsSidebar", () => {
  it("renders preview tiles for scenes that have images", () => {
    render(<ScenePreviewsSidebar />);
    const tiles = screen.getAllByTestId("scene-preview");
    expect(tiles.length).toBeGreaterThanOrEqual(3);
  });
});
```

- [ ] **Step 2: Run failing → FAIL.**

- [ ] **Step 3: Implementation**

```tsx
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
```

- [ ] **Step 4: Run passing → PASS.**

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/studio/story/ScenePreviewsSidebar.tsx apps/web/test/scene-previews-sidebar.test.tsx
git commit -m "feat(web): add ScenePreviewsSidebar"
```

---

## Task 12: `ConvertBar`

**Files:**
- Create: `apps/web/components/studio/story/ConvertBar.tsx`
- Test: `apps/web/test/convert-bar.test.tsx`

- [ ] **Step 1: Failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConvertBar } from "@/components/studio/story/ConvertBar";

describe("ConvertBar", () => {
  it("renders Convert and Export actions and the readiness percentage", () => {
    render(<ConvertBar />);
    expect(screen.getByRole("button", { name: /convert to video/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /export to timeline/i })).toBeInTheDocument();
    expect(screen.getByText(/85%/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run failing → FAIL.**

- [ ] **Step 3: Implementation**

```tsx
import { STORY } from "@/lib/story-mock";

export function ConvertBar() {
  const pct = STORY.readiness;
  return (
    <footer className="flex items-center gap-6 border-t border-border bg-surface px-6 py-3">
      <button
        type="button"
        className="rounded-md border border-gold px-4 py-1.5 text-sm text-gold hover:bg-gold hover:text-bg"
      >
        Convert to Video
      </button>
      <div className="flex flex-1 items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full bg-gradient-to-r from-gold-deep via-gold to-gold-bright"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs text-muted">{pct}% Ready</span>
      </div>
      <button
        type="button"
        className="rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-4 py-1.5 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
      >
        Export to Timeline
      </button>
    </footer>
  );
}
```

- [ ] **Step 4: Run passing → PASS.**

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/studio/story/ConvertBar.tsx apps/web/test/convert-bar.test.tsx
git commit -m "feat(web): add ConvertBar"
```

---

## Task 13: Compose `/studio/story` page

**Files:**
- Create: `apps/web/app/studio/story/page.tsx`
- Test: `apps/web/test/studio-story-page.test.tsx`

- [ ] **Step 1: Failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StoryPage from "@/app/studio/story/page";

describe("Story Studio page", () => {
  it("composes nav, structure, editor, previews, and convert bar", () => {
    render(<StoryPage />);
    expect(screen.getByRole("heading", { name: /ai story creation studio/i })).toBeInTheDocument();
    expect(screen.getByText(/act 1: the setup/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /call to adventure/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /export to timeline/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run failing → FAIL.**

- [ ] **Step 3: Implementation**

```tsx
import { StudioNav } from "@/components/studio/StudioNav";
import { StoryStructure } from "@/components/studio/story/StoryStructure";
import { SceneEditor } from "@/components/studio/story/SceneEditor";
import { ScenePreviewsSidebar } from "@/components/studio/story/ScenePreviewsSidebar";
import { ConvertBar } from "@/components/studio/story/ConvertBar";

export default function StoryPage() {
  return (
    <div className="flex h-screen flex-col">
      <StudioNav title="AI Story Creation Studio" />
      <div className="flex flex-1 overflow-hidden">
        <StoryStructure />
        <SceneEditor />
        <ScenePreviewsSidebar />
      </div>
      <ConvertBar />
    </div>
  );
}
```

- [ ] **Step 4: Run passing → PASS.**

- [ ] **Step 5: Full verification**

`cd D:/Apps/Flova/apps/web && npm test && npm run typecheck && npm run lint && npm run build`
Expected: all green; build lists `/`, `/home`, `/studio`, `/studio/story`, `/studio/character`, `/studio/environment`, `/studio/voice`, `/studio/genre`, `/studio/storyboard`, `/studio/camera`, `/manage`, `/community`, `/account`.

- [ ] **Step 6: Commit**

```bash
git add apps/web/app/studio/story/page.tsx apps/web/test/studio-story-page.test.tsx
git commit -m "feat(web): compose /studio/story page"
```

---

## Task 14: Docs + push

**Files:**
- Create: `apps/web/components/studio/CONTEXT.md`
- Modify: `apps/web/CONTEXT.md`

- [ ] **Step 1: Write `apps/web/components/studio/CONTEXT.md`**

```markdown
# components/studio — CONTEXT

**What:** UI for `/studio` launcher and per-studio pages.

**Top-level files:**
- `StudioNav.tsx` — studio-page top bar (title + Projects/Collaboration/Settings).
- `StudioSelector.tsx` — grid of 7 studios on `/studio` (drives off `lib/studios.ts`).
- `StartingFromBanner.tsx` — surfaces `?prompt=` / `?template=` context from the URL.

**Per-studio subfolders:**
- `story/` — composed of `StoryStructure`, `SceneEditor`, `AiCoWriter`, `ScenePreviewsSidebar`, `ConvertBar`.
  Driven by `lib/story-mock.ts` (hardcoded mock data; no state, no backend).

**Adding a new studio:**
1. Set `available: true` for its row in `lib/studios.ts`.
2. Create `app/studio/<slug>/page.tsx` (compose with `StudioNav`).
3. Components live under `components/studio/<slug>/`.
```

- [ ] **Step 2: Append to `apps/web/CONTEXT.md` (after the templates line)**

```markdown
- `app/studio/page.tsx` — studio launcher (reads `?prompt=` / `?template=`, shows 7 cards from `lib/studios.ts`).
- `app/studio/<slug>/page.tsx` — per-studio pages. Only `story` is built out; others are placeholders flagged `available: false` in the registry.
- `lib/studios.ts` — studios registry (slug, label, blurb, icon, available).
- `lib/story-mock.ts` — Story studio mock data (3 acts / scenes / readiness).
```

- [ ] **Step 3: Commit + push**

```bash
git add apps/web/components/studio/CONTEXT.md apps/web/CONTEXT.md
git commit -m "docs(web): document studio module"
git push -u origin group-c0-studio-framework
```

---

## Manual verification

- [ ] `npm run dev`, open `http://localhost:3000/studio` → see 7 cards, Story clickable, 6 marked Coming soon.
- [ ] `/studio?prompt=a%20cat` → Starting From banner shows the prompt.
- [ ] Click Story card → `/studio/story` shows full layout (left structure, center editor, right previews, bottom convert bar).
- [ ] From `/home`, type into the prompt bar and submit → arrives at `/studio?prompt=…`.
- [ ] Click any template card on `/home` → arrives at `/studio?template=<slug>`.

---

## Self-Review

- **Spec coverage:** Registry (T1) → studio nav (T2) → context banner (T3) → launcher selector (T4) → `/studio` page (T5) → 6 placeholders (T6) → mock (T7) → 5 Story components (T8–12) → `/studio/story` composition (T13) → docs (T14).
- **Placeholders:** None TBD; all "coming soon" sub-routes intentionally minimal and labelled.
- **Type consistency:** `Studio` from `lib/studios.ts` used by `StudioSelector`. `STORY` / `Scene` / `Act` from `lib/story-mock.ts` used by 4 Story components. `StudioNav`'s `title` is the only inter-component contract.
- **Naming clash risk:** Studio nav "Settings" / "Projects" use full text; tests anchor on the exact text. No `/generate/i`-style regex collisions.
