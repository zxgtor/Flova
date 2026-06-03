# Flova — Design Spec
_2026-05-17_

## Overview

A personal app showcase — a gallery of everything you're building or plan to build. Styled like Google AI Studio's app gallery (dark theme, screenshot-first cards, tag filters). Three access levels control what apps and fields are visible to each visitor.

---

## Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | Next.js (App Router) | Full-stack, file-based routing |
| ORM | Prisma | Type-safe queries, clean migrations, swap DB later if needed |
| Database | SQLite (local file) | Zero cost, zero infrastructure, lives on the server |
| Hosting | Ubuntu VPS (own server) | Full Node.js runtime, no edge constraints, PM2 + Nginx |
| Image storage | Cloudflare R2 | 10GB free, no egress fees, keeps images off server disk |
| Auth | NextAuth.js v5 | OAuth (Google and/or GitHub), database sessions via Prisma adapter |

---

## Access Levels

Three roles, determined at runtime:

| Role | Who | How determined |
|------|-----|----------------|
| `public` | Unauthenticated visitors | No session |
| `user` | Signed-in visitors | Valid session, email ≠ admin email |
| `admin` | You | Email matches `ADMIN_EMAIL` env var |

Registration is open — anyone can sign up via OAuth and becomes a `user`.

---

## Data Model

### `apps` table

| Field | Type | Notes |
|-------|------|-------|
| `id` | text (cuid) | Primary key |
| `name` | text | Required |
| `description` | text | Required |
| `screenshot` | text | R2 URL, nullable |
| `status` | text | `idea` / `in_progress` / `shipped` |
| `liveUrl` | text | Nullable |
| `repoUrl` | text | Nullable |
| `techStack` | text | JSON array of strings |
| `tags` | text | JSON array of strings |
| `notes` | text | Admin-only private notes, nullable |
| `visibility` | text | `public` / `users` / `admin` |
| `createdAt` | integer | Unix timestamp |
| `updatedAt` | integer | Unix timestamp |

### `users` table (NextAuth managed)

| Field | Type | Notes |
|-------|------|-------|
| `id` | text | Primary key |
| `name` | text | From OAuth |
| `email` | text | Unique |
| `image` | text | OAuth avatar URL |
| `role` | text | `user` / `admin` — set on first login |
| `emailVerified` | integer | NextAuth field |

Plus standard NextAuth tables: `accounts`, `sessions`, `verification_tokens`.

---

## Field Visibility Per Role

| Field | Public | User | Admin |
|-------|:------:|:----:|:-----:|
| name | ✓ | ✓ | ✓ |
| description | ✓ | ✓ | ✓ |
| screenshot | ✓ | ✓ | ✓ |
| tags | ✓ | ✓ | ✓ |
| status | ✓ | ✓ | ✓ |
| liveUrl | ✓ | ✓ | ✓ |
| techStack | ✗ | ✓ | ✓ |
| repoUrl | ✗ | ✓ | ✓ |
| notes | ✗ | ✗ | ✓ |
| visibility setting | ✗ | ✗ | ✓ |

App visibility controls which apps appear; field visibility controls what data is shown within a visible app.

---

## Pages & Routes

| Route | Access | Purpose |
|-------|--------|---------|
| `/` | Everyone | Gallery — cards filtered by role + visibility |
| `/apps/[id]` | Everyone | App detail — fields filtered by role |
| `/sign-in` | Unauthenticated | OAuth sign-in (Google / GitHub) |
| `/admin` | Admin only | App list table with Edit / New buttons |
| `/admin/apps/new` | Admin only | Full-page form to create an app |
| `/admin/apps/[id]/edit` | Admin only | Full-page form to edit an app |
| `/api/auth/[...nextauth]` | — | NextAuth handler |
| `/api/apps` | — | CRUD API (protected by role) |
| `/api/upload` | Admin only | Handles R2 image uploads |

Unauthorized access to admin routes redirects to `/sign-in` or `/`.

---

## UI Design

### Gallery (`/`)

- Dark theme throughout
- Header: logo/site name, status filter tabs (All / In Progress / Ideas / Shipped), tag filter chips, sign-in button (or avatar if logged in)
- App cards in a responsive grid (2 columns on tablet, 3 on desktop)
- Each card: full-width screenshot preview image, app name + status badge, 2-line description, tag chips at bottom
- Cards filtered server-side based on role and visibility setting

### App Detail (`/apps/[id]`)

- Large screenshot at top
- Name, status badge, description
- Role-gated sections: tech stack + repo link shown only to users/admin; notes shown only to admin
- Live app link as a prominent CTA button

### Admin Panel (`/admin`)

- Table listing all apps (regardless of visibility)
- Columns: name, status, visibility, actions (Edit button)
- "New App" button in the header
- Clicking Edit navigates to `/admin/apps/[id]/edit`

### Admin Edit Page (`/admin/apps/[id]/edit`)

- Full-page two-column form
- Left column: name, description, tech stack (comma-separated chip input), tags (comma-separated chip input), notes
- Right column: screenshot upload (drag-and-drop → R2), status dropdown, visibility dropdown, live URL, repo URL
- Save and Delete buttons in the header
- Back link to `/admin`

---

## Auth Flow

1. Visitor clicks "Sign in" → redirected to `/sign-in`
2. Chooses Google or GitHub OAuth
3. On callback, NextAuth creates/updates user record
4. If `user.email === ADMIN_EMAIL` env var → role set to `admin`, otherwise `user`
5. Session stored via NextAuth database sessions (Prisma adapter)

---

## Image Upload Flow

1. Admin selects or drops an image on the edit page
2. Browser sends the file to `/api/upload`
3. API route uploads to Cloudflare R2, returns the public URL
4. URL stored in `apps.screenshot`

---

## Environment Variables

```
DATABASE_URL=file:./db/flova.db
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
ADMIN_EMAIL=
CLOUDFLARE_R2_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET_NAME=
CLOUDFLARE_R2_PUBLIC_URL=
```

---

## Deployment (Ubuntu VPS)

- **Process manager**: PM2 — runs `next start`, auto-restarts on crash, starts on server reboot
- **Reverse proxy**: Nginx — handles HTTPS (via Let's Encrypt / Certbot), proxies to Next.js on port 3000
- **Database**: SQLite file at `./db/flova.db` on the server, included in regular server backups
- **Deploy flow**: `git pull` → `npm run build` → `pm2 restart flova`
- **Migrations**: `prisma migrate deploy` run as part of the deploy flow

---

## Out of Scope (for now)

- Search / full-text filtering
- App sorting (by date, status)
- Multiple admins
- Comments or likes on apps
- RSS feed
- Analytics
