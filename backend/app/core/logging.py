import logging

import structlog


def configure_logging(level: int) -> None:
    """JSON structured logs with the request-id contextvar merged in
    automatically (CLAUDE.md §11) — no raw project data is logged here;
    callers are responsible for not passing sensitive fields into events.

    Stdlib loggers (uvicorn, asyncpg, ...) are routed through the same
    ProcessorFormatter pipeline so every log line is JSON, not just the
    ones structlog itself emits.
    """
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
        ],
        wrapper_class=structlog.make_filtering_bound_logger(level),
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )

    formatter = structlog.stdlib.ProcessorFormatter(
        processors=[
            structlog.stdlib.ProcessorFormatter.remove_processors_meta,
            structlog.processors.format_exc_info,
            structlog.processors.JSONRenderer(),
        ],
    )
    handler = logging.StreamHandler()
    handler.setFormatter(formatter)
    root_logger = logging.getLogger()
    root_logger.handlers = [handler]
    root_logger.setLevel(level)
