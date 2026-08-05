"""Requires real Postgres + Redis reachable at the host/port set in
tests/conftest.py (defaults match docker-compose's published dev ports) —
this is the "real test DB" tier per CLAUDE.md §5, not a mocked unit test.
"""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from httpx2 import ASGITransport, AsyncClient

from main import app


@asynccontextmanager
async def _client(*, raise_app_exceptions: bool = True) -> AsyncIterator[AsyncClient]:
    """An async client with the app's lifespan running around it.

    `ASGITransport` does not emit lifespan events on its own, so without the
    explicit lifespan context Tortoise would never be initialised and `/ready`
    would report the database as down. `TestClient` did this implicitly, but at
    the cost of running an event loop of its own that disagrees with the loop
    Tortoise lives in (CLAUDE.md §5).
    """
    async with app.router.lifespan_context(app):
        transport = ASGITransport(app=app, raise_app_exceptions=raise_app_exceptions)
        async with AsyncClient(
            transport=transport, base_url="http://testserver"
        ) as client:
            yield client


async def test_health_and_ready_happy_path() -> None:
    async with _client() as client:
        health_response = await client.get("/api/health")
        assert health_response.status_code == 200
        assert health_response.json() == {"status": "ok"}

        ready_response = await client.get("/api/ready")
        assert ready_response.status_code == 200
        body = ready_response.json()
        assert body["status"] == "ok"
        assert body["checks"] == {"database": "ok", "redis": "ok"}


async def test_health_is_reachable_under_api_and_as_probe_alias() -> None:
    """Both mount points have to stay reachable, for different reasons:
    `/api/...` is the documented contract (TASKS.md S2-INFRA-01 — no production
    endpoint outside the prefix), while the unprefixed alias is what
    backend/Dockerfile's HEALTHCHECK and orchestrator probes call, so they do
    not break when the API is versioned. Losing either one is a regression.
    """
    async with _client() as client:
        for path in ("/api/health", "/health"):
            assert (await client.get(path)).status_code == 200, path
        for path in ("/api/ready", "/ready"):
            assert (await client.get(path)).status_code == 200, path


async def test_request_id_header_is_returned_on_success_and_errors() -> None:
    """The header must survive the error path too: an exception makes
    `await call_next(...)` re-raise, so RequestIDMiddleware never gets to set
    it and the exception handler has to.
    """
    app.add_api_route("/__boom", _boom, methods=["GET"])

    async with _client(raise_app_exceptions=False) as client:
        ok = await client.get("/api/health")
        assert ok.headers.get("X-Request-ID")

        boom = await client.get("/__boom")
        assert boom.status_code == 500
        assert boom.headers.get(
            "X-Request-ID"
        ), "500 response lost the correlation header"
        # header and body must agree, otherwise correlation is worse than useless
        assert boom.headers["X-Request-ID"] == boom.json()["error"]["request_id"]

        # an inbound ID is honoured rather than replaced
        echoed = await client.get(
            "/api/health", headers={"X-Request-ID": "caller-supplied-id"}
        )
    assert echoed.headers["X-Request-ID"] == "caller-supplied-id"


async def _boom() -> None:
    raise RuntimeError("kaboom")


async def test_cors_preflight_still_gets_a_request_id() -> None:
    """CORSMiddleware answers OPTIONS preflight requests directly, without
    calling into any middleware nested inside it — RequestIDMiddleware must
    be the outermost layer (added last) or preflight responses silently lose
    both the X-Request-ID header and the log correlation context.
    """
    async with _client() as client:
        response = await client.options(
            "/api/health",
            headers={
                "Origin": "http://localhost",
                "Access-Control-Request-Method": "GET",
            },
        )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost"
    assert response.headers.get("X-Request-ID")
