# Group A1 — Web Foundation & Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the Flova frontend monorepo with brand design tokens, a site-map route skeleton, and a working dark/gold landing page — a deployable tracer bullet for the whole platform.

**Architecture:** A Next.js (App Router) + TypeScript (strict) app under `apps/web`. Brand tokens live as CSS variables + a Tailwind theme. The site map is encoded once in a typed `nav` config that drives both routing and navigation UI. The landing page is composed from small, independently-tested presentational components. Community showcase uses static mock data (no backend in this plan).

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript strict, Tailwind CSS v4, Vitest + @testing-library/react + jsdom, ESLint + Prettier.

**Out of scope (sibling plans):** FastAPI backend (Group A2), auth, real community data, per-studio pages beyond placeholders.

**Prerequisites:** Node ≥ 20 (verified: v24), npm ≥ 10 (verified: 11). Repo root: `D:/Apps/Flova`, git initialized, remote `origin` set.

---

## File Structure

```
Flova/
├─ apps/web/
│  ├─ app/
│  │  ├─ layout.tsx              # Root layout, fonts, <body> with brand bg
│  │  ├─ globals.css             # CSS variables (brand tokens) + Tailwind
│  │  ├─ page.tsx                # Landing page (composes landing components)
│  │  ├─ studio/page.tsx         # Placeholder (site-map node)
│  │  ├─ manage/page.tsx         # Placeholder
│  │  ├─ community/page.tsx      # Placeholder
│  │  └─ account/page.tsx        # Placeholder
│  ├─ components/
│  │  ├─ brand/Logo.tsx          # Logo mark + wordmark
│  │  └─ landing/
│  │     ├─ SiteNav.tsx
│  │     ├─ Hero.tsx
│  │     ├─ FeatureCard.tsx
│  │     ├─ FeatureGrid.tsx
│  │     └─ CommunityShowcase.tsx
│  ├─ lib/
│  │  ├─ nav.ts                  # Typed site-map / nav config (single source)
│  │  └─ showcase.ts             # Static mock data for community showcase
│  ├─ test/                      # Vitest component tests
│  ├─ tailwind.config.ts
│  ├─ postcss.config.mjs
│  ├─ tsconfig.json
│  ├─ next.config.ts
│  ├─ vitest.config.ts
│  ├─ vitest.setup.ts
│  ├─ package.json
│  ├─ .eslintrc.json
│  ├─ .prettierrc.json
│  └─ CONTEXT.md
├─ docs/adr/0001-platform-foundation.md
├─ .gitignore
└─ (existing docs/, assets/)
```

**Brand tokens (derived from `docs/designs/flova_brand_identity_design/screen.png`; tunable):**

| Token | Value | Use |
|-------|-------|-----|
| `--bg` | `#0E0F12` | App background (near-black) |
| `--surface` | `#16181D` | Cards |
| `--surface-2` | `#1E2127` | Raised cards / nav |
| `--border` | `#2A2E36` | Hairline borders |
| `--text` | `#ECECEC` | Primary text |
| `--muted` | `#9AA0A6` | Secondary text |
| `--gold` | `#C9A24B` | Primary accent |
| `--gold-bright` | `#E9C46A` | Gradient highlight |
| `--gold-deep` | `#8A6D2F` | Gradient shadow |

Fonts: **Inter** (UI/body) + **Sora** (display/headings), both via `next/font/google`.

---

## Task 1: Repo scaffolding — .gitignore + ADR-0001

**Files:**
- Create: `D:/Apps/Flova/.gitignore`
- Create: `D:/Apps/Flova/docs/adr/0001-platform-foundation.md`

- [ ] **Step 1: Write `.gitignore`**

```gitignore
# Dependencies
node_modules/
# Next.js
.next/
out/
# Build / cache
dist/
*.tsbuildinfo
.turbo/
# Env
.env
.env.local
.env*.local
# OS / editor
.DS_Store
Thumbs.db
# Test
coverage/
```

- [ ] **Step 2: Write ADR-0001 recording the foundation decisions**

```markdown
# ADR-0001: Platform Foundation

Date: 2026-06-02
Status: Accepted

## Context
Flova is a self-hosted AI video platform built and maintained primarily by AI agents.
Decisions optimize for performance, reliability, and AI extensibility (not human hiring).

## Decision
- Frontend: Next.js (App Router) + TypeScript strict, UI only.
- Backend: Python + FastAPI + Pydantic (separate plan), OpenAPI contract.
- Inference: Python GPU workers via Redis queue.
- DB: PostgreSQL. Queue: Redis.
- Storage: Cloudflare R2 (hot/served) + PikPak (cold/archive) behind a StorageProvider interface.
- GPU: own baseline + cloud burst.
- Accounts/billing: fully independent product.
- Docs for AI maintainability: per-module CONTEXT.md + ADRs + periodic understand-anything knowledge graph.

See docs/foundation/architecture.md for the full foundation spec.

## Consequences
- Two backend-adjacent languages (TS frontend, Python backend) — acceptable; agents handle both.
- A single typed HTTP/OpenAPI seam between frontend and backend.
```

- [ ] **Step 3: Commit**

```bash
cd D:/Apps/Flova
git add .gitignore docs/adr/0001-platform-foundation.md
git commit -m "chore: add .gitignore and ADR-0001 platform foundation"
```

---

## Task 2: Next.js app scaffold (`apps/web`)

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/next.config.ts`
- Create: `apps/web/next-env.d.ts` (generated; ignore in edits)

- [ ] **Step 1: Create `apps/web/package.json`**

```json
{
  "name": "@flova/web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.0",
    "@testing-library/react": "^16.1.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^15.1.0",
    "jsdom": "^25.0.0",
    "postcss": "^8.4.0",
    "prettier": "^3.3.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.6.0",
    "vitest": "^2.1.0"
  }
}
```

> Note: Tailwind v3 is pinned (stable PostCSS pipeline) rather than v4 to keep config explicit and testable.

- [ ] **Step 2: Create `apps/web/tsconfig.json` (strict)**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create `apps/web/next.config.ts`**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
```

- [ ] **Step 4: Install dependencies**

Run: `cd D:/Apps/Flova/apps/web && npm install`
Expected: completes, creates `node_modules` and `package-lock.json`, no error exit.

- [ ] **Step 5: Commit**

```bash
cd D:/Apps/Flova
git add apps/web/package.json apps/web/package-lock.json apps/web/tsconfig.json apps/web/next.config.ts
git commit -m "chore(web): scaffold Next.js app with strict TS"
```

---

## Task 3: Tooling — Tailwind, PostCSS, ESLint, Prettier, Vitest

**Files:**
- Create: `apps/web/postcss.config.mjs`
- Create: `apps/web/tailwind.config.ts`
- Create: `apps/web/.eslintrc.json`
- Create: `apps/web/.prettierrc.json`
- Create: `apps/web/vitest.config.ts`
- Create: `apps/web/vitest.setup.ts`
- Create: `apps/web/test/smoke.test.ts`

- [ ] **Step 1: Create `apps/web/postcss.config.mjs`**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 2: Create `apps/web/tailwind.config.ts` (maps brand tokens to utilities)**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        border: "var(--border)",
        text: "var(--text)",
        muted: "var(--muted)",
        gold: "var(--gold)",
        "gold-bright": "var(--gold-bright)",
        "gold-deep": "var(--gold-deep)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-sora)", "var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 3: Create `apps/web/.eslintrc.json`**

```json
{
  "extends": ["next/core-web-vitals", "next/typescript"]
}
```

- [ ] **Step 4: Create `apps/web/.prettierrc.json`**

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 100
}
```

- [ ] **Step 5: Create `apps/web/vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
  },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
});
```

- [ ] **Step 6: Create `apps/web/vitest.setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 7: Write the smoke test `apps/web/test/smoke.test.ts`**

```ts
import { describe, it, expect } from "vitest";

describe("toolchain smoke", () => {
  it("runs vitest", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 8: Run the smoke test to verify the toolchain**

Run: `cd D:/Apps/Flova/apps/web && npm test`
Expected: PASS — 1 passed.

- [ ] **Step 9: Verify typecheck and lint run**

Run: `cd D:/Apps/Flova/apps/web && npm run typecheck && npm run lint`
Expected: both exit 0 (lint may report 0 problems).

- [ ] **Step 10: Commit**

```bash
cd D:/Apps/Flova
git add apps/web/postcss.config.mjs apps/web/tailwind.config.ts apps/web/.eslintrc.json apps/web/.prettierrc.json apps/web/vitest.config.ts apps/web/vitest.setup.ts apps/web/test/smoke.test.ts
git commit -m "chore(web): add Tailwind, ESLint, Prettier, Vitest tooling"
```

---

## Task 4: Brand tokens — globals.css + root layout

**Files:**
- Create: `apps/web/app/globals.css`
- Create: `apps/web/app/layout.tsx`
- Test: `apps/web/test/tokens.test.ts`

- [ ] **Step 1: Write the failing test `apps/web/test/tokens.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const css = readFileSync(
  fileURLToPath(new URL("../app/globals.css", import.meta.url)),
  "utf8",
);

describe("brand tokens", () => {
  it("defines all brand CSS variables", () => {
    for (const token of [
      "--bg",
      "--surface",
      "--surface-2",
      "--border",
      "--text",
      "--muted",
      "--gold",
      "--gold-bright",
      "--gold-deep",
    ]) {
      expect(css).toContain(`${token}:`);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd D:/Apps/Flova/apps/web && npx vitest run test/tokens.test.ts`
Expected: FAIL — cannot read `app/globals.css` (file does not exist).

- [ ] **Step 3: Write `apps/web/app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg: #0e0f12;
  --surface: #16181d;
  --surface-2: #1e2127;
  --border: #2a2e36;
  --text: #ececec;
  --muted: #9aa0a6;
  --gold: #c9a24b;
  --gold-bright: #e9c46a;
  --gold-deep: #8a6d2f;
}

body {
  background-color: var(--bg);
  color: var(--text);
}

.text-gold-gradient {
  background-image: linear-gradient(135deg, var(--gold-bright), var(--gold), var(--gold-deep));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
```

- [ ] **Step 4: Write `apps/web/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });

export const metadata: Metadata = {
  title: "Flova — Forge Your Imagination into Motion",
  description: "Self-hosted AI video creation platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd D:/Apps/Flova/apps/web && npx vitest run test/tokens.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
cd D:/Apps/Flova
git add apps/web/app/globals.css apps/web/app/layout.tsx apps/web/test/tokens.test.ts
git commit -m "feat(web): add brand tokens and root layout"
```

---

## Task 5: Logo component (brand)

**Files:**
- Create: `apps/web/components/brand/Logo.tsx`
- Test: `apps/web/test/logo.test.tsx`

- [ ] **Step 1: Write the failing test `apps/web/test/logo.test.tsx`**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Logo } from "@/components/brand/Logo";

describe("Logo", () => {
  it("renders the wordmark", () => {
    render(<Logo />);
    expect(screen.getByText("Flova")).toBeInTheDocument();
  });

  it("renders an accessible logo mark", () => {
    render(<Logo />);
    expect(screen.getByRole("img", { name: /flova/i })).toBeInTheDocument();
  });

  it("can hide the wordmark", () => {
    render(<Logo wordmark={false} />);
    expect(screen.queryByText("Flova")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd D:/Apps/Flova/apps/web && npx vitest run test/logo.test.tsx`
Expected: FAIL — cannot resolve `@/components/brand/Logo`.

- [ ] **Step 3: Write `apps/web/components/brand/Logo.tsx`**

```tsx
type LogoProps = {
  wordmark?: boolean;
  className?: string;
};

export function Logo({ wordmark = true, className }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <svg
        role="img"
        aria-label="Flova"
        viewBox="0 0 32 32"
        className="h-7 w-7"
        fill="none"
      >
        <defs>
          <linearGradient id="flova-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--gold-bright)" />
            <stop offset="50%" stopColor="var(--gold)" />
            <stop offset="100%" stopColor="var(--gold-deep)" />
          </linearGradient>
        </defs>
        <path
          d="M4 28V6l8 10 4-5 4 5 8-10v22h-5V15l-7 9-7-9v13z"
          fill="url(#flova-gold)"
        />
      </svg>
      {wordmark && (
        <span className="font-display text-xl font-semibold text-gold-gradient">Flova</span>
      )}
    </span>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd D:/Apps/Flova/apps/web && npx vitest run test/logo.test.tsx`
Expected: PASS — 3 passed.

- [ ] **Step 5: Commit**

```bash
cd D:/Apps/Flova
git add apps/web/components/brand/Logo.tsx apps/web/test/logo.test.tsx
git commit -m "feat(web): add brand Logo component"
```

---

## Task 6: Site-map nav config + route placeholders

**Files:**
- Create: `apps/web/lib/nav.ts`
- Create: `apps/web/app/studio/page.tsx`
- Create: `apps/web/app/manage/page.tsx`
- Create: `apps/web/app/community/page.tsx`
- Create: `apps/web/app/account/page.tsx`
- Test: `apps/web/test/nav.test.ts`

- [ ] **Step 1: Write the failing test `apps/web/test/nav.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { NAV_SECTIONS } from "@/lib/nav";

describe("site-map nav config", () => {
  it("encodes the four top-level sections from the site map", () => {
    expect(NAV_SECTIONS.map((s) => s.href)).toEqual([
      "/studio",
      "/manage",
      "/community",
      "/account",
    ]);
  });

  it("gives every section a label and at least one child", () => {
    for (const section of NAV_SECTIONS) {
      expect(section.label.length).toBeGreaterThan(0);
      expect(section.children.length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd D:/Apps/Flova/apps/web && npx vitest run test/nav.test.ts`
Expected: FAIL — cannot resolve `@/lib/nav`.

- [ ] **Step 3: Write `apps/web/lib/nav.ts`**

```ts
export type NavChild = { label: string; href: string };
export type NavSection = { label: string; href: string; children: NavChild[] };

// Single source of truth for the platform site map (docs/designs/flova_platform_site_map).
export const NAV_SECTIONS: NavSection[] = [
  {
    label: "AI Studio",
    href: "/studio",
    children: [
      { label: "Video Gen", href: "/studio/video" },
      { label: "Character Studio", href: "/studio/character" },
      { label: "Style Studio", href: "/studio/style" },
      { label: "Canvas", href: "/studio/canvas" },
    ],
  },
  {
    label: "Management",
    href: "/manage",
    children: [
      { label: "Assets Hub", href: "/manage/assets" },
      { label: "Project Workspace", href: "/manage/projects" },
      { label: "Render", href: "/manage/render" },
    ],
  },
  {
    label: "Community",
    href: "/community",
    children: [
      { label: "Discovery Feed", href: "/community/feed" },
      { label: "Style Marketplace", href: "/community/marketplace" },
    ],
  },
  {
    label: "Account",
    href: "/account",
    children: [
      { label: "Profile", href: "/account/profile" },
      { label: "Team Billing", href: "/account/billing" },
      { label: "Settings", href: "/account/settings" },
    ],
  },
];
```

- [ ] **Step 4: Write the four placeholder pages**

`apps/web/app/studio/page.tsx`:

```tsx
export default function StudioPage() {
  return <main className="p-12 font-display text-2xl">AI Studio</main>;
}
```

`apps/web/app/manage/page.tsx`:

```tsx
export default function ManagePage() {
  return <main className="p-12 font-display text-2xl">Management</main>;
}
```

`apps/web/app/community/page.tsx`:

```tsx
export default function CommunityPage() {
  return <main className="p-12 font-display text-2xl">Community</main>;
}
```

`apps/web/app/account/page.tsx`:

```tsx
export default function AccountPage() {
  return <main className="p-12 font-display text-2xl">Account</main>;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd D:/Apps/Flova/apps/web && npx vitest run test/nav.test.ts`
Expected: PASS — 2 passed.

- [ ] **Step 6: Commit**

```bash
cd D:/Apps/Flova
git add apps/web/lib/nav.ts apps/web/app/studio apps/web/app/manage apps/web/app/community apps/web/app/account apps/web/test/nav.test.ts
git commit -m "feat(web): add site-map nav config and route placeholders"
```

---

## Task 7: SiteNav component

**Files:**
- Create: `apps/web/components/landing/SiteNav.tsx`
- Test: `apps/web/test/site-nav.test.tsx`

- [ ] **Step 1: Write the failing test `apps/web/test/site-nav.test.tsx`**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteNav } from "@/components/landing/SiteNav";

describe("SiteNav", () => {
  it("renders the logo and a Sign in action", () => {
    render(<SiteNav />);
    expect(screen.getByText("Flova")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
  });

  it("renders a link for each top-level section", () => {
    render(<SiteNav />);
    expect(screen.getByRole("link", { name: "AI Studio" })).toHaveAttribute("href", "/studio");
    expect(screen.getByRole("link", { name: "Community" })).toHaveAttribute("href", "/community");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd D:/Apps/Flova/apps/web && npx vitest run test/site-nav.test.tsx`
Expected: FAIL — cannot resolve `@/components/landing/SiteNav`.

- [ ] **Step 3: Write `apps/web/components/landing/SiteNav.tsx`**

```tsx
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { NAV_SECTIONS } from "@/lib/nav";

export function SiteNav() {
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
      <Link
        href="/account/profile"
        className="rounded-md border border-gold px-4 py-1.5 text-sm text-gold transition-colors hover:bg-gold hover:text-bg"
      >
        Sign in
      </Link>
    </header>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd D:/Apps/Flova/apps/web && npx vitest run test/site-nav.test.tsx`
Expected: PASS — 2 passed.

- [ ] **Step 5: Commit**

```bash
cd D:/Apps/Flova
git add apps/web/components/landing/SiteNav.tsx apps/web/test/site-nav.test.tsx
git commit -m "feat(web): add SiteNav component"
```

---

## Task 8: Hero component

**Files:**
- Create: `apps/web/components/landing/Hero.tsx`
- Test: `apps/web/test/hero.test.tsx`

- [ ] **Step 1: Write the failing test `apps/web/test/hero.test.tsx`**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "@/components/landing/Hero";

describe("Hero", () => {
  it("renders the headline and primary CTA", () => {
    render(<Hero />);
    expect(
      screen.getByRole("heading", { name: /forge your imagination into motion/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /start forging/i })).toHaveAttribute(
      "href",
      "/studio",
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd D:/Apps/Flova/apps/web && npx vitest run test/hero.test.tsx`
Expected: FAIL — cannot resolve `@/components/landing/Hero`.

- [ ] **Step 3: Write `apps/web/components/landing/Hero.tsx`**

```tsx
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-8 py-24 text-center">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(60% 50% at 70% 40%, rgba(201,162,75,0.25), transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-3xl">
        <h1 className="font-display text-5xl font-semibold leading-tight">
          Forge Your Imagination
          <br />
          <span className="text-gold-gradient">into Motion</span>
        </h1>
        <p className="mt-6 text-lg text-muted">
          Create characters, voices, and stories — then generate real video with self-hosted AI.
        </p>
        <Link
          href="/studio"
          className="mt-10 inline-block rounded-lg bg-gold px-8 py-3 font-medium text-bg transition-opacity hover:opacity-90"
        >
          Start Forging
        </Link>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd D:/Apps/Flova/apps/web && npx vitest run test/hero.test.tsx`
Expected: PASS — 1 passed.

- [ ] **Step 5: Commit**

```bash
cd D:/Apps/Flova
git add apps/web/components/landing/Hero.tsx apps/web/test/hero.test.tsx
git commit -m "feat(web): add Hero component"
```

---

## Task 9: FeatureCard + FeatureGrid

**Files:**
- Create: `apps/web/components/landing/FeatureCard.tsx`
- Create: `apps/web/components/landing/FeatureGrid.tsx`
- Test: `apps/web/test/feature-grid.test.tsx`

- [ ] **Step 1: Write the failing test `apps/web/test/feature-grid.test.tsx`**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FeatureGrid } from "@/components/landing/FeatureGrid";

describe("FeatureGrid", () => {
  it("renders the three landing feature cards", () => {
    render(<FeatureGrid />);
    expect(screen.getByRole("heading", { name: "Character Studio" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Voice Forge" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Story Canvas" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd D:/Apps/Flova/apps/web && npx vitest run test/feature-grid.test.tsx`
Expected: FAIL — cannot resolve `@/components/landing/FeatureGrid`.

- [ ] **Step 3: Write `apps/web/components/landing/FeatureCard.tsx`**

```tsx
type FeatureCardProps = {
  title: string;
  description: string;
  icon: string;
};

export function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <article className="rounded-xl border border-border bg-surface p-6 transition-colors hover:border-gold">
      <div aria-hidden className="mb-4 text-3xl">
        {icon}
      </div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted">{description}</p>
    </article>
  );
}
```

- [ ] **Step 4: Write `apps/web/components/landing/FeatureGrid.tsx`**

```tsx
import { FeatureCard } from "@/components/landing/FeatureCard";

const FEATURES: { title: string; description: string; icon: string }[] = [
  {
    title: "Character Studio",
    description: "Design consistent, reusable AI characters.",
    icon: "🎭",
  },
  { title: "Voice Forge", description: "Craft and clone expressive voices.", icon: "🎙️" },
  { title: "Story Canvas", description: "Plan scenes and storyboards visually.", icon: "📖" },
];

export function FeatureGrid() {
  return (
    <section className="mx-auto grid max-w-5xl gap-6 px-8 py-16 md:grid-cols-3">
      {FEATURES.map((f) => (
        <FeatureCard key={f.title} {...f} />
      ))}
    </section>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd D:/Apps/Flova/apps/web && npx vitest run test/feature-grid.test.tsx`
Expected: PASS — 1 passed.

- [ ] **Step 6: Commit**

```bash
cd D:/Apps/Flova
git add apps/web/components/landing/FeatureCard.tsx apps/web/components/landing/FeatureGrid.tsx apps/web/test/feature-grid.test.tsx
git commit -m "feat(web): add FeatureCard and FeatureGrid"
```

---

## Task 10: CommunityShowcase (static mock data)

**Files:**
- Create: `apps/web/lib/showcase.ts`
- Create: `apps/web/components/landing/CommunityShowcase.tsx`
- Test: `apps/web/test/community-showcase.test.tsx`

- [ ] **Step 1: Write the failing test `apps/web/test/community-showcase.test.tsx`**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CommunityShowcase } from "@/components/landing/CommunityShowcase";
import { SHOWCASE_ITEMS } from "@/lib/showcase";

describe("CommunityShowcase", () => {
  it("renders the section heading", () => {
    render(<CommunityShowcase />);
    expect(screen.getByRole("heading", { name: /community showcase/i })).toBeInTheDocument();
  });

  it("renders one tile per showcase item", () => {
    render(<CommunityShowcase />);
    expect(screen.getAllByTestId("showcase-tile")).toHaveLength(SHOWCASE_ITEMS.length);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd D:/Apps/Flova/apps/web && npx vitest run test/community-showcase.test.tsx`
Expected: FAIL — cannot resolve modules.

- [ ] **Step 3: Write `apps/web/lib/showcase.ts`**

```ts
export type ShowcaseItem = { id: string; title: string; author: string };

// Static placeholder data; replaced by the community API in a later group.
export const SHOWCASE_ITEMS: ShowcaseItem[] = [
  { id: "1", title: "Neon Drifter", author: "@aria" },
  { id: "2", title: "Last Voyage", author: "@kenji" },
  { id: "3", title: "Gilded Forest", author: "@mara" },
  { id: "4", title: "Echoes", author: "@vox" },
  { id: "5", title: "Dust & Gold", author: "@nyx" },
  { id: "6", title: "Tidewalker", author: "@lune" },
];
```

- [ ] **Step 4: Write `apps/web/components/landing/CommunityShowcase.tsx`**

```tsx
import { SHOWCASE_ITEMS } from "@/lib/showcase";

export function CommunityShowcase() {
  return (
    <section className="mx-auto max-w-5xl px-8 py-16">
      <h2 className="mb-8 text-center font-display text-3xl font-semibold">Community Showcase</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {SHOWCASE_ITEMS.map((item) => (
          <div
            key={item.id}
            data-testid="showcase-tile"
            className="aspect-video rounded-lg border border-border bg-surface-2 p-3 transition-colors hover:border-gold"
          >
            <div className="flex h-full flex-col justify-end">
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-muted">{item.author}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd D:/Apps/Flova/apps/web && npx vitest run test/community-showcase.test.tsx`
Expected: PASS — 2 passed.

- [ ] **Step 6: Commit**

```bash
cd D:/Apps/Flova
git add apps/web/lib/showcase.ts apps/web/components/landing/CommunityShowcase.tsx apps/web/test/community-showcase.test.tsx
git commit -m "feat(web): add CommunityShowcase with mock data"
```

---

## Task 11: Compose landing page + verify build

**Files:**
- Create: `apps/web/app/page.tsx`
- Test: `apps/web/test/landing-page.test.tsx`

- [ ] **Step 1: Write the failing test `apps/web/test/landing-page.test.tsx`**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LandingPage from "@/app/page";

describe("LandingPage", () => {
  it("composes nav, hero, features, and showcase", () => {
    render(<LandingPage />);
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /forge your imagination into motion/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Character Studio" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /community showcase/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd D:/Apps/Flova/apps/web && npx vitest run test/landing-page.test.tsx`
Expected: FAIL — `@/app/page` has no default export yet (or file missing).

- [ ] **Step 3: Write `apps/web/app/page.tsx`**

```tsx
import { SiteNav } from "@/components/landing/SiteNav";
import { Hero } from "@/components/landing/Hero";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { CommunityShowcase } from "@/components/landing/CommunityShowcase";

export default function LandingPage() {
  return (
    <>
      <SiteNav />
      <main>
        <Hero />
        <FeatureGrid />
        <CommunityShowcase />
      </main>
    </>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd D:/Apps/Flova/apps/web && npx vitest run test/landing-page.test.tsx`
Expected: PASS — 1 passed.

- [ ] **Step 5: Run the full test suite, typecheck, lint, and production build**

Run: `cd D:/Apps/Flova/apps/web && npm test && npm run typecheck && npm run lint && npm run build`
Expected: all tests pass; `tsc` exits 0; lint exits 0; `next build` completes with the `/`, `/studio`, `/manage`, `/community`, `/account` routes listed.

- [ ] **Step 6: Commit**

```bash
cd D:/Apps/Flova
git add apps/web/app/page.tsx apps/web/test/landing-page.test.tsx
git commit -m "feat(web): compose landing page from sections"
```

---

## Task 12: Module docs + push

**Files:**
- Create: `apps/web/CONTEXT.md`

- [ ] **Step 1: Write `apps/web/CONTEXT.md`**

```markdown
# apps/web — CONTEXT

**What:** Flova frontend (Next.js App Router + TS strict). UI only; no business logic.

**Key files:**
- `app/layout.tsx` — root layout, fonts (Inter/Sora), brand background.
- `app/globals.css` — brand design tokens as CSS variables.
- `app/page.tsx` — landing page, composed from `components/landing/*`.
- `lib/nav.ts` — **single source of truth** for the site map; drives nav UI. Update this when routes change.
- `components/brand/Logo.tsx` — logo mark + wordmark.
- `components/landing/*` — landing sections (SiteNav, Hero, FeatureGrid, CommunityShowcase).
- `lib/showcase.ts` — static placeholder data; replace with community API later.

**Conventions:**
- Brand colors come from CSS variables / Tailwind theme tokens (`bg`, `surface`, `gold`, …). Never hardcode hex.
- Each component has a Vitest test under `test/`.

**Commands:** `npm run dev | build | test | typecheck | lint`

**Depends on:** nothing external yet (backend arrives in Group A2).
```

- [ ] **Step 2: Commit**

```bash
cd D:/Apps/Flova
git add apps/web/CONTEXT.md
git commit -m "docs(web): add apps/web CONTEXT.md"
```

- [ ] **Step 3: Push the branch**

Run: `cd D:/Apps/Flova && git push`
Expected: all Group A1 commits pushed to `origin/main`.

---

## Manual verification (after all tasks)

- [ ] Run `cd D:/Apps/Flova/apps/web && npm run dev`, open `http://localhost:3000`.
- [ ] Confirm: dark background, gold logo + wordmark, hero headline with gold "into Motion", "Start Forging" button, three feature cards, community showcase grid.
- [ ] Click nav links → land on the placeholder section pages.

---

## Self-Review notes

- **Spec coverage:** Foundation engineering principles → ADR-0001 + CONTEXT.md (Task 1, 12); tech stack (frontend) → Tasks 2–3; brand tokens → Task 4 (brand_identity screen); site map / IA → Task 6 (site_map screen); landing page → Tasks 7–11 (landing_page screen). Storage/queue/backend are explicitly deferred to sibling plans.
- **Placeholder scan:** Community data is intentionally static (`lib/showcase.ts`) and labeled; route section pages are intentional placeholders, not TODOs.
- **Type consistency:** `NavSection`/`NavChild` (Task 6) reused by SiteNav (Task 7); `FeatureCard` props (Task 9) match `FeatureGrid` usage; `ShowcaseItem` (Task 10) matches CommunityShowcase.
