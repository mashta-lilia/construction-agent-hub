import time

import jwt
import pytest

from app.core import CONFIG
from app.core.security import (
    ALGORITHM,
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)


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
