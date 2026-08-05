"""Requires real Postgres + Redis reachable at the host/port set in
tests/conftest.py (defaults match docker-compose's published dev ports) —
this is the "real test DB" tier per CLAUDE.md §5, not a mocked unit test.
"""

import uuid

import pytest
from starlette.testclient import TestClient

from main import app, create_app


def test_health_and_ready_happy_path() -> None:
    with TestClient(app) as client:
        health_response = client.get("/health")
        assert health_response.status_code == 200
        assert health_response.json() == {"status": "ok"}

        ready_response = client.get("/ready")
        assert ready_response.status_code == 200
        body = ready_response.json()
        assert body["status"] == "ok"
        assert body["checks"] == {"database": "ok", "redis": "ok"}


def test_api_prefixed_health_is_not_mounted() -> None:
    """Health is deliberately mounted unprefixed, never under /api — this
    pins that decision so it can't silently regress.
    """
    with TestClient(app) as client:
        response = client.get("/api/health")
    assert response.status_code == 404


def test_request_id_header_is_returned_on_success_and_errors() -> None:
    """The header must survive the error path too: an exception makes
    `await call_next(...)` re-raise, so RequestIDMiddleware never gets to set
    it and the exception handler has to.

    `/__boom` is registered on a throwaway `create_app()` instance instead of
    the shared module-level `app` every other test in the process imports —
    mutating that singleton left a live always-raising route for every test
    that ran afterward, with outcomes depending on file/execution order.
    """
    boom_app = create_app()
    boom_app.add_api_route("/__boom", _boom, methods=["GET"])

    with TestClient(boom_app, raise_server_exceptions=False) as client:
        ok = client.get("/health")
        assert ok.headers.get("X-Request-ID")

        boom = client.get("/__boom")
        assert boom.status_code == 500
        assert boom.headers.get(
            "X-Request-ID"
        ), "500 response lost the correlation header"
        # header and body must agree, otherwise correlation is worse than useless
        assert boom.headers["X-Request-ID"] == boom.json()["error"]["request_id"]

    # a well-formed inbound ID is honoured rather than replaced
    with TestClient(app) as client:
        echoed = client.get(
            "/health", headers={"X-Request-ID": "5f6a6b1e-9b8d-4a2c-8e7a-1a2b3c4d5e6f"}
        )
    assert echoed.headers["X-Request-ID"] == "5f6a6b1e-9b8d-4a2c-8e7a-1a2b3c4d5e6f"


@pytest.mark.parametrize(
    "malformed",
    [
        "caller-supplied-id",
        "A" * 8192,
        "",
    ],
)
def test_malformed_inbound_request_id_is_replaced_not_trusted(malformed: str) -> None:
    """A caller-controlled header must not become an unbounded/unvalidated
    correlation ID: an 8KB value would balloon log volume, and a fixed
    non-UUID value reused across requests would defeat per-request
    correlation. Anything that isn't a canonical UUID gets replaced with a
    freshly generated one instead.
    """
    with TestClient(app) as client:
        response = client.get("/health", headers={"X-Request-ID": malformed})
    returned = response.headers["X-Request-ID"]
    assert returned != malformed
    uuid.UUID(returned)  # doesn't raise — a real UUID was generated


async def _boom() -> None:
    raise RuntimeError("kaboom")


def test_cors_preflight_still_gets_a_request_id() -> None:
    """CORSMiddleware answers OPTIONS preflight requests directly, without
    calling into any middleware nested inside it — RequestIDMiddleware must
    be the outermost layer (added last) or preflight responses silently lose
    both the X-Request-ID header and the log correlation context.
    """
    with TestClient(app) as client:
        response = client.options(
            "/health",
            headers={
                "Origin": "http://localhost",
                "Access-Control-Request-Method": "GET",
            },
        )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost"
    assert response.headers.get("X-Request-ID")
