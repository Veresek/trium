"""Add query indexes and a time-range check.

Revision ID: 20260902_0003
Revises: 20260831_0002
Create Date: 2026-09-02
"""

from collections.abc import Sequence

from alembic import op

revision: str = "20260902_0003"
down_revision: str | None = "20260831_0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_index("ix_tasks_user_id_date", "tasks", ["user_id", "date"])
    op.create_index("ix_tasks_time_block_id", "tasks", ["time_block_id"])
    op.create_index("ix_notes_task_id", "notes", ["task_id"])
    op.create_index(
        "ix_time_blocks_user_id_date",
        "time_blocks",
        ["user_id", "date"],
    )
    with op.batch_alter_table("time_blocks") as batch_op:
        batch_op.create_check_constraint(
            "ck_time_blocks_end_after_start",
            '"end" > "start"',
        )


def downgrade() -> None:
    with op.batch_alter_table("time_blocks") as batch_op:
        batch_op.drop_constraint(
            "ck_time_blocks_end_after_start",
            type_="check",
        )
    op.drop_index("ix_time_blocks_user_id_date", table_name="time_blocks")
    op.drop_index("ix_notes_task_id", table_name="notes")
    op.drop_index("ix_tasks_time_block_id", table_name="tasks")
    op.drop_index("ix_tasks_user_id_date", table_name="tasks")
