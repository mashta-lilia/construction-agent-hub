import re
import uuid
from collections.abc import Awaitable, Callable

import structlog
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

# Canonical UUID string only (fixed 36 chars) — an inbound X-Request-ID is a
# caller-controlled header, so accepting it unbounded/unvalidated lets an
# attacker balloon log volume with an 8KB value or defeat correlation by
# reusing one fixed ID across every request. Anything that doesn't match gets
# replaced with a freshly generated one rather than rejected, since the
# header is optional input, not a contract callers must get right.
_REQUEST_ID_PATTERN = re.compile(
    r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
)


def _is_valid_request_id(value: str) -> bool:
    return bool(_REQUEST_ID_PATTERN.fullmatch(value))


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Assigns a correlation ID to every request — threaded through
    structlog's contextvars so it shows up on every log line for the
    duration of the request (CLAUDE.md §11), and echoed back as a response
    header for client-side/log correlation.
    """

    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        inbound = request.headers.get("X-Request-ID")
        request_id = (
            inbound if inbound and _is_valid_request_id(inbound) else str(uuid.uuid4())
        )
        request.state.request_id = request_id

        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(request_id=request_id)

        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response


__all__ = ("RequestIDMiddleware",)
