# Group B — Home (`/home`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the logged-in app entry page at `/home` — a prompt-capture launcher (search bar + 4 template cards) styled consistently with A1 brand tokens.

**Architecture:** Pure frontend, no backend. Re-uses A1's `SiteNav` (extended with an optional `cta` slot for the Generate button + avatar). PromptBar submits via a plain `<form action="/studio" method="GET">` so it works without JS. Template cards are simple `<Link>`s to `/studio?template=<slug>`. Hardcoded data in `lib/templates.ts`, replaced by an API later. Auth gate deferred (Group I).

**Tech Stack:** Inherited from A1 — Next.js 15 App Router, TS strict, Tailwind, Vitest.

**Out of scope:** Generation logic, loading states, auth, history feed, recent projects.

---

## Design Decisions (resolved during brainstorming)

| Decision | Choice |
|---|---|
| Route | `/home` (Landing stays on `/`) |
| Auth gate | None yet (Group I) — Home always renders the "logged-in" UI |
| Wordmark | `Flova` (mockup's "Flova.ai" is overridden) |
| Top nav vocabulary | A1's site-map (AI Studio / Management / Community / Account) — mockup's Home/Projects/Generator/Learn/Pricing is overridden |
| Prompt submit | `<form action="/studio" method="GET">` → `/studio?prompt=…` |
| Template click | `<Link href="/studio?template=<slug>">` |
| 4 templates | `script_to_video`, `cinematic_story`, `reference_video_remix`, `music_video` (all marked `popular: true`) |
| Template thumbnails | Reuse existing design PNGs (no new image assets): `ai_story_creation_studio`, `final_movie_review_export`, `video_remix_modal`, `ai_voice_design_studio` |
| Background | A1 dark tokens unchanged. New utility class `.bg-home-glow` adds a radial purple→indigo→transparent overlay only on the PromptBar wrapper. |
| SiteNav change | Backward-compatible: new optional `cta?: ReactNode` prop. Landing passes nothing → looks identical. Home passes Generate button + Avatar. |
| Landing CTA tweak | `Hero` "Start Forging" link `/studio` → `/home` (so the funnel lands on the launcher). |

---

## File Structure

```
apps/web/
├─ app/home/page.tsx                       # NEW
├─ components/
│  ├─ landing/
│  │  ├─ SiteNav.tsx                      # MODIFY — add optional cta slot
│  │  └─ Hero.tsx                         # MODIFY — CTA href /studio → /home
│  └─ home/                                # NEW
│     ├─ HomeNav.tsx                      # composes SiteNav with cta slot
│     ├─ Avatar.tsx                       # static placeholder, links to /account/profile
│     ├─ PromptBar.tsx                    # form action="/studio" method="GET"
│     ├─ TemplateCard.tsx
│     └─ TemplateGrid.tsx
├─ lib/templates.ts                        # NEW — 4 hardcoded templates
├─ app/globals.css                         # MODIFY — add .bg-home-glow utility
└─ public/mockups/templates/               # NEW — copied from existing design PNGs
   ├─ script-to-video.png
   ├─ cinematic-story.png
   ├─ reference-remix.png
   └─ music-video.png
```

---

## Task 1: Add `.bg-home-glow` utility + reuse template thumbnails

**Files:**
- Modify: `apps/web/app/globals.css`
- Copy: 4 PNGs from `docs/designs/` → `apps/web/public/mockups/templates/`

- [ ] **Step 1: Append `.bg-home-glow` to `apps/web/app/globals.css`**

```css
.bg-home-glow {
  background:
    radial-gradient(
      80% 60% at 50% 40%,
      rgba(95, 70, 165, 0.35),
      rgba(31, 39, 71, 0.55) 55%,
      transparent 80%
    ),
    var(--bg);
}
```

- [ ] **Step 2: Copy template thumbnails**

Run from repo root:

```powershell
$dst = "D:\Apps\Flova\apps\web\public\mockups\templates"
New-Item -ItemType Directory -Force -Path $dst | Out-Null
Copy-Item "D:\Apps\Flova\docs\designs\ai_story_creation_studio\screen.png"   "$dst\script-to-video.png"   -Force
Copy-Item "D:\Apps\Flova\docs\designs\final_movie_review_export\screen.png"  "$dst\cinematic-story.png"   -Force
Copy-Item "D:\Apps\Flova\docs\designs\video_remix_modal\screen.png"          "$dst\reference-remix.png"   -Force
Copy-Item "D:\Apps\Flova\docs\designs\ai_voice_design_studio\screen.png"     "$dst\music-video.png"       -Force
```

Expected: 4 PNGs present under `apps/web/public/mockups/templates/`.

- [ ] **Step 3: Commit**

```bash
cd D:/Apps/Flova
git add apps/web/app/globals.css apps/web/public/mockups/templates
git commit -m "feat(web): add home-glow utility and template thumbnails"
```

---

## Task 2: `lib/templates.ts` — hardcoded template data

**Files:**
- Create: `apps/web/lib/templates.ts`
- Test: `apps/web/test/templates.test.ts`

- [ ] **Step 1: Write the failing test `apps/web/test/templates.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { TEMPLATES } from "@/lib/templates";

describe("home templates", () => {
  it("exposes exactly four templates", () => {
    expect(TEMPLATES).toHaveLength(4);
  });

  it("each template has slug, title, description, image, and popular=true", () => {
    for (const t of TEMPLATES) {
      expect(t.slug).toMatch(/^[a-z_]+$/);
      expect(t.title.length).toBeGreaterThan(0);
      expect(t.description.length).toBeGreaterThan(0);
      expect(t.image.startsWith("/mockups/templates/")).toBe(true);
      expect(t.popular).toBe(true);
    }
  });

  it("slugs are unique", () => {
    const slugs = TEMPLATES.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd D:/Apps/Flova/apps/web && npx vitest run test/templates.test.ts`
Expected: FAIL — cannot resolve `@/lib/templates`.

- [ ] **Step 3: Write `apps/web/lib/templates.ts`**

```ts
export type Template = {
  slug: string;
  title: string;
  description: string;
  image: string;
  popular: boolean;
};

// Static placeholder data; replaced by a real templates API in a later group.
export const TEMPLATES: Template[] = [
  {
    slug: "script_to_video",
    title: "Script to Video",
    description: "Convert text into a compelling visual story.",
    image: "/mockups/templates/script-to-video.png",
    popular: true,
  },
  {
    slug: "cinematic_story",
    title: "Cinematic Story",
    description: "Generate epic narratives with a Hollywood touch.",
    image: "/mockups/templates/cinematic-story.png",
    popular: true,
  },
  {
    slug: "reference_video_remix",
    title: "Reference Video Remix",
    description: "Transform existing footage with AI effects.",
    image: "/mockups/templates/reference-remix.png",
    popular: true,
  },
  {
    slug: "music_video",
    title: "Music Video",
    description: "Create dynamic visuals synchronized to audio.",
    image: "/mockups/templates/music-video.png",
    popular: true,
  },
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd D:/Apps/Flova/apps/web && npx vitest run test/templates.test.ts`
Expected: PASS — 3 passed.

- [ ] **Step 5: Commit**

```bash
cd D:/Apps/Flova
git add apps/web/lib/templates.ts apps/web/test/templates.test.ts
git commit -m "feat(web): add home template data"
```

---

## Task 3: Extend `SiteNav` with optional `cta` slot (backward compatible)

**Files:**
- Modify: `apps/web/components/landing/SiteNav.tsx`
- Test: `apps/web/test/site-nav.test.tsx` (add a case)

- [ ] **Step 1: Add a failing test case for the cta slot**

Append to `apps/web/test/site-nav.test.tsx` inside the existing `describe("SiteNav", ...)`:

```tsx
  it("renders a cta slot when provided and hides the default sign-in", () => {
    render(<SiteNav cta={<a href="/account/profile">Custom CTA</a>} />);
    expect(screen.getByRole("link", { name: /custom cta/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /sign in/i })).not.toBeInTheDocument();
  });
```

- [ ] **Step 2: Run the failing test**

Run: `cd D:/Apps/Flova/apps/web && npx vitest run test/site-nav.test.tsx`
Expected: FAIL — the new test fails (Sign in still shown / cta prop not supported).

- [ ] **Step 3: Modify `apps/web/components/landing/SiteNav.tsx`**

```tsx
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { NAV_SECTIONS } from "@/lib/nav";

type SiteNavProps = {
  cta?: ReactNode;
};

export function SiteNav({ cta }: SiteNavProps = {}) {
  return (
    <header className="flex items-center justify-between border-b border-border px-8 py-4">
      <Link href="/" aria-label="Flova home">
        <Logo />
      </Link>
      <nav className="hidden gap-8 md:flex">
        {NAV_SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="text-sm text-muted transition-colors hover:text-text"
          >
            {section.label}
          </Link>
        ))}
      </nav>
      {cta ?? (
        <Link
          href="/account/profile"
          className="rounded-md border border-gold px-4 py-1.5 text-sm text-gold transition-colors hover:bg-gold hover:text-bg"
        >
          Sign in
        </Link>
      )}
    </header>
  );
}
```

- [ ] **Step 4: Run the test**

Run: `cd D:/Apps/Flova/apps/web && npx vitest run test/site-nav.test.tsx`
Expected: PASS — 3 passed.

- [ ] **Step 5: Commit**

```bash
cd D:/Apps/Flova
git add apps/web/components/landing/SiteNav.tsx apps/web/test/site-nav.test.tsx
git commit -m "feat(web): SiteNav cta slot for logged-in variant"
```

---

## Task 4: `Avatar` placeholder component

**Files:**
- Create: `apps/web/components/home/Avatar.tsx`
- Test: `apps/web/test/avatar.test.tsx`

- [ ] **Step 1: Write the failing test `apps/web/test/avatar.test.tsx`**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Avatar } from "@/components/home/Avatar";

describe("Avatar", () => {
  it("links to the profile page", () => {
    render(<Avatar />);
    expect(screen.getByRole("link", { name: /account/i })).toHaveAttribute(
      "href",
      "/account/profile",
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd D:/Apps/Flova/apps/web && npx vitest run test/avatar.test.tsx`
Expected: FAIL — cannot resolve `@/components/home/Avatar`.

- [ ] **Step 3: Write `apps/web/components/home/Avatar.tsx`**

```tsx
import Link from "next/link";

export function Avatar() {
  return (
    <Link
      href="/account/profile"
      aria-label="Account"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-2 text-muted transition-colors hover:border-gold hover:text-gold"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
        <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-3.314 0-8 1.657-8 5v1h16v-1c0-3.343-4.686-5-8-5z" />
      </svg>
    </Link>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd D:/Apps/Flova/apps/web && npx vitest run test/avatar.test.tsx`
Expected: PASS — 1 passed.

- [ ] **Step 5: Commit**

```bash
cd D:/Apps/Flova
git add apps/web/components/home/Avatar.tsx apps/web/test/avatar.test.tsx
git commit -m "feat(web): add Avatar placeholder"
```

---

## Task 5: `HomeNav` — SiteNav with Generate button + Avatar

**Files:**
- Create: `apps/web/components/home/HomeNav.tsx`
- Test: `apps/web/test/home-nav.test.tsx`

- [ ] **Step 1: Write the failing test `apps/web/test/home-nav.test.tsx`**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HomeNav } from "@/components/home/HomeNav";

describe("HomeNav", () => {
  it("renders the four site-map sections plus Generate and Account", () => {
    render(<HomeNav />);
    expect(screen.getByRole("link", { name: "AI Studio" })).toHaveAttribute("href", "/studio");
    expect(screen.getByRole("link", { name: /generate/i })).toHaveAttribute("href", "/studio");
    expect(screen.getByRole("link", { name: /account/i })).toHaveAttribute(
      "href",
      "/account/profile",
    );
  });

  it("does not render the Sign in CTA", () => {
    render(<HomeNav />);
    expect(screen.queryByRole("link", { name: /sign in/i })).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd D:/Apps/Flova/apps/web && npx vitest run test/home-nav.test.tsx`
Expected: FAIL — cannot resolve `@/components/home/HomeNav`.

- [ ] **Step 3: Write `apps/web/components/home/HomeNav.tsx`**

```tsx
import Link from "next/link";
import { SiteNav } from "@/components/landing/SiteNav";
import { Avatar } from "@/components/home/Avatar";

export function HomeNav() {
  return (
    <SiteNav
      cta={
        <div className="flex items-center gap-3">
          <Avatar />
          <Link
            href="/studio"
            className="rounded-full bg-gradient-to-b from-gold-bright via-gold to-gold-deep px-5 py-1.5 text-sm font-medium text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition-opacity hover:opacity-90"
          >
            Generate
          </Link>
        </div>
      }
    />
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd D:/Apps/Flova/apps/web && npx vitest run test/home-nav.test.tsx`
Expected: PASS — 2 passed.

- [ ] **Step 5: Commit**

```bash
cd D:/Apps/Flova
git add apps/web/components/home/HomeNav.tsx apps/web/test/home-nav.test.tsx
git commit -m "feat(web): add HomeNav with Generate button and Avatar"
```

---

## Task 6: `PromptBar` — submits via GET form to `/studio`

**Files:**
- Create: `apps/web/components/home/PromptBar.tsx`
- Test: `apps/web/test/prompt-bar.test.tsx`

- [ ] **Step 1: Write the failing test `apps/web/test/prompt-bar.test.tsx`**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PromptBar } from "@/components/home/PromptBar";

describe("PromptBar", () => {
  it("submits a GET form to /studio", () => {
    const { container } = render(<PromptBar />);
    const form = container.querySelector("form");
    expect(form).not.toBeNull();
    expect(form!.getAttribute("action")).toBe("/studio");
    expect(form!.getAttribute("method")?.toLowerCase()).toBe("get");
  });

  it("has a prompt input named 'prompt' with the Flova placeholder", () => {
    render(<PromptBar />);
    const input = screen.getByPlaceholderText(/ask flova/i) as HTMLInputElement;
    expect(input.name).toBe("prompt");
  });

  it("has an accessible submit button", () => {
    render(<PromptBar />);
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd D:/Apps/Flova/apps/web && npx vitest run test/prompt-bar.test.tsx`
Expected: FAIL — cannot resolve `@/components/home/PromptBar`.

- [ ] **Step 3: Write `apps/web/components/home/PromptBar.tsx`**

```tsx
export function PromptBar() {
  return (
    <form
      action="/studio"
      method="GET"
      className="mx-auto flex w-full max-w-3xl items-center gap-2 rounded-2xl border border-border bg-surface-2/70 px-4 py-3 backdrop-blur"
    >
      <input
        type="text"
        name="prompt"
        autoComplete="off"
        placeholder="What would you like to create today? Ask Flova…"
        className="flex-1 bg-transparent text-base text-text placeholder:text-muted focus:outline-none"
      />
      <button
        type="submit"
        aria-label="Submit prompt"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-gold-bright via-gold to-gold-deep text-bg transition-opacity hover:opacity-90"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m0 0l-6-6m6 6l-6 6" />
        </svg>
      </button>
    </form>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd D:/Apps/Flova/apps/web && npx vitest run test/prompt-bar.test.tsx`
Expected: PASS — 3 passed.

- [ ] **Step 5: Commit**

```bash
cd D:/Apps/Flova
git add apps/web/components/home/PromptBar.tsx apps/web/test/prompt-bar.test.tsx
git commit -m "feat(web): add PromptBar with GET form submission"
```

---

## Task 7: `TemplateCard` + `TemplateGrid`

**Files:**
- Create: `apps/web/components/home/TemplateCard.tsx`
- Create: `apps/web/components/home/TemplateGrid.tsx`
- Test: `apps/web/test/template-grid.test.tsx`

- [ ] **Step 1: Write the failing test `apps/web/test/template-grid.test.tsx`**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TemplateGrid } from "@/components/home/TemplateGrid";
import { TEMPLATES } from "@/lib/templates";

describe("TemplateGrid", () => {
  it("renders one card per template, each linking to /studio?template=<slug>", () => {
    render(<TemplateGrid />);
    for (const t of TEMPLATES) {
      const link = screen.getByRole("link", { name: new RegExp(t.title, "i") });
      expect(link).toHaveAttribute("href", `/studio?template=${t.slug}`);
    }
  });

  it("marks popular templates with a Popular badge", () => {
    render(<TemplateGrid />);
    expect(screen.getAllByText(/popular/i)).toHaveLength(
      TEMPLATES.filter((t) => t.popular).length,
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd D:/Apps/Flova/apps/web && npx vitest run test/template-grid.test.tsx`
Expected: FAIL — cannot resolve `@/components/home/TemplateGrid`.

- [ ] **Step 3: Write `apps/web/components/home/TemplateCard.tsx`**

```tsx
import Image from "next/image";
import Link from "next/link";
import type { Template } from "@/lib/templates";

export function TemplateCard({ template }: { template: Template }) {
  return (
    <Link
      href={`/studio?template=${template.slug}`}
      className="group relative block overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-gold"
    >
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={template.image}
          alt=""
          fill
          sizes="(min-width: 768px) 25vw, 50vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {template.popular && (
          <span className="absolute left-3 top-3 rounded-full border border-gold/60 bg-bg/70 px-2 py-0.5 text-xs font-medium text-gold backdrop-blur">
            Popular
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display text-base font-semibold">{template.title}</h3>
        <p className="mt-1 text-xs text-muted">{template.description}</p>
      </div>
    </Link>
  );
}
```

- [ ] **Step 4: Write `apps/web/components/home/TemplateGrid.tsx`**

```tsx
import { TEMPLATES } from "@/lib/templates";
import { TemplateCard } from "@/components/home/TemplateCard";

export function TemplateGrid() {
  return (
    <section className="mx-auto grid max-w-6xl gap-4 px-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
      {TEMPLATES.map((t) => (
        <TemplateCard key={t.slug} template={t} />
      ))}
    </section>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd D:/Apps/Flova/apps/web && npx vitest run test/template-grid.test.tsx`
Expected: PASS — 2 passed.

- [ ] **Step 6: Commit**

```bash
cd D:/Apps/Flova
git add apps/web/components/home/TemplateCard.tsx apps/web/components/home/TemplateGrid.tsx apps/web/test/template-grid.test.tsx
git commit -m "feat(web): add TemplateCard and TemplateGrid"
```

---

## Task 8: Compose `/home` page + redirect Landing CTA to `/home`

**Files:**
- Create: `apps/web/app/home/page.tsx`
- Modify: `apps/web/components/landing/Hero.tsx` (CTA href)
- Test: `apps/web/test/home-page.test.tsx`

- [ ] **Step 1: Write the failing test `apps/web/test/home-page.test.tsx`**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/home/page";

describe("HomePage", () => {
  it("renders nav, prompt bar, and at least one template card", () => {
    render(<HomePage />);
    expect(screen.getByRole("link", { name: /generate/i })).toHaveAttribute("href", "/studio");
    expect(screen.getByPlaceholderText(/ask flova/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /script to video/i })).toHaveAttribute(
      "href",
      "/studio?template=script_to_video",
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd D:/Apps/Flova/apps/web && npx vitest run test/home-page.test.tsx`
Expected: FAIL — `@/app/home/page` not found.

- [ ] **Step 3: Write `apps/web/app/home/page.tsx`**

```tsx
import { HomeNav } from "@/components/home/HomeNav";
import { PromptBar } from "@/components/home/PromptBar";
import { TemplateGrid } from "@/components/home/TemplateGrid";

export default function HomePage() {
  return (
    <>
      <HomeNav />
      <main>
        <section className="bg-home-glow px-8 py-20">
          <h1 className="mx-auto mb-8 max-w-3xl text-center font-display text-3xl font-semibold">
            What would you like to <span className="text-gold-gradient">create</span> today?
          </h1>
          <PromptBar />
        </section>
        <TemplateGrid />
      </main>
    </>
  );
}
```

- [ ] **Step 4: Update Landing's Hero CTA to point at `/home`**

In `apps/web/components/landing/Hero.tsx`, change the `Link href` from `/studio` to `/home`:

```tsx
        <Link
          href="/home"
          className="mt-10 inline-block rounded-lg bg-gold px-8 py-3 font-medium text-bg transition-opacity hover:opacity-90"
        >
          Start Forging
        </Link>
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd D:/Apps/Flova/apps/web && npx vitest run test/home-page.test.tsx`
Expected: PASS — 1 passed.

- [ ] **Step 6: Run the full verification (tests + typecheck + lint + build)**

Run: `cd D:/Apps/Flova/apps/web && npm test && npm run typecheck && npm run lint && npm run build`
Expected: all tests pass; `tsc` exits 0; lint exits 0; `next build` lists `/`, `/home`, `/studio`, `/manage`, `/community`, `/account`.

- [ ] **Step 7: Commit**

```bash
cd D:/Apps/Flova
git add apps/web/app/home/page.tsx apps/web/components/landing/Hero.tsx apps/web/test/home-page.test.tsx
git commit -m "feat(web): compose /home page and point Landing CTA at it"
```

---

## Task 9: Module docs + push

**Files:**
- Create: `apps/web/components/home/CONTEXT.md`
- Modify: `apps/web/CONTEXT.md` (mention `/home`)

- [ ] **Step 1: Write `apps/web/components/home/CONTEXT.md`**

```markdown
# components/home — CONTEXT

**What:** Components for the logged-in launcher page at `/home`.

**Key files:**
- `HomeNav.tsx` — wraps `landing/SiteNav` with the `cta` slot (Generate + Avatar).
- `Avatar.tsx` — placeholder avatar linking to `/account/profile` (no real session).
- `PromptBar.tsx` — `<form action="/studio" method="GET">` capturing free-text prompt.
- `TemplateCard.tsx` / `TemplateGrid.tsx` — clickable preset cards from `lib/templates.ts`.

**Behavior:** All interaction routes to `/studio?prompt=…` or `/studio?template=<slug>`. Home itself owns no state.

**Tests:** One Vitest per component under `apps/web/test/`.
```

- [ ] **Step 2: Append a `/home` line to `apps/web/CONTEXT.md`**

Under **Key files** add this bullet (before "Conventions:"):

```markdown
- `app/home/page.tsx` — logged-in launcher (search bar + template cards), composes `components/home/*`.
- `lib/templates.ts` — static placeholder template data; replace with templates API later.
```

- [ ] **Step 3: Commit and push**

```bash
cd D:/Apps/Flova
git add apps/web/components/home/CONTEXT.md apps/web/CONTEXT.md
git commit -m "docs(web): document home module"
git push -u origin group-b-home
```

---

## Manual verification (after all tasks)

- [ ] Run `cd D:/Apps/Flova/apps/web && npm run dev` and open `http://localhost:3000/home`.
- [ ] Confirm: dark background with a purple/indigo glow behind the prompt bar; nav shows Logo + 4 sections + Avatar + gold Generate pill; prompt bar present with the Flova placeholder; 4 template cards each tagged "Popular".
- [ ] Submit the prompt bar → URL becomes `/studio?prompt=<your text>`.
- [ ] Click a template card → URL becomes `/studio?template=<slug>`.
- [ ] Open `http://localhost:3000/` → click "Start Forging" → lands on `/home`.

---

## Self-Review notes

- **Spec coverage:** Every brainstormed decision maps to a task: glow utility (T1), templates (T2), SiteNav cta slot (T3), Avatar (T4), HomeNav (T5), PromptBar (T6), Template cards (T7), page composition + Hero CTA tweak + full verification (T8), docs (T9).
- **Placeholder scan:** No TBDs; template thumbnails reuse existing PNGs explicitly (not "TODO add real images").
- **Type consistency:** `Template` type defined once in `lib/templates.ts`, imported by `TemplateCard`. `SiteNavProps.cta?: ReactNode` used by both Landing (omitted) and Home (passed). All hrefs match the routes added in A1.
