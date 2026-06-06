FROM python:3.12-slim AS base

# Quiet apt + bytecode + tini for clean PID 1 signal handling.
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends tini ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies first so a code-only change reuses the layer.
COPY pyproject.toml ./
RUN pip install --upgrade pip \
    && pip install -e ".[dev]"

# Copy source last.
COPY src ./src
COPY alembic ./alembic
COPY alembic.ini ./

# Storage root for LocalFs provider; mount a volume in production.
RUN mkdir -p /app/storage

ENV ENV=prod \
    STORAGE_LOCAL_ROOT=/app/storage \
    PYTHONPATH=/app/src

EXPOSE 8000
ENTRYPOINT ["tini", "--"]

# Default command runs the API. The worker service in compose overrides this
# to `celery -A flova_api.worker.celery_app worker --loglevel=info`.
CMD ["uvicorn", "flova_api.app:app", "--host", "0.0.0.0", "--port", "8000"]
