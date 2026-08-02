"""SecurityInfo's JWT_SECRET validation — separate from test_security.py since
this is app/utils/classes/config.py's concern, not app/core/security.py's.
"""

import os
from unittest.mock import patch

import pytest

from app.utils.classes.config import SecurityInfo
from app.utils.exceptions import InvalidEnvironmentError


def _security_info_with(secret: str) -> SecurityInfo:
    env = {
        "JWT_SECRET": secret,
        "JWT_ACCESS_EXPIRE_MINUTES": "20",
        "JWT_REFRESH_EXPIRE_MINUTES": "10080",
    }
    with patch.dict(os.environ, env):
        return SecurityInfo()


@pytest.mark.parametrize("placeholder", ["change-me", "change-me-to-a-random-secret"])
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
