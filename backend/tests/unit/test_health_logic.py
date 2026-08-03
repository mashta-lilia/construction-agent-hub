import json
from unittest.mock import AsyncMock, patch

import pytest

from app.routers.health.view import ready


class _FakeConnection:
    def __init__(self, should_fail: bool):
        self.should_fail = should_fail

    async def execute_query(self, *_args, **_kwargs):
        if self.should_fail:
            raise ConnectionError("db unreachable")
        return None


@pytest.mark.parametrize(
    ("db_fails", "redis_fails", "expected_status", "expected_body_status", "expected_checks"),
    [
        (False, False, 200, "ok", {"database": "ok", "redis": "ok"}),
        (True, False, 503, "error", {"database": "error", "redis": "ok"}),
        (False, True, 503, "error", {"database": "ok", "redis": "error"}),
    ],
)
async def test_ready_reflects_dependency_health(
    db_fails: bool,
    redis_fails: bool,
    expected_status: int,
    expected_body_status: str,
    expected_checks: dict[str, str],
) -> None:
    fake_connection = _FakeConnection(should_fail=db_fails)

    with (
        patch("app.routers.health.view.get_connection", return_value=fake_connection),
        patch(
            "app.routers.health.view.REDIS.ping",
            new=AsyncMock(side_effect=ConnectionError if redis_fails else None),
        ),
    ):
        response = await ready()

    # Assert the documented JSON contract, not merely that a body exists —
    # otherwise any payload shape would satisfy this test.
    assert response.status_code == expected_status
    assert json.loads(response.body) == {
        "status": expected_body_status,
        "checks": expected_checks,
    }
