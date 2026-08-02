from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from tortoise.contrib.fastapi import RegisterTortoise

from app.core import CONFIG, DEBUG, REDIS
from app.database import TORTOISE_ORM
from app.routers import health_router, routers


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # `app` goes through the constructor, not `RegisterTortoise(...)(app)` —
    # RegisterTortoise.__call__ discards its arguments and returns self, so
    # the callable form never binds the app and leaves
    # `app.state._tortoise_context` unset.
    async with RegisterTortoise(app, config=TORTOISE_ORM, generate_schemas=DEBUG):
        yield
    # REDIS is a module-level client (app/core), constructed once at import
    # for every process that imports it — closed here so shutdown doesn't
    # leak the connection pool or emit unclosed-connection warnings.
    await REDIS.aclose()


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

    # 127.0.0.1, not 0.0.0.0: this path is only for ad-hoc local runs — the
    # container CMD in Dockerfile invokes uvicorn directly and doesn't go
    # through here, so this doesn't affect the deployed binding.
    uvicorn.run(app=app, host="127.0.0.1")
