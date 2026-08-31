"""Add versions used to invalidate sessions.

Revision ID: 20260831_0002
Revises: 20260831_0001
Create Date: 2026-08-31
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "20260831_0002"
down_revision: str | None = "20260831_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "session_version",
            sa.Integer(),
            server_default="0",
            nullable=False,
        ),
    )
    op.add_column(
        "refresh_tokens",
        sa.Column(
            "session_version",
            sa.Integer(),
            server_default="0",
            nullable=False,
        ),
    )
    with op.batch_alter_table("tasks") as batch_op:
        batch_op.alter_column(
            "date",
            existing_type=sa.Date(),
            nullable=True,
        )


def downgrade() -> None:
    op.drop_column("refresh_tokens", "session_version")
    op.drop_column("users", "session_version")
