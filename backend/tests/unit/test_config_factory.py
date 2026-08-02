"""Locks in two regressions found while porting ConfigFactory from the
fastapi-template: Python 3.14's PEP 649 breaking `self.__annotations__` on
instances, and class-level defaults being overwritten with None/raising
instead of being honoured. This class now reads every setting in the system,
including JWT_SECRET — these bugs are exactly the kind that's easy to
reintroduce without a test pinning the fix.
"""

import os
from unittest.mock import patch

import pytest

from app.utils.classes.config import DatabaseInfo, SmtpInfo
from app.utils.exceptions import NoParameterError


def test_class_level_default_used_when_env_var_missing() -> None:
    """Regression: ConfigFactory used to raise NoParameterError even when a
    class-level default (`PORT: int = 587`) was declared, ignoring it.
    """
    with patch.dict(os.environ, {"SMTP_HOST": "localhost"}, clear=False):
        os.environ.pop("SMTP_PORT", None)
        assert SmtpInfo().PORT == 587


def test_optional_field_without_default_becomes_none() -> None:
    with patch.dict(os.environ, {"SMTP_HOST": "localhost"}, clear=False):
        os.environ.pop("SMTP_USER", None)
        assert SmtpInfo().USER is None


def test_required_field_missing_raises() -> None:
    with patch.dict(os.environ, {}, clear=False):
        os.environ.pop("DB_USER", None)
        with pytest.raises(NoParameterError):
            DatabaseInfo()


def test_annotations_resolve_on_instances_not_just_the_class() -> None:
    """Regression: Python 3.14 (PEP 649) makes `instance.__annotations__`
    raise AttributeError even though `Class.__annotations__` works fine —
    ConfigFactory.__init__ reads `type(self).__annotations__` specifically to
    avoid this. If that ever regresses back to `self.__annotations__`, this
    is the test that would have caught it (by simply not raising at all).
    """
    env = {
        "DB_USER": "u",
        "DB_PASSWORD": "p",
        "DB_HOST": "localhost",
        "DB_PORT": "5432",
        "DB_NAME": "n",
    }
    with patch.dict(os.environ, env, clear=False):
        info = DatabaseInfo()
    assert info.PORT == 5432
