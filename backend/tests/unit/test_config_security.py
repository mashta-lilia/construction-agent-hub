"""SecurityInfo's JWT_SECRET validation — separate from test_security.py since
this is app/utils/classes/config.py's concern, not app/core/security.py's.
"""

import os
from unittest.mock import patch

import pytest

from app.utils.classes.config import SecurityInfo
from app.utils.exceptions import InvalidEnvironmentError


def _security_info_with(
    secret: str, access_minutes: str = "20", refresh_minutes: str = "10080"
) -> SecurityInfo:
    env = {
        "JWT_SECRET": secret,
        "JWT_ACCESS_EXPIRE_MINUTES": access_minutes,
        "JWT_REFRESH_EXPIRE_MINUTES": refresh_minutes,
    }
    with patch.dict(os.environ, env):
        return SecurityInfo()


@pytest.mark.parametrize(
    "placeholder",
    [
        "change-me",
        "change-me-to-a-random-secret",
        "local-dev-only-generate-a-real-secret-before-any-real-use",
    ],
)
def test_rejects_the_committed_env_example_placeholder(placeholder: str) -> None:
    """The exact strings shipped in .env.example — if one of these is ever
    deployed verbatim, HS256 is offline-brute-forceable from a single
    captured token, since the "secret" is public in this repository.
    """
    with pytest.raises(InvalidEnvironmentError):
        _security_info_with(placeholder)


def test_rejects_a_secret_shorter_than_the_minimum() -> None:
    with pytest.raises(InvalidEnvironmentError):
        _security_info_with("a" * 31)


def test_accepts_a_sufficiently_long_non_placeholder_secret() -> None:
    info = _security_info_with("a" * 32)
    assert info.JWT_SECRET == "a" * 32


@pytest.mark.parametrize("access_minutes", ["0", "-5"])
def test_rejects_a_non_positive_access_expiry(access_minutes: str) -> None:
    with pytest.raises(InvalidEnvironmentError):
        _security_info_with("a" * 32, access_minutes=access_minutes)


@pytest.mark.parametrize("refresh_minutes", ["20", "10"])
def test_rejects_a_refresh_expiry_not_longer_than_access(refresh_minutes: str) -> None:
    """A refresh token that doesn't outlive the access token defeats the
    reason for having two token types at all.
    """
    with pytest.raises(InvalidEnvironmentError):
        _security_info_with(
            "a" * 32, access_minutes="20", refresh_minutes=refresh_minutes
        )
