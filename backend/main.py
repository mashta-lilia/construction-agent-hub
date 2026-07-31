from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from tortoise.contrib.fastapi import RegisterTortoise

from app.core import CONFIG, DEBUG
from app.database import TORTOISE_ORM
from app.routers import health_router, routers


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    async with RegisterTortoise(config=TORTOISE_ORM, generate_schemas=DEBUG)(app):
        yield


def create_app() -> FastAPI:
    app = FastAPI(title="Reconstruction Hub API", lifespan=lifespan, redoc_url=None)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=CONFIG.configuration.ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health_router)
    for router in routers:
        app.include_router(router, prefix="/api")

    return app


app = create_app()

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app=app, host="0.0.0.0")
