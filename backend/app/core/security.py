"""Password hashing and JWT primitives only (CLAUDE.md §10) — no endpoints,
no user lookup, no refresh-token storage/revocation. Those land with the
actual login/register/refresh flow in a dedicated follow-up ticket; this
module only proves the stateless pieces work.
"""

import time
import uuid
from typing import Literal, TypedDict, cast

import bcrypt
import jwt

from app.core import CONFIG
from app.utils.exceptions import UnauthorizedError, ValidationAppError

ALGORITHM = "HS256"

# bcrypt consumes at most 72 bytes; pyca/bcrypt 5.0 raises rather than
# truncating silently.
MAX_PASSWORD_BYTES = 72
BCRYPT_ROUNDS = 12

REQUIRED_CLAIMS = ["sub", "type", "iat", "exp", "jti"]


class TokenPayload(TypedDict):
    sub: str
    type: Literal["access", "refresh"]
    iat: int
    exp: int
    # Present on every token from the first one issued, not added later: a
    # revocation/rotation denylist (§10) needs a stable per-token identifier,
    # and adding jti after real tokens exist would force-invalidate all of
    # them the moment the system has any.
    jti: str


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
    return bcrypt.hashpw(encoded, bcrypt.gensalt(rounds=BCRYPT_ROUNDS)).decode()


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
        "jti": str(uuid.uuid4()),
    }
    return jwt.encode(payload, CONFIG.security.JWT_SECRET, algorithm=ALGORITHM)


def create_refresh_token(subject: str) -> str:
    now = int(time.time())
    payload: TokenPayload = {
        "sub": subject,
        "type": "refresh",
        "iat": now,
        "exp": now + 60 * CONFIG.security.JWT_REFRESH_EXPIRE_MINUTES,
        "jti": str(uuid.uuid4()),
    }
    return jwt.encode(payload, CONFIG.security.JWT_SECRET, algorithm=ALGORITHM)


def decode_token(
    token: str, expected_type: Literal["access", "refresh"]
) -> TokenPayload:
    """Decode and validate a token against the TokenPayload contract.

    `expected_type` has no default on purpose: an access token and a refresh
    token differ only in lifetime (20 minutes vs. 7 days here), and the two
    are not interchangeable — a refresh token accepted as a bearer credential
    turns a captured value into a week-long session instead of a 20-minute
    one. Forcing every call site to state which one it wants makes that
    mistake unrepresentable, rather than relying on callers to remember.

    Every rejection — bad signature, expired, missing claims, or the right
    kind of token in the wrong place — raises `UnauthorizedError` (401), not
    a raw `jwt.PyJWTError`. Token expiry happens to every user on a schedule;
    without this translation it would fall through to the generic 500
    handler and both look like an outage and drown real errors in tracebacks.
    """
    try:
        payload = jwt.decode(
            token,
            CONFIG.security.JWT_SECRET,
            algorithms=[ALGORITHM],
            options={"require": REQUIRED_CLAIMS},
        )
    except jwt.PyJWTError as exc:
        raise UnauthorizedError("invalid or expired token") from exc

    if payload["type"] != expected_type:
        raise UnauthorizedError(
            f"expected {expected_type!r} token, got {payload['type']!r}"
        )
    return cast(TokenPayload, payload)
