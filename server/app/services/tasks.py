import uuid
from datetime import date

from fastapi import HTTPException, status
from sqlalchemy import Select, select
from sqlalchemy.orm import Session

from app.models.task import Task
from app.models.time_block import TimeBlock
from app.schemas.task import TaskCreate, TaskUpdate


TASK_NOT_FOUND = "Task not found."
TIME_BLOCK_NOT_FOUND = "Time block not found."


def _owned_task_statement(task_id: uuid.UUID, user_id: uuid.UUID) -> Select:
    return select(Task).where(Task.id == task_id, Task.user_id == user_id)


def get_owned_task(db: Session, task_id: uuid.UUID, user_id: uuid.UUID) -> Task:
    task = db.scalar(_owned_task_statement(task_id, user_id))
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=TASK_NOT_FOUND,
        )
    return task


def _ensure_owned_time_block(
    db: Session,
    time_block_id: uuid.UUID | None,
    user_id: uuid.UUID,
) -> None:
    if time_block_id is None:
        return
    block = db.scalar(
        select(TimeBlock.id).where(
            TimeBlock.id == time_block_id,
            TimeBlock.user_id == user_id,
        )
    )
    if block is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=TIME_BLOCK_NOT_FOUND,
        )


def list_owned_tasks(
    db: Session,
    user_id: uuid.UUID,
    task_date: date | None = None,
    *,
    undated: bool = False,
) -> list[Task]:
    statement = select(Task).where(Task.user_id == user_id)
    if undated:
        statement = statement.where(Task.date.is_(None))
    elif task_date is not None:
        statement = statement.where(Task.date == task_date)
    statement = statement.order_by(Task.sort_order, Task.created_at, Task.id)
    return list(db.scalars(statement).all())


def create_owned_task(
    db: Session,
    user_id: uuid.UUID,
    payload: TaskCreate,
) -> Task:
    _ensure_owned_time_block(db, payload.time_block_id, user_id)
    values = payload.model_dump(by_alias=False)
    values["sort_order"] = values.pop("order")
    task = Task(user_id=user_id, **values)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def update_owned_task(
    db: Session,
    task_id: uuid.UUID,
    user_id: uuid.UUID,
    payload: TaskUpdate,
) -> Task:
    task = get_owned_task(db, task_id, user_id)
    changes = payload.model_dump(exclude_unset=True, by_alias=False)
    if "time_block_id" in changes:
        _ensure_owned_time_block(db, changes["time_block_id"], user_id)
    for field, value in changes.items():
        attribute = "sort_order" if field == "order" else field
        setattr(task, attribute, value)
    db.commit()
    db.refresh(task)
    return task


def delete_owned_task(db: Session, task_id: uuid.UUID, user_id: uuid.UUID) -> None:
    task = get_owned_task(db, task_id, user_id)
    db.delete(task)
    db.commit()
