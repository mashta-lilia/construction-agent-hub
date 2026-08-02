import time
import uuid

import jwt
import pytest

from app.core import CONFIG
from app.core.security import (
    ALGORITHM,
    MAX_PASSWORD_BYTES,
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.utils.exceptions import UnauthorizedError, ValidationAppError


def test_hash_password_accepts_input_at_the_bcrypt_byte_limit() -> None:
    at_limit = "a" * MAX_PASSWORD_BYTES
    assert verify_password(at_limit, hash_password(at_limit))


def test_hash_password_rejects_input_over_the_bcrypt_byte_limit() -> None:
    """bcrypt 5.0 raises on >72 bytes; surface it as a 422-shaped domain error
    rather than letting a ValueError become a 500.
    """
    with pytest.raises(ValidationAppError):
        hash_password("a" * (MAX_PASSWORD_BYTES + 1))


def test_hash_password_counts_bytes_not_characters() -> None:
    """36 Cyrillic characters are already 72 bytes — the limit bites earlier
    than a naive character count suggests.
    """
    assert len(("м" * 36).encode()) == MAX_PASSWORD_BYTES

    with pytest.raises(ValidationAppError):
        hash_password("м" * 37)


def test_verify_password_returns_false_for_oversized_input() -> None:
    """Must not raise: hash_password never stores anything oversized, so an
    oversized candidate simply cannot match — and a login attempt should not
    become a 500 because someone posted a long string.
    """
    stored = hash_password("short-password")
    assert verify_password("a" * (MAX_PASSWORD_BYTES + 1), stored) is False


def test_hash_password_produces_a_verifiable_but_different_string() -> None:
    password = "correct horse battery staple"
    hashed = hash_password(password)

    assert hashed != password
    assert verify_password(password, hashed)
    assert not verify_password("wrong password", hashed)


def test_access_and_refresh_tokens_decode_with_the_right_type_and_expiry() -> None:
    access = create_access_token("user-1")
    refresh = create_refresh_token("user-1")

    access_payload = decode_token(access, expected_type="access")
    refresh_payload = decode_token(refresh, expected_type="refresh")

    assert access_payload["sub"] == "user-1"
    assert access_payload["type"] == "access"
    assert refresh_payload["type"] == "refresh"
    # refresh must outlive access — that's the whole point of having both
    assert refresh_payload["exp"] > access_payload["exp"]


def test_access_and_refresh_tokens_each_get_a_unique_jti() -> None:
    a1 = decode_token(create_access_token("user-1"), expected_type="access")
    a2 = decode_token(create_access_token("user-1"), expected_type="access")
    r1 = decode_token(create_refresh_token("user-1"), expected_type="refresh")

    assert a1["jti"] != a2["jti"]
    assert a1["jti"] != r1["jti"]
    uuid.UUID(r1["jti"])  # doesn't raise — a real UUID, not a placeholder


def test_decode_token_rejects_a_refresh_token_presented_as_access() -> None:
    """The blocker this module exists to close: an access and a refresh token
    differ only in lifetime (20 min vs. 7 days here), so accepting either one
    where the other is expected turns a captured refresh token into a
    week-long session instead of a 20-minute one.
    """
    refresh = create_refresh_token("user-1")

    with pytest.raises(UnauthorizedError):
        decode_token(refresh, expected_type="access")


def test_decode_token_rejects_an_access_token_presented_as_refresh() -> None:
    access = create_access_token("user-1")

    with pytest.raises(UnauthorizedError):
        decode_token(access, expected_type="refresh")


def test_decode_token_rejects_tampered_signature() -> None:
    token = create_access_token("user-1")

    with pytest.raises(UnauthorizedError):
        decode_token(token + "tampered", expected_type="access")


def test_decode_token_rejects_expired_token() -> None:
    now = int(time.time())
    expired = jwt.encode(
        {
            "sub": "user-1",
            "type": "access",
            "iat": now - 120,
            "exp": now - 60,
            "jti": str(uuid.uuid4()),
        },
        CONFIG.security.JWT_SECRET,
        algorithm=ALGORITHM,
    )

    with pytest.raises(UnauthorizedError):
        decode_token(expired, expected_type="access")


def _sign(claims: dict) -> str:
    """A correctly-signed token with arbitrary claims — the signature is never
    the thing under test in the cases below, the claim schema is.
    """
    return jwt.encode(claims, CONFIG.security.JWT_SECRET, algorithm=ALGORITHM)


@pytest.mark.parametrize("missing", ["sub", "type", "iat", "exp", "jti"])
def test_decode_token_rejects_missing_required_claim(missing: str) -> None:
    now = int(time.time())
    claims = {
        "sub": "user-1",
        "type": "access",
        "iat": now,
        "exp": now + 300,
        "jti": str(uuid.uuid4()),
    }
    del claims[missing]

    with pytest.raises(UnauthorizedError):
        decode_token(_sign(claims), expected_type="access")


@pytest.mark.parametrize("token_type", ["admin", "ACCESS", "", "id_token"])
def test_decode_token_rejects_unsupported_token_type(token_type: str) -> None:
    now = int(time.time())
    token = _sign(
        {
            "sub": "user-1",
            "type": token_type,
            "iat": now,
            "exp": now + 300,
            "jti": str(uuid.uuid4()),
        }
    )

    with pytest.raises(UnauthorizedError):
        decode_token(token, expected_type="access")
