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
- `app/home/page.tsx` — logged-in launcher (search bar + template cards), composes `components/home/*`.
- `lib/templates.ts` — static placeholder template data; replace with templates API later.

**Conventions:**
- Brand colors come from CSS variables / Tailwind theme tokens (`bg`, `surface`, `gold`, …). Never hardcode hex.
- Each component has a Vitest test under `test/`.

**Commands:** `npm run dev | build | test | typecheck | lint`

**Depends on:** nothing external yet (backend arrives in Group A2).
