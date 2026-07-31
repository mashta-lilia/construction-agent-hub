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

CMD ["uv", "run", "arq", "app.workers.report_generation.WorkerSettings"]
