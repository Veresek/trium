import uuid
from datetime import UTC, datetime, timedelta

import jwt
import pytest

from app.services.tokens import (
    create_access_token,
    decode_access_token,
    hash_refresh_token,
    new_refresh_token,
)

SECRET = "unit-test-secret-key-32-bytes-min"


def test_access_token_round_trip() -> None:
    user_id = uuid.uuid4()
    token = create_access_token(user_id, SECRET, session_version=3)

    claims = decode_access_token(token, SECRET)
    assert claims.user_id == user_id
    assert claims.session_version == 3


def test_access_token_expires() -> None:
    user_id = uuid.uuid4()
    token = create_access_token(
        user_id,
        SECRET,
        ttl_minutes=30,
        now=datetime.now(UTC) - timedelta(hours=1),
    )

    with pytest.raises(jwt.ExpiredSignatureError):
        decode_access_token(token, SECRET)


def test_access_token_rejects_wrong_signature() -> None:
    token = create_access_token(uuid.uuid4(), SECRET)

    with pytest.raises(jwt.InvalidTokenError):
        decode_access_token(token, "other-secret-key-32-bytes-long!!")


def test_access_token_rejects_wrong_type() -> None:
    token = jwt.encode(
        {
            "sub": str(uuid.uuid4()),
            "typ": "refresh",
            "exp": datetime.now(UTC) + timedelta(minutes=30),
        },
        SECRET,
        algorithm="HS256",
    )

    with pytest.raises(jwt.InvalidTokenError):
        decode_access_token(token, SECRET)


def test_access_token_requires_a_session_version() -> None:
    token = jwt.encode(
        {
            "sub": str(uuid.uuid4()),
            "typ": "access",
            "exp": datetime.now(UTC) + timedelta(minutes=30),
        },
        SECRET,
        algorithm="HS256",
    )

    with pytest.raises(jwt.InvalidTokenError):
        decode_access_token(token, SECRET)


def test_refresh_hash_is_deterministic_and_not_raw() -> None:
    raw = new_refresh_token()
    hashed = hash_refresh_token(raw)

    assert hashed == hash_refresh_token(raw)
    assert hashed != raw
    assert len(hashed) == 64
