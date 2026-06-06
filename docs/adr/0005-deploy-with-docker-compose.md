# ADR-0005: Single-Host Deploy via Docker Compose

Date: 2026-06-06
Status: Accepted

## Context
Flova has grown to five processes (postgres, redis, api, worker, web). Going
to production needs:

1. Reproducible builds.
2. One command to bring the stack up.
3. A simple migration story.
4. A TLS termination point.

We're early enough that a single VPS is plenty. Kubernetes / managed services
would be overkill and lock us in.

## Decision
- **Per-service Dockerfile.** Multi-stage where it helps (web standalone). Both
  images are slim Linux bases — the api image is ~200 MB, web ~150 MB.
- **One `docker-compose.yml`** for everything (postgres / redis / api / worker
  / web). It works for local dev as-is. A small **`docker-compose.prod.yml`**
  layer adds `restart: unless-stopped`, hides internal ports, and brings in an
  `nginx` service.
- **Nginx reverse-proxies `/api/*` to api and everything else to web.** Stripe
  webhook gets its own block with `proxy_request_buffering off` so signature
  verification stays valid.
- **Migrations on api startup.** The api container runs `alembic upgrade head`
  before `uvicorn`. This is safe because alembic is idempotent and we always
  ship migrations with the code that needs them.
- **Build-time `NEXT_PUBLIC_API_BASE`.** Frontend bakes this into the client
  bundle (Next.js requirement for `NEXT_PUBLIC_*`). Compose passes it as a
  build arg so prod hosts get the right value baked in.
- **CI builds both images.** A `docker` job in `.github/workflows/ci.yml`
  builds the api and web images on every PR with GHA layer cache. Cheap
  insurance against "Dockerfile drifted".

## Consequences
- **All five services on one box.** Cheap, simple, fine until ~thousands of
  active users. Scaling out means moving to a managed Postgres + Redis and
  cloning the api/worker containers behind a load balancer — Kubernetes
  optional at that point.
- **Local dev now needs Docker.** That's already the case for postgres /
  redis, and we've made it a one-liner.
- **Secrets live in `.env` on the host.** Not Vault / SOPS / SSM. Acceptable
  at this scale; upgrade when the team grows.
- **No CI/CD push yet.** Images are built but not published. Adding a "push
  to ghcr.io on `main`" step is one short follow-up; the deploy story
  currently relies on `git pull && docker compose build`.
- **Worker container shares the api image.** Code and deps stay in lockstep;
  the only difference is the command (`celery worker`).
