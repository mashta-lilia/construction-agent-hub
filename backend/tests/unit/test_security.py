import time

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
from app.utils.exceptions import ValidationAppError


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

    access_payload = decode_token(access)
    refresh_payload = decode_token(refresh)

    assert access_payload["sub"] == "user-1"
    assert access_payload["type"] == "access"
    assert refresh_payload["type"] == "refresh"
    # refresh must outlive access — that's the whole point of having both
    assert refresh_payload["exp"] > access_payload["exp"]


def test_decode_token_rejects_tampered_signature() -> None:
    token = create_access_token("user-1")

    with pytest.raises(jwt.InvalidTokenError):
        decode_token(token + "tampered")


def test_decode_token_rejects_expired_token() -> None:
    now = int(time.time())
    expired = jwt.encode(
        {"sub": "user-1", "type": "access", "iat": now - 120, "exp": now - 60},
        CONFIG.security.JWT_SECRET,
        algorithm=ALGORITHM,
    )

    with pytest.raises(jwt.ExpiredSignatureError):
        decode_token(expired)


def _sign(claims: dict) -> str:
    """A correctly-signed token with arbitrary claims — the signature is never
    the thing under test in the cases below, the claim schema is.
    """
    return jwt.encode(claims, CONFIG.security.JWT_SECRET, algorithm=ALGORITHM)


@pytest.mark.parametrize("missing", ["sub", "type", "iat", "exp"])
def test_decode_token_rejects_missing_required_claim(missing: str) -> None:
    now = int(time.time())
    claims = {"sub": "user-1", "type": "access", "iat": now, "exp": now + 300}
    del claims[missing]

    with pytest.raises(jwt.MissingRequiredClaimError):
        decode_token(_sign(claims))


@pytest.mark.parametrize("token_type", ["admin", "ACCESS", "", "id_token"])
def test_decode_token_rejects_unsupported_token_type(token_type: str) -> None:
    now = int(time.time())
    token = _sign({"sub": "user-1", "type": token_type, "iat": now, "exp": now + 300})

    with pytest.raises(jwt.InvalidTokenError, match="unsupported token type"):
        decode_token(token)
