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
