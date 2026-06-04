# components/home — CONTEXT

**What:** Components for the logged-in launcher page at `/home`.

**Key files:**
- `HomeNav.tsx` — wraps `landing/SiteNav` with the `cta` slot (Generate + Avatar).
- `Avatar.tsx` — placeholder avatar linking to `/account/profile` (no real session).
- `PromptBar.tsx` — `<form action="/studio" method="GET">` capturing free-text prompt.
- `TemplateCard.tsx` / `TemplateGrid.tsx` — clickable preset cards from `lib/templates.ts`.

**Behavior:** All interaction routes to `/studio?prompt=…` or `/studio?template=<slug>`. Home itself owns no state.

**Tests:** One Vitest per component under `apps/web/test/`.
