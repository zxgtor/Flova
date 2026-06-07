# Self-Hosted Text-to-Video Model

Flova ships with three VideoProviders. Two are zero-infra (stub + Replicate),
this third one runs the model on **your own GPU**. Use it when:

- Per-render cost on Replicate is hurting,
- You need to keep prompts on-prem, or
- You want to ship a fine-tuned LoRA we can't run upstream.

## What you need

- A Linux box with a **CUDA-capable NVIDIA GPU**. Bare minimum: 12 GB VRAM
  (`cerspense/zeroscope_v2_576w`). Realistic: 24 GB
  (`Wan-AI/Wan2.1-T2V-1.3B`, `ByteDance/AnimateDiff-Lightning`).
- ffmpeg on PATH (the `imageio[ffmpeg]` wheel installs it portably; system
  ffmpeg works too).
- Python 3.11+.

## 1. Install the extra

```bash
cd apps/api
pip install -e ".[local-gpu]"
```

This pulls **~2 GB** of wheels: torch, diffusers, transformers, accelerate,
imageio+ffmpeg.

## 2. Pick a model

Any HuggingFace diffusers text-to-video pipeline whose call signature accepts
`prompt`, `num_inference_steps`, `width`, `height`, `num_frames`. Tested ones:

| Model | VRAM | Notes |
|---|---|---|
| `Wan-AI/Wan2.1-T2V-1.3B` | 16–24 GB | High-quality short clips |
| `cerspense/zeroscope_v2_576w` | 12 GB | Faster, lower-res |
| `ByteDance/AnimateDiff-Lightning` | 12 GB | Step-distilled, very fast |

## 3. Configure

`apps/api/.env`:

```
VIDEO_PROVIDER=local
LOCAL_MODEL_ID=Wan-AI/Wan2.1-T2V-1.3B

# Tunables — leave default if unsure.
LOCAL_MODEL_DTYPE=float16        # or bfloat16 / float32
LOCAL_MODEL_STEPS=25
LOCAL_MODEL_WIDTH=512
LOCAL_MODEL_HEIGHT=320
LOCAL_MODEL_NUM_FRAMES=24
LOCAL_MODEL_FPS=8
```

## 4. Pre-download weights (recommended)

The first request would otherwise stall the worker for several minutes:

```bash
python -c "from diffusers import DiffusionPipeline; \
DiffusionPipeline.from_pretrained('Wan-AI/Wan2.1-T2V-1.3B')"
```

## 5. Run the Celery worker on the GPU host

```bash
celery -A flova_api.worker.celery_app worker --loglevel=info
```

The API container can stay on its CPU host; only the worker needs the GPU.

## 6. Verify

Submit a render from the UI. First call cold-loads the model (slow), subsequent
calls reuse the in-process pipeline.

## Troubleshooting

- `LocalModelError: local-gpu extra` → forgot `pip install -e ".[local-gpu]"`.
- `torch.cuda.is_available() == False` → install the CUDA-matching torch wheel
  (see https://pytorch.org/get-started/locally).
- `Pipeline returned no .frames` → the model's output shape differs from the
  diffusers standard. Open an issue; we'll extend `_extract_frames`.
- OOM → drop `LOCAL_MODEL_HEIGHT/WIDTH/NUM_FRAMES`, or pick a smaller model.

## Known limits

- **Synchronous in worker.** One render at a time per worker. Spin up more
  worker processes to fan out (`--concurrency N`), but each gets its own model
  copy on the GPU.
- **No queue priority.** All renders share one FIFO; paid tiers don't jump.
- **No retry on OOM.** A failure marks the job as `failed`; the user resubmits.

These earn fixes when usage justifies them.
