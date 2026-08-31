from pathlib import Path
import sys

from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect

SERVER_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SERVER_ROOT))

from app.config import get_settings

BASELINE_REVISION = "20260831_0001"
LEGACY_COLUMNS = {
    "users": {
        "id",
        "email",
        "password_hash",
        "verified_at",
        "created_at",
    },
    "refresh_tokens": {
        "id",
        "user_id",
        "token_hash",
        "created_at",
        "revoked_at",
        "replaced_by_id",
    },
    "tasks": {
        "id",
        "user_id",
        "title",
        "description",
        "done",
        "date",
        "time_block_id",
        "order",
        "created_at",
    },
    "time_blocks": {
        "id",
        "user_id",
        "title",
        "description",
        "date",
        "start",
        "end",
        "recurrence",
        "recurrence_days",
    },
    "notes": {
        "id",
        "user_id",
        "title",
        "markdown",
        "task_id",
        "updated_at",
    },
}


class UnsafeLegacySchemaError(RuntimeError):
    pass


def alembic_config(database_url: str) -> Config:
    config = Config(str(SERVER_ROOT / "alembic.ini"))
    config.set_main_option("script_location", str(SERVER_ROOT / "migrations"))
    config.attributes["database_url"] = database_url
    return config


def validate_legacy_schema(database_url: str) -> bool:
    engine = create_engine(database_url)
    try:
        inspector = inspect(engine)
        tables = set(inspector.get_table_names())
        if "alembic_version" in tables:
            return False
        if not tables:
            return False

        expected_tables = set(LEGACY_COLUMNS)
        problems: list[str] = []
        missing_tables = expected_tables - tables
        extra_tables = tables - expected_tables
        if missing_tables:
            problems.append(f"missing tables: {', '.join(sorted(missing_tables))}")
        if extra_tables:
            problems.append(f"unexpected tables: {', '.join(sorted(extra_tables))}")

        for table in sorted(expected_tables & tables):
            columns = {column["name"] for column in inspector.get_columns(table)}
            missing_columns = LEGACY_COLUMNS[table] - columns
            extra_columns = columns - LEGACY_COLUMNS[table]
            if missing_columns:
                problems.append(
                    f"{table} missing columns: "
                    f"{', '.join(sorted(missing_columns))}"
                )
            if extra_columns:
                problems.append(
                    f"{table} unexpected columns: "
                    f"{', '.join(sorted(extra_columns))}"
                )

        if problems:
            details = "; ".join(problems)
            raise UnsafeLegacySchemaError(
                "Database has an unversioned schema that does not match the "
                f"known create_all baseline; refusing to stamp it ({details})."
            )
        return True
    finally:
        engine.dispose()


def migrate(database_url: str) -> None:
    config = alembic_config(database_url)
    if validate_legacy_schema(database_url):
        command.stamp(config, BASELINE_REVISION)
    command.upgrade(config, "head")


def main() -> None:
    try:
        migrate(get_settings().database_url)
    except UnsafeLegacySchemaError as exc:
        raise SystemExit(f"Migration aborted: {exc}") from exc


if __name__ == "__main__":
    main()
