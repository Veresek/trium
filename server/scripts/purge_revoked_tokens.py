from datetime import UTC, datetime, timedelta
from pathlib import Path
import sys

from sqlalchemy import create_engine, delete

SERVER_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SERVER_ROOT))

from app.config import get_settings
from app.models.refresh_token import RefreshToken

DEFAULT_RETENTION = timedelta(days=30)


def purge_revoked_tokens(
    database_url: str,
    *,
    older_than: timedelta = DEFAULT_RETENTION,
    now: datetime | None = None,
) -> int:
    cutoff = (now or datetime.now(UTC)) - older_than
    engine = create_engine(database_url)
    try:
        with engine.begin() as connection:
            result = connection.execute(
                delete(RefreshToken).where(
                    RefreshToken.revoked_at.is_not(None),
                    RefreshToken.revoked_at < cutoff,
                )
            )
            return result.rowcount or 0
    finally:
        engine.dispose()


def main() -> None:
    deleted = purge_revoked_tokens(get_settings().database_url)
    print(f"Deleted {deleted} revoked refresh token(s).")


if __name__ == "__main__":
    main()
