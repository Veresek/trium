"""Allow overnight time blocks.

Revision ID: 20260902_0004
Revises: 20260902_0003
Create Date: 2026-09-02
"""

from collections.abc import Sequence

from alembic import op

revision: str = "20260902_0004"
down_revision: str | None = "20260902_0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    with op.batch_alter_table("time_blocks") as batch_op:
        batch_op.drop_constraint(
            "ck_time_blocks_end_after_start",
            type_="check",
        )
        batch_op.create_check_constraint(
            "ck_time_blocks_start_neq_end",
            '"start" <> "end"',
        )


def downgrade() -> None:
    with op.batch_alter_table("time_blocks") as batch_op:
        batch_op.drop_constraint(
            "ck_time_blocks_start_neq_end",
            type_="check",
        )
        batch_op.create_check_constraint(
            "ck_time_blocks_end_after_start",
            '"end" > "start"',
        )
