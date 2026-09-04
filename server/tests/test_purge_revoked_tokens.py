from datetime import UTC, datetime, timedelta
from pathlib import Path
from uuid import uuid4

from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.db import Base
from app.models.refresh_token import RefreshToken
from app.models.user import User
from app.services.passwords import hash_password
from scripts.purge_revoked_tokens import purge_revoked_tokens


def test_purge_deletes_old_revoked_tokens_only(tmp_path: Path) -> None:
    url = f"sqlite+pysqlite:///{(tmp_path / 'tokens.db').as_posix()}"
    engine = create_engine(url)
    Base.metadata.create_all(engine)
    now = datetime(2026, 9, 2, tzinfo=UTC)
    try:
        with Session(engine) as db:
            user = User(
                id=uuid4(),
                email="ada@example.com",
                password_hash=hash_password("password1"),
            )
            db.add(user)
            db.flush()
            db.add_all(
                [
                    RefreshToken(
                        user_id=user.id,
                        token_hash="a" * 64,
                        revoked_at=now - timedelta(days=40),
                    ),
                    RefreshToken(
                        user_id=user.id,
                        token_hash="b" * 64,
                        revoked_at=now - timedelta(days=2),
                    ),
                    RefreshToken(
                        user_id=user.id,
                        token_hash="c" * 64,
                    ),
                ]
            )
            db.commit()

        deleted = purge_revoked_tokens(
            url,
            older_than=timedelta(days=30),
            now=now,
        )

        assert deleted == 1
        with Session(engine) as db:
            remaining = db.scalars(select(RefreshToken)).all()
            hashes = {token.token_hash for token in remaining}
            assert hashes == {"b" * 64, "c" * 64}
    finally:
        engine.dispose()
