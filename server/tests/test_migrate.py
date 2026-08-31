import uuid
from pathlib import Path

from alembic import command
import pytest
from sqlalchemy import create_engine, inspect, text

from scripts.migrate import (
    BASELINE_REVISION,
    UnsafeLegacySchemaError,
    alembic_config,
    migrate,
)


def database_url(path: Path) -> str:
    return f"sqlite+pysqlite:///{path.as_posix()}"


def current_revision(url: str) -> str:
    engine = create_engine(url)
    try:
        with engine.connect() as connection:
            return connection.scalar(
                text("SELECT version_num FROM alembic_version")
            )
    finally:
        engine.dispose()


def table_names(url: str) -> set[str]:
    engine = create_engine(url)
    try:
        return set(inspect(engine).get_table_names())
    finally:
        engine.dispose()


def column_names(url: str, table: str) -> set[str]:
    engine = create_engine(url)
    try:
        return {
            column["name"]
            for column in inspect(engine).get_columns(table)
        }
    finally:
        engine.dispose()


def column_nullable(url: str, table: str, column_name: str) -> bool:
    engine = create_engine(url)
    try:
        column = next(
            column
            for column in inspect(engine).get_columns(table)
            if column["name"] == column_name
        )
        return bool(column["nullable"])
    finally:
        engine.dispose()


def create_unversioned_legacy_schema(url: str) -> None:
    command.upgrade(alembic_config(url), BASELINE_REVISION)
    engine = create_engine(url)
    try:
        with engine.begin() as connection:
            connection.execute(text("DROP TABLE alembic_version"))
    finally:
        engine.dispose()


def test_migrate_builds_an_empty_database(tmp_path: Path) -> None:
    url = database_url(tmp_path / "empty.db")

    migrate(url)

    assert current_revision(url) == "20260831_0002"
    assert "session_version" in column_names(url, "users")
    assert "session_version" in column_names(url, "refresh_tokens")


def test_migrate_stamps_legacy_schema_and_preserves_data(tmp_path: Path) -> None:
    url = database_url(tmp_path / "legacy.db")
    create_unversioned_legacy_schema(url)
    assert column_nullable(url, "tasks", "date") is False
    user_id = uuid.uuid4().hex
    engine = create_engine(url)
    try:
        with engine.begin() as connection:
            connection.execute(
                text(
                    """
                    INSERT INTO users (
                        id, email, password_hash, verified_at, created_at
                    ) VALUES (
                        :id, :email, :password_hash, NULL, CURRENT_TIMESTAMP
                    )
                    """
                ),
                {
                    "id": user_id,
                    "email": "legacy@example.com",
                    "password_hash": "legacy-hash",
                },
            )
    finally:
        engine.dispose()

    migrate(url)

    assert current_revision(url) == "20260831_0002"
    assert column_nullable(url, "tasks", "date") is True
    engine = create_engine(url)
    try:
        with engine.connect() as connection:
            row = connection.execute(
                text(
                    "SELECT email, session_version FROM users WHERE id = :id"
                ),
                {"id": user_id},
            ).one()
            assert row == ("legacy@example.com", 0)
    finally:
        engine.dispose()


@pytest.mark.parametrize("schema_kind", ["partial", "unknown"])
def test_migrate_rejects_unrecognized_unversioned_schema(
    tmp_path: Path,
    schema_kind: str,
) -> None:
    url = database_url(tmp_path / f"{schema_kind}.db")
    engine = create_engine(url)
    try:
        if schema_kind == "partial":
            with engine.begin() as connection:
                connection.execute(text("CREATE TABLE users (id VARCHAR PRIMARY KEY)"))
        else:
            create_unversioned_legacy_schema(url)
            with engine.begin() as connection:
                connection.execute(text("CREATE TABLE foreign_data (id INTEGER)"))
    finally:
        engine.dispose()

    with pytest.raises(
        UnsafeLegacySchemaError,
        match="refusing to stamp",
    ):
        migrate(url)

    assert "alembic_version" not in table_names(url)
