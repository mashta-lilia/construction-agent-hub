from fastapi import FastAPI

# Importing `settings` forces `Settings()` to evaluate at process start —
# without this, nothing in the backend process ever reads it, and a missing
# POSTGRES_DSN/REDIS_URL/JWT_SECRET would go unnoticed (the container would
# boot and /health would report "ok") until something actually used it.
from app.core.config import settings
from app.routers.health.view import router as health_router

app = FastAPI(title="Reconstruction Hub API")
app.state.settings = settings
app.include_router(health_router)
