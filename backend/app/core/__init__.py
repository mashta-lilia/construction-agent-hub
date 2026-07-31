import logging
from typing import Any, Final

from arq.connections import RedisSettings
from redis.asyncio import Redis

from app.utils.classes.config import Config

CONFIG: Final = Config(".env")

# Dev-only: gates Tortoise's schema auto-generation in main.py. False unless
# CONF_DEBUG is explicitly set, so staging/prod never auto-generate schema.
DEBUG: Final[bool] = CONFIG.configuration.DEBUG
LOG_LEVEL: Final[int] = logging.INFO


def redis_connection_params() -> dict[str, Any]:
    """Single source of truth for Redis connection settings — used by the
    client below and by every ARQ worker (via `arq_redis_settings`).
    """
    return {
        "host": CONFIG.redis.HOST,
        "port": CONFIG.redis.PORT,
        "password": CONFIG.redis.PASSWORD,
        "db": CONFIG.redis.DB,
    }


def arq_redis_settings() -> RedisSettings:
    """The same connection as `REDIS`, in the shape ARQ wants — it spells the
    database field `database` where redis-py spells it `db`.
    """
    params = redis_connection_params()
    return RedisSettings(
        host=params["host"],
        port=params["port"],
        password=params["password"],
        database=params["db"],
    )


REDIS: Redis = Redis(**redis_connection_params())

__all__ = (
    "CONFIG",
    "REDIS",
    "DEBUG",
    "LOG_LEVEL",
    "redis_connection_params",
    "arq_redis_settings",
)
