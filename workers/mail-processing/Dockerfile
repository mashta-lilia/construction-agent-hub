# Build context MUST be repo root (see docker-compose.yml) so this can copy
# backend/ without violating Docker's build-context boundary.
FROM python:3.14-slim-bookworm@sha256:86f975aca15cf04a40b399eebede9aea7c82eae084d1f1a0a6ef6bcaae871a30

COPY --from=ghcr.io/astral-sh/uv:latest@sha256:cf4eedcaa81655197f625739489effcbe71b61ceb1506f332c3facae5deceded /uv /uvx /bin/

WORKDIR /app

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    PYTHONUNBUFFERED=1

COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync --frozen --no-install-project --no-dev

COPY backend/ .
RUN uv sync --frozen --no-dev

# Run as a dedicated unprivileged user rather than root. Owns /app so `uv run`
# can use the already-synced .venv, and has a home dir for uv's cache.
RUN useradd --create-home --uid 10001 appuser \
    && chown -R appuser:appuser /app
USER appuser

CMD ["uv", "run", "--no-sync", "arq", "app.workers.mail_processing.WorkerSettings"]
