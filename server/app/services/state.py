import uuid

from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session

from app.models.note import Note
from app.models.task import Task
from app.models.time_block import TimeBlock
from app.schemas.state import AppStateRead, CollectionFingerprint


def _fingerprint(
    db: Session,
    model: type[Task] | type[Note] | type[TimeBlock],
    user_id: uuid.UUID,
) -> CollectionFingerprint:
    statement: Select = select(func.count(model.id), func.max(model.updated_at)).where(
        model.user_id == user_id,
    )
    count, updated_at = db.execute(statement).one()
    return CollectionFingerprint(count=count, updated_at=updated_at)


def read_app_state(db: Session, user_id: uuid.UUID) -> AppStateRead:
    return AppStateRead(
        tasks=_fingerprint(db, Task, user_id),
        notes=_fingerprint(db, Note, user_id),
        blocks=_fingerprint(db, TimeBlock, user_id),
    )
