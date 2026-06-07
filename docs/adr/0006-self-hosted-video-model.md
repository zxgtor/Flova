# ADR-0006: Self-Hosted Video Model as a Third Provider

Date: 2026-06-07
Status: Accepted

## Context
ADR-0003 picked Replicate as the interim text-to-video backend. Replicate is
fast to integrate and works for low volume, but:

1. Per-render cost dominates once usage grows.
2. Some users want prompts to never leave the perimeter.
3. We'll eventually want fine-tuned style LoRAs that Replicate can't host.

The foundation spec's original direction — owned GPUs + cloud burst — is the
right long-term path. We just don't want to wait until a full GPU
orchestrator is in place before any of it ships.

## Decision
Add **`LocalModelVideoProvider`** as a third implementation of `VideoProvider`,
selected via `VIDEO_PROVIDER=local`.

- Uses HuggingFace `diffusers` to load any text-to-video pipeline whose call
  signature matches the standard (`prompt`, `num_inference_steps`, `width`,
  `height`, `num_frames`).
- Heavy deps (torch, diffusers, transformers, accelerate, imageio+ffmpeg) live
  in an **optional `[local-gpu]` extra** so the default install path stays slim.
- All imports inside the provider are **lazy** — without the extra installed,
  the rest of the API boots normally and tests pass.
- The provider is **inline** (no poll round-trip): worker calls `start()`,
  diffusers runs synchronously, output mp4 is returned via `inline_bytes`.
  Matches the stub's behavior, lets us reuse the worker code path unchanged.
- `LocalModelError` carries actionable messages: "set LOCAL_MODEL_ID",
  "install local-gpu extra", "no `.frames` returned" (model incompatibility).

Operator docs live in `deploy/SELF_HOSTED_MODEL.md`.

## Consequences
- **No GPU orchestration yet.** One model copy per worker process. Vertical
  scaling: run more workers; horizontal scaling: more boxes. A real
  orchestrator (queue priority, burst to cloud) is a separate, larger ADR.
- **One render at a time per worker.** Frontiers like in-flight queuing remain
  Celery's job; we did not introduce a separate state machine.
- **Cost moves from per-call to capex+opex.** Replicate is still the right
  choice for early traction; switch when render volume crosses the break-even.
- **Replicate stays the documented baseline** (ADR-0003 still in effect). This
  ADR adds a third option, doesn't retire one.
- **Frontend doesn't care.** The provider abstraction held — the worker calls
  `get_video_provider().start(prompt)` and the result lands in the same
  storage / file row.

## Open follow-ups (deferred)
- Cloud-burst orchestrator (RunPod, Vast, salad.com). The skeleton's worker
  would gain a "where to run" decision before dispatching.
- LoRA / inpainting / controlnet support. Today we only forward `prompt`.
- VRAM-aware scheduling. Currently first-come-first-served per worker.
- Pre-warming. Today the first request after a worker restart pays the
  multi-minute model-load cost.
