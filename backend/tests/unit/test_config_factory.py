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

from app.utils.classes.config import ConfInfo, DatabaseInfo, SmtpInfo
from app.utils.classes.config_factory import ConfigFactory
from app.utils.exceptions import InvalidEnvironmentError, NoParameterError


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


@pytest.mark.parametrize("value", ["maybe", "flase", "TRUE "])
def test_rejects_a_boolean_env_var_with_an_unrecognized_value(value: str) -> None:
    """Regression: `_cast_value` used to fall back to False for anything
    that wasn't an explicit true-ish string — a typo like `CONF_DEBUG=flase`
    silently disabled debug mode instead of failing loudly.
    """
    with patch.dict(os.environ, {"CONF_DEBUG": value}, clear=False):
        with pytest.raises(InvalidEnvironmentError):
            ConfInfo()


def test_accepts_explicit_boolean_env_var_values() -> None:
    with patch.dict(os.environ, {"CONF_DEBUG": "yes"}, clear=False):
        assert ConfInfo().DEBUG is True
    with patch.dict(os.environ, {"CONF_DEBUG": "0"}, clear=False):
        assert ConfInfo().DEBUG is False


def test_csv_list_entries_are_trimmed_of_surrounding_whitespace() -> None:
    """Regression: a bare `value.split(",")` left a leading space on every
    entry after the first (`'http://a, http://b'` -> `[' http://b']`), which
    then never matches a browser Origin header and CORS silently rejects it.
    """
    with patch.dict(
        os.environ, {"CONF_ORIGINS": "http://a, http://b ,http://c"}, clear=False
    ):
        assert ConfInfo().ORIGINS == ["http://a", "http://b", "http://c"]


def test_csv_list_drops_empty_segments_from_trailing_comma() -> None:
    with patch.dict(os.environ, {"CONF_ORIGINS": "http://a,"}, clear=False):
        assert ConfInfo().ORIGINS == ["http://a"]


def test_unsupported_annotation_raises_invalid_environment_error() -> None:
    """Regression: `_cast_value`'s fallback raised a bare TypeError, which
    the `except ValueError` around the cast call didn't catch — it escaped
    as an opaque import-time TypeError instead of the same
    InvalidEnvironmentError every other bad-config path produces.
    """

    class _WithUnsupportedField(ConfigFactory):
        __prefix__ = "UNSUPPORTED_TEST_"
        TIMEOUT: float

    with (
        patch.dict(os.environ, {"UNSUPPORTED_TEST_TIMEOUT": "5.0"}, clear=False),
        pytest.raises(InvalidEnvironmentError),
    ):
        _WithUnsupportedField()
