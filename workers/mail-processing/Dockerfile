# Build context MUST be repo root (see docker-compose.yml) so this can copy
# backend/ without violating Docker's build-context boundary.
FROM python:3.14-slim-bookworm

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

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
