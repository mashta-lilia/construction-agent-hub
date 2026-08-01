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
from app.utils.exceptions import ValidationAppError

ALGORITHM = "HS256"

# bcrypt consumes at most 72 bytes; pyca/bcrypt 5.0 raises rather than
# truncating silently.
MAX_PASSWORD_BYTES = 72

TOKEN_TYPES: frozenset[str] = frozenset({"access", "refresh"})
REQUIRED_CLAIMS = ["sub", "type", "iat", "exp"]


class TokenPayload(TypedDict):
    sub: str
    type: Literal["access", "refresh"]
    iat: int
    exp: int


def hash_password(password: str) -> str:
    """Hash a password, rejecting anything bcrypt cannot represent.

    bcrypt only consumes the first 72 bytes; pyca/bcrypt 5.0 stopped
    truncating silently and raises ValueError instead. We reject explicitly
    rather than truncating (which would make "<72 bytes>x" and "<72 bytes>y"
    the same password) so the caller gets a 422 rather than a 500.

    Note this is a *byte* limit, so it bites earlier than users expect —
    36 Cyrillic characters already reach 72 bytes.
    """
    encoded = password.encode()
    if len(encoded) > MAX_PASSWORD_BYTES:
        raise ValidationAppError(
            f"password must be at most {MAX_PASSWORD_BYTES} bytes, got {len(encoded)}"
        )
    return bcrypt.hashpw(encoded, bcrypt.gensalt()).decode()


def verify_password(password: str, password_hash: str) -> bool:
    """Returns False (rather than raising) for oversized input.

    hash_password refuses to store anything over the limit, so an oversized
    candidate cannot match any stored hash — and a login attempt must not turn
    into a 500 just because someone posted a long string.
    """
    encoded = password.encode()
    if len(encoded) > MAX_PASSWORD_BYTES:
        return False
    return bcrypt.checkpw(encoded, password_hash.encode())


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
