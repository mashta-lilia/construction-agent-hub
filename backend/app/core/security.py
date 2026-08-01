"""Password hashing and JWT primitives only (CLAUDE.md §10) — no endpoints,
no user lookup, no refresh-token storage/revocation. Those land with the
actual login/register/refresh flow in a dedicated follow-up ticket; this
module only proves the stateless pieces work.
"""

import time
from typing import Literal, TypedDict, cast

import bcrypt
import jwt

from app.core import CONFIG

ALGORITHM = "HS256"

TOKEN_TYPES: frozenset[str] = frozenset({"access", "refresh"})
REQUIRED_CLAIMS = ["sub", "type", "iat", "exp"]


class TokenPayload(TypedDict):
    sub: str
    type: Literal["access", "refresh"]
    iat: int
    exp: int


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode(), password_hash.encode())


def create_access_token(subject: str) -> str:
    now = int(time.time())
    payload: TokenPayload = {
        "sub": subject,
        "type": "access",
        "iat": now,
        "exp": now + 60 * CONFIG.security.JWT_ACCESS_EXPIRE_MINUTES,
    }
    return jwt.encode(payload, CONFIG.security.JWT_SECRET, algorithm=ALGORITHM)


def create_refresh_token(subject: str) -> str:
    now = int(time.time())
    payload: TokenPayload = {
        "sub": subject,
        "type": "refresh",
        "iat": now,
        "exp": now + 60 * CONFIG.security.JWT_REFRESH_EXPIRE_MINUTES,
    }
    return jwt.encode(payload, CONFIG.security.JWT_SECRET, algorithm=ALGORITHM)


def decode_token(token: str) -> TokenPayload:
    """Decode and validate a token against the TokenPayload contract.

    A valid signature alone is not enough: without enforcing the claim schema
    a token missing `sub`/`type`, or carrying an unexpected `type`, would be
    handed back as a "TokenPayload" it does not actually satisfy.
    """
    payload = jwt.decode(
        token,
        CONFIG.security.JWT_SECRET,
        algorithms=[ALGORITHM],
        options={"require": REQUIRED_CLAIMS},
    )
    token_type = payload["type"]
    if token_type not in TOKEN_TYPES:
        raise jwt.InvalidTokenError(f"unsupported token type: {token_type!r}")
    return cast(TokenPayload, payload)
