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
