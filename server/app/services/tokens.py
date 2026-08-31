import hashlib
import secrets
import uuid
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta

import jwt

ACCESS_COOKIE = "access_token"
REFRESH_COOKIE = "refresh_token"
REFRESH_MAX_AGE = 10 * 365 * 24 * 60 * 60
JWT_ALGORITHM = "HS256"
JWT_TYPE = "access"


@dataclass(frozen=True)
class AccessTokenClaims:
    user_id: uuid.UUID
    session_version: int


def create_access_token(
    user_id: uuid.UUID,
    secret: str,
    *,
    session_version: int = 0,
    ttl_minutes: int = 30,
    now: datetime | None = None,
) -> str:
    issued_at = now or datetime.now(UTC)
    payload = {
        "sub": str(user_id),
        "typ": JWT_TYPE,
        "ver": session_version,
        "jti": str(uuid.uuid4()),
        "iat": issued_at,
        "exp": issued_at + timedelta(minutes=ttl_minutes),
    }
    return jwt.encode(payload, secret, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str, secret: str) -> AccessTokenClaims:
    payload = jwt.decode(token, secret, algorithms=[JWT_ALGORITHM])
    if payload.get("typ") != JWT_TYPE:
        raise jwt.InvalidTokenError("Not an access token.")
    subject = payload.get("sub")
    if not isinstance(subject, str):
        raise jwt.InvalidTokenError("Missing subject.")
    session_version = payload.get("ver")
    if (
        not isinstance(session_version, int)
        or isinstance(session_version, bool)
        or session_version < 0
    ):
        raise jwt.InvalidTokenError("Missing session version.")
    return AccessTokenClaims(
        user_id=uuid.UUID(subject),
        session_version=session_version,
    )


def new_refresh_token() -> str:
    return secrets.token_urlsafe(32)


def hash_refresh_token(raw: str) -> str:
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()
