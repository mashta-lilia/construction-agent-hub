"""Password hashing and JWT primitives only (CLAUDE.md §10) — no endpoints,
no user lookup, no refresh-token storage/revocation. Those land with the
actual login/register/refresh flow in a dedicated follow-up ticket; this
module only proves the stateless pieces work.
"""

import time
from typing import Literal, TypedDict

import bcrypt
import jwt

from app.core import CONFIG

ALGORITHM = "HS256"


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
    return jwt.decode(token, CONFIG.security.JWT_SECRET, algorithms=[ALGORITHM])
