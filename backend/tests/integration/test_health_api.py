"""Requires real Postgres + Redis reachable at the host/port set in
tests/conftest.py (defaults match docker-compose's published dev ports) —
this is the "real test DB" tier per CLAUDE.md §5, not a mocked unit test.
"""

from starlette.testclient import TestClient

from main import app


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

    `/__boom` is added to `app` — the shared module-level singleton every
    other test in the process also imports — inside a try/finally that
    always removes it again, otherwise every later test in the process would
    see a live route that always raises, and outcomes would start depending
    on file/execution order.
    """
    app.add_api_route("/__boom", _boom, methods=["GET"])
    try:
        with TestClient(app, raise_server_exceptions=False) as client:
            ok = client.get("/health")
            assert ok.headers.get("X-Request-ID")

            boom = client.get("/__boom")
            assert boom.status_code == 500
            assert boom.headers.get(
                "X-Request-ID"
            ), "500 response lost the correlation header"
            # header and body must agree, otherwise correlation is worse than useless
            assert boom.headers["X-Request-ID"] == boom.json()["error"]["request_id"]
    finally:
        app.router.routes = [
            route
            for route in app.router.routes
            if getattr(route, "path", None) != "/__boom"
        ]

    with TestClient(app, raise_server_exceptions=False) as client:
        assert client.get("/__boom").status_code == 404

    # an inbound ID is honoured rather than replaced
    with TestClient(app) as client:
        echoed = client.get("/health", headers={"X-Request-ID": "caller-supplied-id"})
    assert echoed.headers["X-Request-ID"] == "caller-supplied-id"


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
