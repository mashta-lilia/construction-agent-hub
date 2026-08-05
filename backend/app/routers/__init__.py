from app.routers.health.view import router as health_router

# Each new domain router gets added here as it's built; main.py mounts every
# entry under /api. `health_router` is excluded from this tuple because main.py
# mounts it twice — under /api as the documented endpoint, and unprefixed as a
# probe alias — which this loop cannot express.
routers: tuple = ()

__all__ = ("routers", "health_router")
