# ADR-0003: Third-Party Video API Before Self-Hosted Models

Date: 2026-06-06
Status: Accepted (interim)

## Context
The foundation spec calls for self-hosted open-source video models on owned GPUs +
cloud burst (Wan / HunyuanVideo / CogVideoX). That is a months-long project.
Meanwhile the platform was rendering placeholder text files via the stub provider
— the entire frontend / queue / storage path was real, but the "AI" was fake.

## Decision
Introduce a `VideoProvider` Protocol with three deliberate properties:

1. **Provider-agnostic worker.** `worker.render_task` knows about `VideoProvider`,
   never about Replicate / Luma / Runway / a self-hosted model. Swapping providers
   is one env var.
2. **Stub provider stays.** Default `VIDEO_PROVIDER=stub` keeps tests + offline dev
   working with zero cost. CI, local hacking, and demos never need a token.
3. **Replicate first.** A single REST surface that fronts dozens of text-to-video
   models. Any model with a `prompt` input works without code changes.

We also added a `RenderJob.external_job_id` column so we can correlate our DB row
with the upstream prediction (for debugging, manual cancel, future polling
robustness).

## Consequences
- **Real video output now possible** — set two env vars and the platform produces
  real mp4 files end-to-end.
- **Cost moves to per-call.** Replicate billing replaces the (would-be) GPU
  infrastructure cost. Acceptable for early traction; revisit when usage justifies
  self-hosting.
- **Tech debt:** no idempotency on Celery retry (a retried task starts a second
  Replicate prediction). Acceptable while `task_always_eager` is on; needs a fix
  when a real broker arrives.
- **Foundation spec's "self-hosted + cloud burst"** is now an *eventual* target,
  not the immediate path. ADR-0002 remains in effect; this overlays it.
