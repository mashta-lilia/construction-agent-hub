from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core import CONFIG
from app.routers import routers


def create_app() -> FastAPI:
    app = FastAPI(title="Reconstruction Hub API", redoc_url=None)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=CONFIG.configuration.ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routers are mounted here and only here, always with the /api prefix —
    # no endpoint of this application is reachable outside it.
    for router in routers:
        app.include_router(router, prefix="/api")

    return app


app = create_app()

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app=app, host="0.0.0.0")
