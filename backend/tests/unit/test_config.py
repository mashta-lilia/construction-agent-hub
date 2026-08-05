import os
from unittest.mock import patch

import pytest

from app.utils.classes.config import Config, ConfInfo
from app.utils.exceptions import InvalidEnvironmentError


def test_conf_info_rejects_wildcard_origin() -> None:
    """main.py sets allow_credentials=True; combined with CONF_ORIGINS="*",
    CORSMiddleware echoes the caller's Origin back rather than rejecting it —
    making the wildcard behave as any-origin-with-credentials.
    """
    with patch.dict(os.environ, {"CONF_ORIGINS": "*"}, clear=False):
        with pytest.raises(InvalidEnvironmentError):
            ConfInfo()


def test_conf_info_accepts_a_concrete_origin_list() -> None:
    with patch.dict(os.environ, {"CONF_ORIGINS": "http://a,http://b"}, clear=False):
        assert ConfInfo().ORIGINS == ["http://a", "http://b"]


def test_create_example_env_does_not_overwrite_an_existing_file(tmp_path, monkeypatch) -> None:
    """Regression: a missing required var used to make Config.__init__'s
    except-branch silently overwrite a tracked, hand-commented .env.example
    with a bare auto-generated dump.
    """
    monkeypatch.chdir(tmp_path)
    existing = tmp_path / ".env.example"
    existing.write_text("# hand-written, do not touch\n")

    Config.create_example_env()

    assert existing.read_text() == "# hand-written, do not touch\n"
