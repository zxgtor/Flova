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
