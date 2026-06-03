# Flova — Platform Foundation Spec

_2026-06-02_

> Product name: **Flova**, used everywhere. The design **mockup PNGs still show the old
> "MyForges" text baked into the images** — that text cannot be edited in-place and will be
> regenerated when the `brand_identity` / per-screen work is done.

This document defines the **platform-level foundation** shared by every screen and feature:
tech stack, engineering principles, storage strategy, information architecture, and the async
render pipeline. Per-screen specs (under `docs/designs/<name>/spec.md`) build on top of this.

---

## Overview

Flova is a **self-hosted AI video creation platform**. Users author stories, characters,
environments, voices, and visual styles, then generate real video via self-hosted open-source
models running on GPUs. It includes a community/marketplace layer and full team accounts with
billing and seat management.

Flova is launched from a parent "app showcase" site but is a **completely independent product**:
its own authentication, accounts, subscriptions, and billing. The parent provides only an entry
link.

This is a large platform. It is **decomposed into 9 build groups**; this foundation spec ships
first, then each group is specced and built independently.

### Build Groups (decomposition)

| # | Group | Screens (count) |
|---|-------|-----------------|
| A | Foundation (this doc) + site map + brand + landing | 3 |
| B | App shell / home | 1 |
| C | Pre-production creation studios | 7 |
| D | Style system | 6 |
| E | Production & video | 4 |
| F | Export & completion | 2 |
| G | Assets & knowledge | 3 |
| H | Collaboration & community | 3 |
| I | Account & billing | 3 |

Each group: spec → implementation plan → build, in dependency order (A first).

---

## Guiding Principle: Optimize for AI Agents, Not Human Headcount

This codebase is built and maintained primarily by AI coding agents. Decisions optimize for
**performance, reliability, and AI extensibility** — explicitly **not** for ease of human hiring
or familiarity. Concretely:

- **Strong typing end-to-end** — TypeScript `strict` on the frontend; Pydantic models + `mypy`
  on the backend. Types are the agent's guardrail.
- **Small, single-purpose modules** — each file fits in an agent's context window. A file growing
  large is the signal to split it.
- **Explicit, machine-readable contracts** — the frontend ↔ backend boundary is defined by an
  auto-generated **OpenAPI** schema; the frontend consumes a generated typed client, never guesses.
- **Three-layer documentation** (read by humans and agents before changing code):
  1. **Module level** — a `CONTEXT.md` per module: what it does, how to use it, what it depends on.
  2. **Decision level** — ADRs in `docs/adr/` for every significant architectural decision.
  3. **Global level** — a **knowledge graph** regenerated periodically via the `understand-anything`
     toolchain, so agents can navigate architecture, domain flows, and call relationships before
     editing.
- **Conventions enforced by tooling** — lint + format are mandatory, so agent-generated code aligns
  automatically.
- **Comprehensive tests** — every change is self-verified against tests before being claimed
  complete.

---

## Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Frontend | Next.js (App Router) + TypeScript (strict) | UI only; renders the 32-screen design system |
| Backend API | Python + FastAPI + Pydantic | Single backend language shared with ML; OpenAPI contract |
| Inference workers | Python, standalone GPU services | Open-source video models are Python-native |
| Job queue | Redis + Celery (or RQ) | Async render pipeline: submit → queue → worker → notify |
| Database | PostgreSQL | Teams, billing, projects, job state — SQLite cannot carry this |
| GPU compute | Own baseline GPUs + cloud burst (RunPod / Vast / etc.) | Fixed-cost baseline, elastic overflow at peak |
| Hot / serving storage | Cloudflare R2 | S3-compatible API, **zero egress** — ideal for video delivery |
| Cold / archive storage | PikPak | Cheap bulk capacity for raw renders, old projects, training datasets |
| Auth & accounts | Independent (own auth + subscriptions + team seats) | Flova is a standalone product |

### Why a two-language split is acceptable here

The inference layer **must** be Python (the models are). Putting the entire backend (API + workers
+ models) in Python keeps the backend to **one mental model** and reduces cross-language boundaries
to a **single** typed HTTP/OpenAPI seam between frontend and backend. For AI maintainability this is
better than mixing business logic in Node with Python workers. The usual "two languages = harder to
hire" objection does not apply (agents handle both fine).

---

## Storage Strategy: Hot/Cold Tiering

| Tier | Backend | Holds |
|------|---------|-------|
| **Hot / serving** | Cloudflare R2 | Playable videos, thumbnails, frequently-accessed assets |
| **Cold / archive** | PikPak | Raw renders, old projects, large style-training datasets |

**Rules (non-negotiable):**

1. **All user-facing reads go through R2.** PikPak is **never** served directly to end users
   (consumer drive: short-lived links, rate limits, no official S3 API, ToS risk).
2. A **`StorageProvider` interface** (`put` / `get` / `move` / `url`) abstracts the backend.
   Business code never references R2 or PikPak directly. If PikPak's unofficial API breaks, only
   the provider implementation changes — business code is untouched.
3. A **file-location index** in PostgreSQL records which tier each file currently lives in.
4. A **tiering worker** moves files between tiers by access heat (cold files → PikPak, files that
   get accessed → promoted to R2).

> **Known risk (PikPak):** no official S3-compatible API / SDK; access is via unofficial endpoints
> that may break or violate ToS. Mitigated by the `StorageProvider` abstraction so it can be
> swapped without touching business logic.

---

## Access Levels

| Role | Who | How determined |
|------|-----|----------------|
| `guest` | Unauthenticated | No session |
| `member` | Signed-in individual | Valid session, no team / personal plan |
| `team_member` | Member of a team | Belongs to a team, role within team |
| `team_admin` | Team owner / admin | Manages team billing, seats, members |

Detailed permissions per role are specified in the **Account & Billing** group (Group I) spec.

---

## Data Model (high-level)

The foundation defines the top-level entities; each group spec details its own tables.

- **Account & identity:** `users`, `teams`, `team_members`, `subscriptions`, `seats`, `credits`
- **Projects:** `projects`, `project_assets`, `project_members`
- **Creation inputs:** `stories`, `characters`, `environments`, `voices`, `styles`
- **Style system:** `style_trainings`, `style_versions`, `marketplace_listings`
- **Render pipeline:** `render_jobs` (state machine), `render_outputs`
- **Storage:** `files` (with `tier` = `hot|cold`, location index)
- **Community:** `discovery_posts`, `remixes`

All timestamps stored as `timestamptz`. IDs are app-generated (e.g. CUID/UUID).

---

## Information Architecture / Routes

Derived from the platform site map. Top-level sections:

```
Landing (/)
├─ AI Studio   → Video Gen / Character Studio / Style Studio / Canvas
├─ Management  → Assets Hub / Project Workspace / Render
├─ Community   → Discovery Feed / Style Marketplace
└─ Account     → Profile / Team Billing / Settings
```

| Route prefix | Section | Access |
|--------------|---------|--------|
| `/` | Landing (marketing entry) | Everyone |
| `/studio/*` | AI Studio (creation tools) | Member+ |
| `/manage/*` | Management (assets, projects, renders) | Member+ |
| `/community/*` | Community & marketplace | Everyone (read), Member+ (interact) |
| `/account/*` | Profile, team, billing, settings | Member+ |
| `/api/*` | FastAPI backend (separate service/origin) | Per-endpoint auth |

Exact sub-routes are finalized in each group's spec.

---

## Async Render Pipeline

The core production flow, shared by every generation feature:

1. Client submits a generation request → backend creates a `render_jobs` row (`status=queued`),
   returns a job id immediately.
2. Job is enqueued (Redis). The scheduler dispatches to a baseline GPU worker, or bursts to cloud
   GPU when baseline is saturated.
3. A Python inference worker pulls the job (`status=running`), runs the model, writes outputs to
   storage (cold first; promoted to R2 on first serve).
4. Worker updates `render_jobs` (`status=done|failed`, output refs).
5. Client is notified (polling and/or WebSocket/SSE) and fetches outputs via R2 URLs.

**Reliability:** jobs are idempotent and retryable; failures are recorded with a reason; partial
progress is surfaced to the UI.

---

## Environment Variables (foundation)

```
# Database
DATABASE_URL=postgresql://...

# Queue
REDIS_URL=redis://...

# Auth
AUTH_SECRET=

# Storage — Cloudflare R2 (hot)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_URL=

# Storage — PikPak (cold)
PIKPAK_USERNAME=
PIKPAK_PASSWORD=

# GPU burst provider
GPU_BURST_API_KEY=
GPU_BURST_ENDPOINT=
```

Per-group specs add their own variables.

---

## Deployment (high-level)

- **Frontend (Next.js):** Node runtime behind Nginx (HTTPS via Certbot).
- **Backend (FastAPI):** ASGI server (Uvicorn/Gunicorn) behind Nginx; OpenAPI schema published for
  the frontend client generator.
- **Workers (Python):** run on baseline GPU host(s); cloud-burst workers spun up on demand.
- **Redis + PostgreSQL:** on the core server; included in backups.
- **Storage:** R2 (managed) + PikPak (cold), accessed only through `StorageProvider`.

Detailed infra (process management, scaling, monitoring) is specced when Group E (production) is
built, since that is when GPU orchestration becomes real.

---

## Out of Scope (foundation)

- Per-screen layouts and component specs (defined in each group's spec)
- Exact permission matrices (defined in Group I)
- Final brand tokens — colors, type, logo (defined in the `brand_identity` spec)
- Concrete model selection (Wan / HunyuanVideo / CogVideoX / etc.) and GPU sizing
- Analytics, observability stack
