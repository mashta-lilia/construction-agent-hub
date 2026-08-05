"""Unit-tier coverage of the health endpoint (TASKS.md S2-INFRA-01).

Runs fully in-process: `ASGITransport` hands requests to the app object
directly, so there is no socket, no live Postgres and no live Redis. The
lifespan is deliberately not started — `/health` is a liveness probe and has to
answer even when every dependency is down. `/ready`, which does check Postgres
and Redis, belongs to the integration tier instead.

Async client rather than the synchronous `TestClient`: the stack is async end
to end, and `TestClient` starts an event loop of its own that then disagrees
with the loop Tortoise was initialised in (CLAUDE.md §5).
"""

from httpx2 import ASGITransport, AsyncClient

from main import app

EXPECTED_PAYLOAD = {"status": "ok"}


async def _get(path: str) -> tuple[int, dict[str, str]]:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://testserver"
    ) as client:
        response = await client.get(path)
    return response.status_code, response.json()


async def test_api_health_returns_ok() -> None:
    """The documented endpoint: every production path lives under `/api`
    (TASKS.md, "Як читати цей файл").
    """
    status_code, payload = await _get("/api/health")

    assert status_code == 200
    assert payload == EXPECTED_PAYLOAD


async def test_probe_alias_returns_the_same_payload() -> None:
    """The unprefixed alias exists so container probes stay decoupled from API
    versioning — backend/Dockerfile's HEALTHCHECK hits `/health`. It has to
    answer identically, or the probe and the API could disagree about health.
    """
    status_code, payload = await _get("/health")

    assert status_code == 200
    assert payload == EXPECTED_PAYLOAD


def test_only_the_api_path_is_published_in_the_schema() -> None:
    """The probe alias is intentionally kept out of the OpenAPI schema, so the
    published contract — and the TS types generated from it (CLAUDE.md §6) —
    contains `/api` paths only.
    """
    paths = app.openapi()["paths"]

    assert "/api/health" in paths
    assert "/health" not in paths
