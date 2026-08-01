from fastapi import APIRouter

from app.routers.health.view import router as health_router

# Every router of the application belongs in this tuple; main.py mounts the
# whole tuple under /api. Adding a router anywhere else would put an endpoint
# outside the required prefix, so new domain routers get appended here.
routers: tuple[APIRouter, ...] = (health_router,)

__all__ = ("routers", "health_router")
