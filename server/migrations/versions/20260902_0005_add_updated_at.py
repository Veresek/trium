"""Add updated_at to tasks and time blocks.

Revision ID: 20260902_0005
Revises: 20260902_0004
Create Date: 2026-09-02
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "20260902_0005"
down_revision: str | None = "20260902_0004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "tasks",
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.add_column(
        "time_blocks",
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.execute(sa.text("UPDATE tasks SET updated_at = created_at"))
    op.execute(sa.text("UPDATE time_blocks SET updated_at = CURRENT_TIMESTAMP"))
    with op.batch_alter_table("tasks") as batch_op:
        batch_op.alter_column(
            "updated_at",
            existing_type=sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        )
    with op.batch_alter_table("time_blocks") as batch_op:
        batch_op.alter_column(
            "updated_at",
            existing_type=sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        )


def downgrade() -> None:
    with op.batch_alter_table("time_blocks") as batch_op:
        batch_op.drop_column("updated_at")
    with op.batch_alter_table("tasks") as batch_op:
        batch_op.drop_column("updated_at")
