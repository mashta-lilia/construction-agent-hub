import logging

import structlog


def configure_logging(level: int) -> None:
    """JSON structured logs with the request-id contextvar merged in
    automatically (CLAUDE.md §11) — no raw project data is logged here;
    callers are responsible for not passing sensitive fields into events.
    """
    logging.basicConfig(format="%(message)s", level=level)

    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.JSONRenderer(),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(level),
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=True,
    )
