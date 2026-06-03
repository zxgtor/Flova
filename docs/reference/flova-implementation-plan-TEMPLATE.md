# Flova Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal app showcase gallery with 3 access levels (public / user / admin), dark theme screenshot-first cards, and a full admin CRUD panel.

**Architecture:** Next.js App Router (full Node.js runtime) with Prisma + SQLite for data, NextAuth v5 for OAuth authentication, and Cloudflare R2 for image storage. Role-based visibility is enforced server-side at the data layer — apps and fields are filtered before they ever reach the client.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Prisma, SQLite, NextAuth v5, @auth/prisma-adapter, @aws-sdk/client-s3 (R2), Vitest

---

## File Map

```
flova/
├── prisma/
│   └── schema.prisma                        # All DB models (User, Account, Session, App)
├── db/                                      # SQLite file lives here (gitignored)
├── src/
│   ├── types/
│   │   └── index.ts                         # Shared types: Role, Status, Visibility, AppRecord, PublicApp
│   ├── lib/
│   │   ├── prisma.ts                        # Prisma client singleton
│   │   ├── auth.ts                          # NextAuth config (providers, callbacks, adapter)
│   │   ├── roles.ts                         # Pure functions: getRole, canSeeApp, filterAppFields
│   │   └── r2.ts                            # Cloudflare R2 S3-compatible client + uploadToR2()
│   ├── components/
│   │   ├── StatusBadge.tsx                  # Colored pill: idea | in_progress | shipped
│   │   ├── TagChip.tsx                      # Single tag chip (reused in cards + filter bar)
│   │   ├── ChipInput.tsx                    # Comma-separated chip input for admin forms
│   │   ├── AppCard.tsx                      # Gallery card: screenshot, name, badge, desc, tags
│   │   ├── AppGrid.tsx                      # Responsive 2/3-col grid wrapping AppCard
│   │   ├── FilterBar.tsx                    # Client component: status tabs + tag chips (URL params)
│   │   ├── Header.tsx                       # Site header: logo, sign-in/avatar button
│   │   └── ImageUpload.tsx                  # Drag-and-drop upload → POST /api/upload → R2 URL
│   └── app/
│       ├── globals.css                      # Tailwind base + dark theme CSS vars
│       ├── layout.tsx                       # Root layout: dark bg, Header, children
│       ├── page.tsx                         # Gallery (/) — server component, filters by role
│       ├── sign-in/
│       │   └── page.tsx                     # Sign-in page with Google + GitHub buttons
│       ├── apps/
│       │   └── [id]/
│       │       └── page.tsx                 # App detail — role-gated field rendering
│       ├── admin/
│       │   ├── layout.tsx                   # Admin guard: redirects non-admin to /
│       │   ├── page.tsx                     # App list table (all apps, all fields)
│       │   └── apps/
│       │       ├── new/
│       │       │   └── page.tsx             # New app form (same form component as edit)
│       │       └── [id]/
│       │           └── edit/
│       │               └── page.tsx         # Edit app form
│       └── api/
│           ├── auth/
│           │   └── [...nextauth]/
│           │       └── route.ts             # NextAuth handler (handlers.GET, handlers.POST)
│           ├── apps/
│           │   ├── route.ts                 # GET /api/apps (role-filtered list), POST (admin)
│           │   └── [id]/
│           │       └── route.ts             # GET, PUT, DELETE (admin for write)
│           └── upload/
│               └── route.ts                 # POST — multipart upload → R2, returns { url }
├── next-auth.d.ts                           # Augment Session type with id + role
├── next.config.ts                           # Next.js config
├── vitest.config.ts                         # Vitest config
├── ecosystem.config.js                      # PM2 config
└── nginx.conf                               # Nginx reverse proxy template
```

---

## Task 1: Project Bootstrap

**Files:**
- Create: `next.config.ts`
- Create: `.env.local` (from template)
- Create: `.gitignore` additions
- Create: `vitest.config.ts`
- Create: `next-auth.d.ts`

- [ ] **Step 1: Scaffold Next.js project**

```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*" --no-eslint
```

Expected: project files created in current directory.

- [ ] **Step 2: Install dependencies**

```bash
npm install next-auth@beta @auth/prisma-adapter prisma @prisma/client @aws-sdk/client-s3
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 3: Create vitest config**

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: { '@': resolve(__dirname, './src') },
  },
})
```

Create `vitest.setup.ts`:
```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 4: Create NextAuth type augmentation**

Create `next-auth.d.ts`:
```typescript
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: 'user' | 'admin'
    } & DefaultSession['user']
  }
  interface User {
    role: 'user' | 'admin'
  }
}
```

- [ ] **Step 5: Create .env.local template**

Create `.env.local`:
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

- [ ] **Step 6: Update .gitignore**

Append to `.gitignore`:
```
db/
.env.local
```

- [ ] **Step 7: Add test script to package.json**

In `package.json`, add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 8: Commit**

```bash
mkdir -p db
git add -A
git commit -m "feat: bootstrap Next.js project with dependencies"
```

---

## Task 2: Prisma Schema + Database Migration

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/lib/prisma.ts`

- [ ] **Step 1: Initialize Prisma**

```bash
npx prisma init --datasource-provider sqlite
```

Expected: `prisma/schema.prisma` and `.env` created. Delete `.env` (we use `.env.local`).

- [ ] **Step 2: Write schema**

Replace `prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  role          String    @default("user")
  createdAt     DateTime  @default(now())
  accounts      Account[]
  sessions      Session[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model App {
  id          String   @id @default(cuid())
  name        String
  description String
  screenshot  String?
  status      String   @default("idea")
  liveUrl     String?
  repoUrl     String?
  techStack   String   @default("[]")
  tags        String   @default("[]")
  notes       String?
  visibility  String   @default("admin")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

- [ ] **Step 3: Run migration**

```bash
npx prisma migrate dev --name init
```

Expected: `prisma/migrations/` created, `db/flova.db` created.

- [ ] **Step 4: Create Prisma client singleton**

Create `src/lib/prisma.ts`:
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['error'] : [] })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

- [ ] **Step 5: Commit**

```bash
git add prisma/ src/lib/prisma.ts
git commit -m "feat: add Prisma schema and SQLite migration"
```

---

## Task 3: Types + Role Utilities

**Files:**
- Create: `src/types/index.ts`
- Create: `src/lib/roles.ts`
- Create: `src/lib/__tests__/roles.test.ts`

- [ ] **Step 1: Write shared types**

Create `src/types/index.ts`:
```typescript
export type Role = 'public' | 'user' | 'admin'
export type Status = 'idea' | 'in_progress' | 'shipped'
export type Visibility = 'public' | 'users' | 'admin'

export interface AppRecord {
  id: string
  name: string
  description: string
  screenshot: string | null
  status: Status
  liveUrl: string | null
  repoUrl: string | null
  techStack: string[]
  tags: string[]
  notes: string | null
  visibility: Visibility
  createdAt: Date
  updatedAt: Date
}

export interface PublicApp {
  id: string
  name: string
  description: string
  screenshot: string | null
  status: Status
  liveUrl: string | null
  tags: string[]
  techStack?: string[]
  repoUrl?: string | null
  notes?: string | null
  visibility?: Visibility
}
```

- [ ] **Step 2: Write failing tests for role utilities**

Create `src/lib/__tests__/roles.test.ts`:
```typescript
import { describe, it, expect, vi } from 'vitest'

// Mock process.env before importing roles
vi.stubEnv('ADMIN_EMAIL', 'admin@example.com')

import { getRole, canSeeApp, filterAppFields } from '../roles'
import type { AppRecord } from '@/types'

const baseApp: AppRecord = {
  id: 'cuid1',
  name: 'Test App',
  description: 'A test app',
  screenshot: null,
  status: 'shipped',
  liveUrl: 'https://example.com',
  repoUrl: 'https://github.com/example/repo',
  techStack: ['Next.js', 'SQLite'],
  tags: ['web', 'tool'],
  notes: 'secret notes',
  visibility: 'public',
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('getRole', () => {
  it('returns public for null email', () => {
    expect(getRole(null)).toBe('public')
  })
  it('returns public for undefined email', () => {
    expect(getRole(undefined)).toBe('public')
  })
  it('returns admin for admin email', () => {
    expect(getRole('admin@example.com')).toBe('admin')
  })
  it('returns user for any other email', () => {
    expect(getRole('someone@example.com')).toBe('user')
  })
})

describe('canSeeApp', () => {
  it('admin can see any visibility', () => {
    expect(canSeeApp('admin', 'admin')).toBe(true)
    expect(canSeeApp('users', 'admin')).toBe(true)
    expect(canSeeApp('public', 'admin')).toBe(true)
  })
  it('user can see public and users apps', () => {
    expect(canSeeApp('public', 'user')).toBe(true)
    expect(canSeeApp('users', 'user')).toBe(true)
    expect(canSeeApp('admin', 'user')).toBe(false)
  })
  it('public can only see public apps', () => {
    expect(canSeeApp('public', 'public')).toBe(true)
    expect(canSeeApp('users', 'public')).toBe(false)
    expect(canSeeApp('admin', 'public')).toBe(false)
  })
})

describe('filterAppFields', () => {
  it('public role sees base fields only', () => {
    const result = filterAppFields(baseApp, 'public')
    expect(result.name).toBe('Test App')
    expect(result.liveUrl).toBe('https://example.com')
    expect(result.techStack).toBeUndefined()
    expect(result.repoUrl).toBeUndefined()
    expect(result.notes).toBeUndefined()
    expect(result.visibility).toBeUndefined()
  })
  it('user role sees techStack and repoUrl', () => {
    const result = filterAppFields(baseApp, 'user')
    expect(result.techStack).toEqual(['Next.js', 'SQLite'])
    expect(result.repoUrl).toBe('https://github.com/example/repo')
    expect(result.notes).toBeUndefined()
    expect(result.visibility).toBeUndefined()
  })
  it('admin role sees all fields', () => {
    const result = filterAppFields(baseApp, 'admin')
    expect(result.techStack).toEqual(['Next.js', 'SQLite'])
    expect(result.repoUrl).toBe('https://github.com/example/repo')
    expect(result.notes).toBe('secret notes')
    expect(result.visibility).toBe('public')
  })
})
```

- [ ] **Step 3: Run tests — expect failure**

```bash
npm test
```

Expected: FAIL — `roles.ts` doesn't exist yet.

- [ ] **Step 4: Implement role utilities**

Create `src/lib/roles.ts`:
```typescript
import type { Role, AppRecord, PublicApp, Visibility } from '@/types'

export function getRole(email: string | null | undefined): Role {
  if (!email) return 'public'
  if (email === process.env.ADMIN_EMAIL) return 'admin'
  return 'user'
}

export function canSeeApp(visibility: Visibility, role: Role): boolean {
  if (role === 'admin') return true
  if (visibility === 'public') return true
  if (visibility === 'users' && role === 'user') return true
  return false
}

export function filterAppFields(app: AppRecord, role: Role): PublicApp {
  const result: PublicApp = {
    id: app.id,
    name: app.name,
    description: app.description,
    screenshot: app.screenshot,
    status: app.status,
    liveUrl: app.liveUrl,
    tags: app.tags,
  }
  if (role === 'user' || role === 'admin') {
    result.techStack = app.techStack
    result.repoUrl = app.repoUrl
  }
  if (role === 'admin') {
    result.notes = app.notes
    result.visibility = app.visibility
  }
  return result
}
```

- [ ] **Step 5: Run tests — expect pass**

```bash
npm test
```

Expected: All 11 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/types/ src/lib/roles.ts src/lib/__tests__/
git commit -m "feat: add types and role utility functions"
```

---

## Task 4: Auth Config (NextAuth v5)

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`

- [ ] **Step 1: Write auth config**

Create `src/lib/auth.ts`:
```typescript
import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'
import { prisma } from './prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google, GitHub],
  pages: {
    signIn: '/sign-in',
  },
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id
      session.user.role = (user.role as 'user' | 'admin') ?? 'user'
      return session
    },
  },
  events: {
    async createUser({ user }) {
      if (user.email && user.email === process.env.ADMIN_EMAIL) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: 'admin' },
        })
      }
    },
  },
})
```

- [ ] **Step 2: Create NextAuth API route**

Create `src/app/api/auth/[...nextauth]/route.ts`:
```typescript
import { handlers } from '@/lib/auth'

export const { GET, POST } = handlers
```

- [ ] **Step 3: Verify types compile**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/auth.ts src/app/api/auth/
git commit -m "feat: configure NextAuth v5 with Google and GitHub OAuth"
```

---

## Task 5: Cloudflare R2 Client + Upload API

**Files:**
- Create: `src/lib/r2.ts`
- Create: `src/app/api/upload/route.ts`

- [ ] **Step 1: Create R2 client**

Create `src/lib/r2.ts`:
```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
})

export async function uploadToR2(
  file: Buffer,
  mimeType: string,
  extension: string
): Promise<string> {
  const key = `screenshots/${randomUUID()}.${extension}`
  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
      Key: key,
      Body: file,
      ContentType: mimeType,
    })
  )
  return `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`
}
```

- [ ] **Step 2: Create upload API route**

Create `src/app/api/upload/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getRole } from '@/lib/roles'
import { uploadToR2 } from '@/lib/r2'

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
}

export async function POST(req: NextRequest) {
  const session = await auth()
  const role = getRole(session?.user?.email)
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const mimeType = file.type
  const extension = ALLOWED_TYPES[mimeType]
  if (!extension) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const url = await uploadToR2(buffer, mimeType, extension)
  return NextResponse.json({ url })
}
```

- [ ] **Step 3: Verify types compile**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/r2.ts src/app/api/upload/
git commit -m "feat: add Cloudflare R2 client and upload API route"
```

---

## Task 6: Apps API Routes

**Files:**
- Create: `src/app/api/apps/route.ts`
- Create: `src/app/api/apps/[id]/route.ts`

- [ ] **Step 1: Helper to parse app from DB**

Replace the full contents of `src/lib/roles.ts` with:
```typescript
import type { App } from '@prisma/client'
import type { Role, AppRecord, PublicApp, Visibility } from '@/types'

export function getRole(email: string | null | undefined): Role {
  if (!email) return 'public'
  if (email === process.env.ADMIN_EMAIL) return 'admin'
  return 'user'
}

export function canSeeApp(visibility: Visibility, role: Role): boolean {
  if (role === 'admin') return true
  if (visibility === 'public') return true
  if (visibility === 'users' && role === 'user') return true
  return false
}

export function filterAppFields(app: AppRecord, role: Role): PublicApp {
  const result: PublicApp = {
    id: app.id,
    name: app.name,
    description: app.description,
    screenshot: app.screenshot,
    status: app.status,
    liveUrl: app.liveUrl,
    tags: app.tags,
  }
  if (role === 'user' || role === 'admin') {
    result.techStack = app.techStack
    result.repoUrl = app.repoUrl
  }
  if (role === 'admin') {
    result.notes = app.notes
    result.visibility = app.visibility
  }
  return result
}

export function parseApp(app: App): AppRecord {
  return {
    ...app,
    status: app.status as AppRecord['status'],
    visibility: app.visibility as AppRecord['visibility'],
    techStack: JSON.parse(app.techStack) as string[],
    tags: JSON.parse(app.tags) as string[],
  }
}
```

- [ ] **Step 2: Create apps list + create route**

Create `src/app/api/apps/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getRole, canSeeApp, filterAppFields, parseApp } from '@/lib/roles'
import { prisma } from '@/lib/prisma'
import type { Visibility, Status } from '@/types'

export async function GET() {
  const session = await auth()
  const role = getRole(session?.user?.email)

  const apps = await prisma.app.findMany({ orderBy: { createdAt: 'desc' } })
  const visible = apps
    .map(parseApp)
    .filter((app) => canSeeApp(app.visibility, role))
    .map((app) => filterAppFields(app, role))

  return NextResponse.json(visible)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  const role = getRole(session?.user?.email)
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json() as {
    name: string
    description: string
    screenshot?: string
    status?: Status
    liveUrl?: string
    repoUrl?: string
    techStack?: string[]
    tags?: string[]
    notes?: string
    visibility?: Visibility
  }

  const app = await prisma.app.create({
    data: {
      name: body.name,
      description: body.description,
      screenshot: body.screenshot ?? null,
      status: body.status ?? 'idea',
      liveUrl: body.liveUrl ?? null,
      repoUrl: body.repoUrl ?? null,
      techStack: JSON.stringify(body.techStack ?? []),
      tags: JSON.stringify(body.tags ?? []),
      notes: body.notes ?? null,
      visibility: body.visibility ?? 'admin',
    },
  })

  return NextResponse.json(parseApp(app), { status: 201 })
}
```

- [ ] **Step 3: Create app detail + update + delete route**

Create `src/app/api/apps/[id]/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getRole, canSeeApp, filterAppFields, parseApp } from '@/lib/roles'
import { prisma } from '@/lib/prisma'
import type { Visibility, Status } from '@/types'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  const role = getRole(session?.user?.email)

  const app = await prisma.app.findUnique({ where: { id } })
  if (!app) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const parsed = parseApp(app)
  if (!canSeeApp(parsed.visibility, role)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(filterAppFields(parsed, role))
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  const role = getRole(session?.user?.email)
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json() as {
    name?: string
    description?: string
    screenshot?: string | null
    status?: Status
    liveUrl?: string | null
    repoUrl?: string | null
    techStack?: string[]
    tags?: string[]
    notes?: string | null
    visibility?: Visibility
  }

  const app = await prisma.app.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.screenshot !== undefined && { screenshot: body.screenshot }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.liveUrl !== undefined && { liveUrl: body.liveUrl }),
      ...(body.repoUrl !== undefined && { repoUrl: body.repoUrl }),
      ...(body.techStack !== undefined && { techStack: JSON.stringify(body.techStack) }),
      ...(body.tags !== undefined && { tags: JSON.stringify(body.tags) }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.visibility !== undefined && { visibility: body.visibility }),
    },
  })

  return NextResponse.json(parseApp(app))
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  const role = getRole(session?.user?.email)
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.app.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
```

- [ ] **Step 4: Verify types compile**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/apps/ src/lib/roles.ts
git commit -m "feat: add apps CRUD API routes"
```

---

## Task 7: Base UI Components

**Files:**
- Create: `src/components/StatusBadge.tsx`
- Create: `src/components/TagChip.tsx`
- Create: `src/components/ChipInput.tsx`

- [ ] **Step 1: StatusBadge**

Create `src/components/StatusBadge.tsx`:
```typescript
import type { Status } from '@/types'

const config: Record<Status, { label: string; className: string }> = {
  idea: { label: 'Idea', className: 'bg-violet-500/20 text-violet-300' },
  in_progress: { label: 'In Progress', className: 'bg-amber-500/20 text-amber-300' },
  shipped: { label: 'Shipped', className: 'bg-emerald-500/20 text-emerald-300' },
}

export function StatusBadge({ status }: { status: Status }) {
  const { label, className } = config[status]
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
```

- [ ] **Step 2: TagChip**

Create `src/components/TagChip.tsx`:
```typescript
export function TagChip({ tag }: { tag: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-white/10 px-2 py-0.5 text-xs text-gray-300">
      {tag}
    </span>
  )
}
```

- [ ] **Step 3: ChipInput**

Create `src/components/ChipInput.tsx`:
```typescript
'use client'

import { useState, KeyboardEvent } from 'react'

interface ChipInputProps {
  label: string
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
}

export function ChipInput({ label, value, onChange, placeholder }: ChipInputProps) {
  const [input, setInput] = useState('')

  function addChip() {
    const trimmed = input.trim()
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed])
    }
    setInput('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addChip()
    }
    if (e.key === 'Backspace' && input === '' && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  function removeChip(chip: string) {
    onChange(value.filter((c) => c !== chip))
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      <div className="flex flex-wrap gap-1.5 rounded-lg border border-white/10 bg-white/5 p-2 min-h-[42px]">
        {value.map((chip) => (
          <span
            key={chip}
            className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-0.5 text-xs text-gray-300"
          >
            {chip}
            <button
              type="button"
              onClick={() => removeChip(chip)}
              className="text-gray-500 hover:text-gray-200 leading-none"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addChip}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/StatusBadge.tsx src/components/TagChip.tsx src/components/ChipInput.tsx
git commit -m "feat: add StatusBadge, TagChip, and ChipInput components"
```

---

## Task 8: AppCard + AppGrid

**Files:**
- Create: `src/components/AppCard.tsx`
- Create: `src/components/AppGrid.tsx`

- [ ] **Step 1: AppCard**

Create `src/components/AppCard.tsx`:
```typescript
import Link from 'next/link'
import Image from 'next/image'
import { StatusBadge } from './StatusBadge'
import { TagChip } from './TagChip'
import type { PublicApp } from '@/types'

export function AppCard({ app }: { app: PublicApp }) {
  return (
    <Link
      href={`/apps/${app.id}`}
      className="group flex flex-col rounded-xl border border-white/10 bg-white/5 overflow-hidden hover:border-white/20 hover:bg-white/8 transition-all duration-200"
    >
      <div className="relative aspect-video w-full bg-gray-800 overflow-hidden">
        {app.screenshot ? (
          <Image
            src={app.screenshot}
            alt={app.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-600 text-sm">
            No screenshot
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-white truncate">{app.name}</h2>
          <StatusBadge status={app.status} />
        </div>
        <p className="text-xs text-gray-400 line-clamp-2">{app.description}</p>
        {app.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {app.tags.map((tag) => (
              <TagChip key={tag} tag={tag} />
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: AppGrid**

Create `src/components/AppGrid.tsx`:
```typescript
import { AppCard } from './AppCard'
import type { PublicApp } from '@/types'

export function AppGrid({ apps }: { apps: PublicApp[] }) {
  if (apps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-600">
        <p className="text-lg">No apps here yet.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {apps.map((app) => (
        <AppCard key={app.id} app={app} />
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/AppCard.tsx src/components/AppGrid.tsx
git commit -m "feat: add AppCard and AppGrid components"
```

---

## Task 9: Header + FilterBar

**Files:**
- Create: `src/components/Header.tsx`
- Create: `src/components/FilterBar.tsx`

- [ ] **Step 1: Header**

Create `src/components/Header.tsx`:
```typescript
import Link from 'next/link'
import Image from 'next/image'
import { auth, signIn, signOut } from '@/lib/auth'
import { getRole } from '@/lib/roles'

export async function Header() {
  const session = await auth()
  const role = getRole(session?.user?.email)

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-gray-950/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-white tracking-tight">
          Flova
        </Link>
        <div className="flex items-center gap-3">
          {role === 'admin' && (
            <Link
              href="/admin"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Admin
            </Link>
          )}
          {session ? (
            <form
              action={async () => {
                'use server'
                await signOut({ redirectTo: '/' })
              }}
            >
              <button type="submit" className="flex items-center gap-2">
                {session.user?.image && (
                  <Image
                    src={session.user.image}
                    alt={session.user.name ?? ''}
                    width={28}
                    height={28}
                    className="rounded-full"
                  />
                )}
                <span className="text-sm text-gray-400 hover:text-white transition-colors">
                  Sign out
                </span>
              </button>
            </form>
          ) : (
            <Link
              href="/sign-in"
              className="rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20 transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: FilterBar**

Create `src/components/FilterBar.tsx`:
```typescript
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { Status } from '@/types'

const STATUS_TABS: { label: string; value: Status | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Ideas', value: 'idea' },
  { label: 'Shipped', value: 'shipped' },
]

export function FilterBar({ allTags }: { allTags: string[] }) {
  const router = useRouter()
  const params = useSearchParams()
  const activeStatus = params.get('status') ?? 'all'
  const activeTags = params.getAll('tag')

  function setStatus(status: string) {
    const next = new URLSearchParams(params.toString())
    if (status === 'all') next.delete('status')
    else next.set('status', status)
    router.push(`/?${next.toString()}`)
  }

  function toggleTag(tag: string) {
    const next = new URLSearchParams(params.toString())
    const current = next.getAll('tag')
    next.delete('tag')
    if (current.includes(tag)) {
      current.filter((t) => t !== tag).forEach((t) => next.append('tag', t))
    } else {
      ;[...current, tag].forEach((t) => next.append('tag', t))
    }
    router.push(`/?${next.toString()}`)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatus(tab.value)}
            className={`rounded-full px-3 py-1 text-sm transition-colors ${
              activeStatus === tab.value
                ? 'bg-white text-gray-900 font-medium'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {allTags.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`rounded-md px-2.5 py-0.5 text-xs transition-colors ${
                activeTags.includes(tag)
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Header.tsx src/components/FilterBar.tsx
git commit -m "feat: add Header and FilterBar components"
```

---

## Task 10: Root Layout + Gallery Page

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`
- Create: `src/app/page.tsx`

- [ ] **Step 1: Update globals.css**

Replace `src/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: dark;
}

body {
  background-color: #030712;
  color: #f9fafb;
}
```

- [ ] **Step 2: Update root layout**

Replace `src/app/layout.tsx`:
```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Header } from '@/components/Header'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Flova',
  description: 'Apps I\'m building or dreaming up',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-gray-950 text-white antialiased`}>
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Create gallery page**

Create `src/app/page.tsx`:
```typescript
import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getRole, canSeeApp, filterAppFields, parseApp } from '@/lib/roles'
import { AppGrid } from '@/components/AppGrid'
import { FilterBar } from '@/components/FilterBar'
import type { Status } from '@/types'

interface PageProps {
  searchParams: Promise<{ status?: string; tag?: string | string[] }>
}

export default async function GalleryPage({ searchParams }: PageProps) {
  const { status, tag } = await searchParams
  const session = await auth()
  const role = getRole(session?.user?.email)

  const allApps = await prisma.app.findMany({ orderBy: { createdAt: 'desc' } })

  const activeTags = tag ? (Array.isArray(tag) ? tag : [tag]) : []

  const apps = allApps
    .map(parseApp)
    .filter((app) => canSeeApp(app.visibility, role))
    .filter((app) => !status || status === 'all' || app.status === (status as Status))
    .filter((app) => activeTags.length === 0 || activeTags.every((t) => app.tags.includes(t)))
    .map((app) => filterAppFields(app, role))

  const allTags = [...new Set(allApps.flatMap((a) => JSON.parse(a.tags) as string[]))]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Apps</h1>
        <p className="text-gray-400 mt-1 text-sm">Things I&apos;m building or dreaming up.</p>
      </div>
      <Suspense>
        <FilterBar allTags={allTags} />
      </Suspense>
      <AppGrid apps={apps} />
    </div>
  )
}
```

- [ ] **Step 4: Start dev server and verify gallery renders**

```bash
npm run dev
```

Open http://localhost:3000 — expect dark background, Flova header, empty grid with "No apps here yet."

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx src/app/page.tsx
git commit -m "feat: add gallery page with role-filtered app grid"
```

---

## Task 11: Sign-In Page

**Files:**
- Create: `src/app/sign-in/page.tsx`

- [ ] **Step 1: Create sign-in page**

Create `src/app/sign-in/page.tsx`:
```typescript
import { signIn } from '@/lib/auth'

export default function SignInPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="flex flex-col gap-4 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-white">Sign in</h1>
        <p className="text-center text-sm text-gray-400">
          Choose a provider to continue
        </p>
        <form
          action={async () => {
            'use server'
            await signIn('google', { redirectTo: '/' })
          }}
        >
          <button
            type="submit"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-colors"
          >
            Continue with Google
          </button>
        </form>
        <form
          action={async () => {
            'use server'
            await signIn('github', { redirectTo: '/' })
          }}
        >
          <button
            type="submit"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-colors"
          >
            Continue with GitHub
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/sign-in/
git commit -m "feat: add sign-in page with Google and GitHub OAuth"
```

---

## Task 12: App Detail Page

**Files:**
- Create: `src/app/apps/[id]/page.tsx`

- [ ] **Step 1: Create app detail page**

Create `src/app/apps/[id]/page.tsx`:
```typescript
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getRole, canSeeApp, filterAppFields, parseApp } from '@/lib/roles'
import { StatusBadge } from '@/components/StatusBadge'
import { TagChip } from '@/components/TagChip'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AppDetailPage({ params }: PageProps) {
  const { id } = await params
  const session = await auth()
  const role = getRole(session?.user?.email)

  const raw = await prisma.app.findUnique({ where: { id } })
  if (!raw) notFound()

  const parsed = parseApp(raw)
  if (!canSeeApp(parsed.visibility, role)) notFound()

  const app = filterAppFields(parsed, role)

  return (
    <div className="mx-auto max-w-3xl flex flex-col gap-6">
      <Link href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
        ← Back
      </Link>

      {app.screenshot && (
        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10">
          <Image src={app.screenshot} alt={app.name} fill className="object-cover" />
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">{app.name}</h1>
          <StatusBadge status={app.status} />
        </div>
        <p className="text-gray-300">{app.description}</p>

        {app.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {app.tags.map((tag) => <TagChip key={tag} tag={tag} />)}
          </div>
        )}

        {app.liveUrl && (
          <a
            href={app.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 transition-colors"
          >
            View Live App →
          </a>
        )}
      </div>

      {(app.techStack || app.repoUrl) && (
        <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
          {app.techStack && app.techStack.length > 0 && (
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Tech Stack
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {app.techStack.map((t) => <TagChip key={t} tag={t} />)}
              </div>
            </div>
          )}
          {app.repoUrl && (
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Repository
              </h3>
              <a
                href={app.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors break-all"
              >
                {app.repoUrl}
              </a>
            </div>
          )}
        </div>
      )}

      {app.notes && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <h3 className="text-xs font-medium text-amber-400 uppercase tracking-wider mb-2">
            Admin Notes
          </h3>
          <p className="text-sm text-gray-300 whitespace-pre-wrap">{app.notes}</p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/apps/
git commit -m "feat: add app detail page with role-gated fields"
```

---

## Task 13: Admin Layout + App List Table

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`

- [ ] **Step 1: Admin layout with auth guard**

Create `src/app/admin/layout.tsx`:
```typescript
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getRole } from '@/lib/roles'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const role = getRole(session?.user?.email)
  if (role !== 'admin') redirect('/')
  return <>{children}</>
}
```

- [ ] **Step 2: Admin app list table**

Create `src/app/admin/page.tsx`:
```typescript
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { parseApp } from '@/lib/roles'
import { StatusBadge } from '@/components/StatusBadge'
import type { Visibility } from '@/types'

const VISIBILITY_LABEL: Record<Visibility, string> = {
  public: 'Public',
  users: 'Users',
  admin: 'Admin only',
}

export default async function AdminPage() {
  const raw = await prisma.app.findMany({ orderBy: { createdAt: 'desc' } })
  const apps = raw.map(parseApp)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Apps ({apps.length})</h1>
        <Link
          href="/admin/apps/new"
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-colors"
        >
          + New App
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-left text-xs text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Visibility</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {apps.map((app) => (
              <tr key={app.id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 font-medium text-white">{app.name}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={app.status} />
                </td>
                <td className="px-4 py-3 text-gray-400">
                  {VISIBILITY_LABEL[app.visibility]}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/apps/${app.id}/edit`}
                    className="text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/
git commit -m "feat: add admin layout guard and app list table"
```

---

## Task 14: ImageUpload Component

**Files:**
- Create: `src/components/ImageUpload.tsx`

- [ ] **Step 1: Create ImageUpload**

Create `src/components/ImageUpload.tsx`:
```typescript
'use client'

import { useState, useRef, DragEvent } from 'react'
import Image from 'next/image'

interface ImageUploadProps {
  value: string | null
  onChange: (url: string | null) => void
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function uploadFile(file: File) {
    setUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Upload failed')
      }
      const { url } = await res.json() as { url: string }
      onChange(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">Screenshot</label>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`relative cursor-pointer rounded-lg border-2 border-dashed transition-colors ${
          dragging ? 'border-violet-500 bg-violet-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'
        }`}
      >
        {value ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <Image src={value} alt="Screenshot preview" fill className="object-cover" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(null) }}
              className="absolute top-2 right-2 rounded-md bg-black/60 px-2 py-1 text-xs text-white hover:bg-black/80"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-gray-500">
            {uploading ? (
              <p className="text-sm">Uploading...</p>
            ) : (
              <>
                <p className="text-sm">Drop image here or click to upload</p>
                <p className="text-xs mt-1">PNG, JPG, GIF, WebP</p>
              </>
            )}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f) }}
      />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ImageUpload.tsx
git commit -m "feat: add drag-and-drop ImageUpload component"
```

---

## Task 15: Admin New + Edit Form Pages

**Files:**
- Create: `src/app/admin/apps/new/page.tsx`
- Create: `src/app/admin/apps/[id]/edit/page.tsx`

- [ ] **Step 1: Add shared AppFormData type to src/types/index.ts**

Append to `src/types/index.ts`:
```typescript
export interface AppFormData {
  name: string
  description: string
  screenshot: string | null
  status: string
  liveUrl: string
  repoUrl: string
  techStack: string[]
  tags: string[]
  notes: string
  visibility: string
}
```

- [ ] **Step 2: Create new app page**

Create `src/app/admin/apps/new/page.tsx`:
```typescript
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AppForm } from '../_components/AppForm'
import type { AppFormData } from '@/types'

async function createApp(data: AppFormData) {
  'use server'
  const app = await prisma.app.create({
    data: {
      name: data.name,
      description: data.description,
      screenshot: data.screenshot,
      status: data.status,
      liveUrl: data.liveUrl || null,
      repoUrl: data.repoUrl || null,
      techStack: JSON.stringify(data.techStack),
      tags: JSON.stringify(data.tags),
      notes: data.notes || null,
      visibility: data.visibility,
    },
  })
  redirect(`/admin/apps/${app.id}/edit`)
}

export default function NewAppPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-white">New App</h1>
      <AppForm onSubmit={createApp} />
    </div>
  )
}
```

- [ ] **Step 2: Create AppForm shared component**

Create `src/app/admin/apps/_components/AppForm.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChipInput } from '@/components/ChipInput'
import { ImageUpload } from '@/components/ImageUpload'
import type { AppRecord, AppFormData, Status, Visibility } from '@/types'

interface AppFormProps {
  defaultValues?: Partial<AppRecord>
  onSubmit: (data: AppFormData) => Promise<void>
  onDelete?: () => Promise<void>
}

export function AppForm({ defaultValues, onSubmit, onDelete }: AppFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [name, setName] = useState(defaultValues?.name ?? '')
  const [description, setDescription] = useState(defaultValues?.description ?? '')
  const [screenshot, setScreenshot] = useState<string | null>(defaultValues?.screenshot ?? null)
  const [status, setStatus] = useState<Status>(defaultValues?.status ?? 'idea')
  const [liveUrl, setLiveUrl] = useState(defaultValues?.liveUrl ?? '')
  const [repoUrl, setRepoUrl] = useState(defaultValues?.repoUrl ?? '')
  const [techStack, setTechStack] = useState<string[]>(defaultValues?.techStack ?? [])
  const [tags, setTags] = useState<string[]>(defaultValues?.tags ?? [])
  const [notes, setNotes] = useState(defaultValues?.notes ?? '')
  const [visibility, setVisibility] = useState<Visibility>(defaultValues?.visibility ?? 'admin')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit({ name, description, screenshot, status, liveUrl, repoUrl, techStack, tags, notes, visibility })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!onDelete || !confirm('Delete this app? This cannot be undone.')) return
    setDeleting(true)
    try {
      await onDelete()
      router.push('/admin')
    } finally {
      setDeleting(false)
    }
  }

  const inputClass = 'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-600 outline-none focus:border-violet-500 transition-colors'
  const selectClass = `${inputClass} cursor-pointer`

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={() => router.push('/admin')}
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          ← Back to apps
        </button>
        <div className="flex gap-2">
          {onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left column */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Name *</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="My App" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description *</label>
            <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={inputClass} placeholder="What does this app do?" />
          </div>
          <ChipInput label="Tech Stack" value={techStack} onChange={setTechStack} placeholder="Next.js, press Enter..." />
          <ChipInput label="Tags" value={tags} onChange={setTags} placeholder="tool, ai, game..." />
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Notes (admin only)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={inputClass} placeholder="Private notes..." />
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          <ImageUpload value={screenshot} onChange={setScreenshot} />
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as Status)} className={selectClass}>
              <option value="idea">Idea</option>
              <option value="in_progress">In Progress</option>
              <option value="shipped">Shipped</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Visibility</label>
            <select value={visibility} onChange={(e) => setVisibility(e.target.value as Visibility)} className={selectClass}>
              <option value="admin">Admin only</option>
              <option value="users">Signed-in users</option>
              <option value="public">Public</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Live URL</label>
            <input type="url" value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} className={inputClass} placeholder="https://myapp.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Repo URL</label>
            <input type="url" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} className={inputClass} placeholder="https://github.com/..." />
          </div>
        </div>
      </div>
    </form>
  )
}
```

- [ ] **Step 3: Create edit app page**

Create `src/app/admin/apps/[id]/edit/page.tsx`:
```typescript
import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { parseApp } from '@/lib/roles'
import { AppForm } from '../../_components/AppForm'
import type { AppFormData } from '@/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditAppPage({ params }: PageProps) {
  const { id } = await params
  const raw = await prisma.app.findUnique({ where: { id } })
  if (!raw) notFound()
  const app = parseApp(raw)

  async function updateApp(data: AppFormData) {
    'use server'
    await prisma.app.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        screenshot: data.screenshot,
        status: data.status,
        liveUrl: data.liveUrl || null,
        repoUrl: data.repoUrl || null,
        techStack: JSON.stringify(data.techStack),
        tags: JSON.stringify(data.tags),
        notes: data.notes || null,
        visibility: data.visibility,
      },
    })
    redirect('/admin')
  }

  async function deleteApp() {
    'use server'
    await prisma.app.delete({ where: { id } })
    redirect('/admin')
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-white">Edit: {app.name}</h1>
      <AppForm defaultValues={app} onSubmit={updateApp} onDelete={deleteApp} />
    </div>
  )
}
```

- [ ] **Step 4: Verify dev server — test full admin flow**

```bash
npm run dev
```

With `ADMIN_EMAIL` set to your email in `.env.local`:
1. Sign in at http://localhost:3000/sign-in
2. Navigate to http://localhost:3000/admin
3. Click "+ New App", fill in the form, save
4. Verify the app appears in the gallery at http://localhost:3000
5. Click the app to verify the detail page renders

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/apps/
git commit -m "feat: add admin new and edit app pages with AppForm"
```

---

## Task 16: Deployment Setup

**Files:**
- Create: `ecosystem.config.js`
- Create: `nginx.conf`
- Create: `deploy.sh`

- [ ] **Step 1: Create PM2 config**

Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: 'flova',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/var/www/flova',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
}
```

- [ ] **Step 2: Create Nginx config**

Create `nginx.conf` (template — replace `yourdomain.com`):
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

- [ ] **Step 3: Create deploy script**

Create `deploy.sh`:
```bash
#!/bin/bash
set -e

cd /var/www/flova

echo "→ Pulling latest code..."
git pull origin main

echo "→ Installing dependencies..."
npm ci --production=false

echo "→ Running migrations..."
npx prisma migrate deploy

echo "→ Building..."
npm run build

echo "→ Restarting PM2..."
pm2 restart flova || pm2 start ecosystem.config.js

echo "✓ Deploy complete"
```

- [ ] **Step 4: First-time server setup commands (document only — run manually on server)**

On your Ubuntu VPS, run once:
```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx + Certbot
sudo apt install -y nginx certbot python3-certbot-nginx

# Clone repo
sudo mkdir -p /var/www/flova
sudo chown $USER /var/www/flova
git clone <your-repo-url> /var/www/flova

# Create db directory
mkdir -p /var/www/flova/db

# Copy .env.local with real values
nano /var/www/flova/.env.local

# Copy nginx config
sudo cp /var/www/flova/nginx.conf /etc/nginx/sites-available/flova
sudo ln -s /etc/nginx/sites-available/flova /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Get SSL cert
sudo certbot --nginx -d yourdomain.com

# First deploy
bash /var/www/flova/deploy.sh

# PM2 auto-start on reboot
pm2 save
pm2 startup
```

- [ ] **Step 5: Commit**

```bash
chmod +x deploy.sh
git add ecosystem.config.js nginx.conf deploy.sh
git commit -m "feat: add PM2, Nginx, and deploy script for Ubuntu VPS"
```

---

## Done

All tasks complete. The app has:
- Gallery at `/` — role-filtered, status + tag filtering
- App detail at `/apps/[id]` — field visibility by role
- OAuth sign-in at `/sign-in`
- Admin panel at `/admin` — full CRUD, image upload to R2
- PM2 + Nginx deployment config for Ubuntu VPS

Run `npm test` to verify all role utility tests pass before deploying.
