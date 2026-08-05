from typing import ClassVar

from arq.connections import RedisSettings

from app.core.config import settings


async def startup(ctx: dict) -> None:
    ctx["ready"] = True


async def shutdown(ctx: dict) -> None:
    pass


async def noop(ctx: dict) -> None:
    """Placeholder task — ARQ requires at least one registered function.

    A dedicated mail-processing ticket replaces this with actual
    @task-decorated functions.
    """


class WorkerSettings:
    """Placeholder ARQ worker entrypoint per CLAUDE.md §2.2 (one background
    job type = one worker module). Real task functions land in a dedicated
    mail-processing ticket.
    """

    functions: ClassVar = [noop]
    on_startup = startup
    on_shutdown = shutdown
    redis_settings = RedisSettings.from_dsn(settings.redis_url)
