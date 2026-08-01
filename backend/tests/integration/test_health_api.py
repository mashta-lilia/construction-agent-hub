"""HTTP contract of the application skeleton: the health endpoint answers
under `/api`, and nothing is reachable outside that prefix.
"""

from starlette.testclient import TestClient

from main import app


def test_health_is_served_under_the_api_prefix() -> None:
    with TestClient(app) as client:
        response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_unprefixed_health_is_not_reachable() -> None:
    with TestClient(app) as client:
        response = client.get("/health")

    assert response.status_code == 404


def test_no_application_route_is_mounted_outside_the_api_prefix() -> None:
    """Asserted over every endpoint the app exposes rather than one path: a
    router mounted without the prefix in some future ticket has to fail here,
    not only when someone remembers to write a test for it.

    Read off the OpenAPI schema rather than `app.routes`, which nests routers
    behind a wrapper object instead of flattening them to `APIRoute`s. The
    schema also naturally excludes FastAPI's own `/docs` and `/openapi.json`,
    which are documentation, not endpoints of this service.
    """
    paths = sorted(app.openapi()["paths"])

    assert paths, "no endpoints registered — the assertion below would pass vacuously"
    assert all(path.startswith("/api/") for path in paths), paths
