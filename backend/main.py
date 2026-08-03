from fastapi import FastAPI

from app.routers.health.view import router as health_router

app = FastAPI(title="Reconstruction Hub API")
app.include_router(health_router)
