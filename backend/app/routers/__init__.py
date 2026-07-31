from app.routers.health.view import router as health_router

# Each new domain router gets added here as it's built. `health_router` is
# deliberately excluded from this tuple — it is mounted unprefixed in
# main.py, never under /api, so container health probes stay decoupled
# from API versioning.
routers: tuple = ()

__all__ = ("routers", "health_router")
