from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from tortoise.contrib.fastapi import RegisterTortoise

from app.core import CONFIG, DEBUG, LOG_LEVEL, REDIS
from app.core.logging import configure_logging
from app.database import TORTOISE_ORM
from app.routers import health_router, routers
from app.utils.exceptions import AppError
from app.utils.middlewares import RequestIDMiddleware


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
    configure_logging(LOG_LEVEL)

    app = FastAPI(title="Reconstruction Hub API", lifespan=lifespan, redoc_url=None)

    app.add_middleware(RequestIDMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=CONFIG.configuration.ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    def _error_response(request: Request, status_code: int, code: str, message: str) -> JSONResponse:
        """Error responses are built here, not by RequestIDMiddleware: an
        exception makes `await call_next(request)` re-raise, so the middleware
        never reaches the line that sets the header. Without setting it here,
        clients get `request_id` in the body but no X-Request-ID header on
        exactly the responses where correlation matters most.
        """
        request_id = getattr(request.state, "request_id", None)
        return JSONResponse(
            status_code=status_code,
            content={"error": {"code": code, "message": message, "request_id": request_id}},
            headers={"X-Request-ID": request_id} if request_id else None,
        )

    @app.exception_handler(AppError)
    async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
        return _error_response(request, exc.status_code, exc.code, exc.message)

    @app.exception_handler(Exception)
    async def unhandled_error_handler(request: Request, exc: Exception) -> JSONResponse:
        structlog.get_logger().exception("unhandled_error")
        return _error_response(request, 500, "internal_error", "Internal server error")

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
