import logging
from typing import Final

from redis.asyncio import Redis

from app.utils.classes.config import Config

DEBUG: Final[bool] = True  # TODO: env-driven once staging/prod envs exist
LOG_LEVEL: Final[int] = logging.INFO

CONFIG: Final = Config(".env")

REDIS: Redis = Redis(
    host=CONFIG.redis.HOST,
    port=CONFIG.redis.PORT,
    db=CONFIG.redis.DB or 0,
    password=CONFIG.redis.PASSWORD,
)

__all__ = ("CONFIG", "REDIS", "DEBUG", "LOG_LEVEL")
