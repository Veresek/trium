import uuid
from datetime import datetime

from pydantic import ConfigDict

from app.schemas.base import ApiModel


class NoteCreate(ApiModel):
    title: str
    markdown: str = ""
    task_id: uuid.UUID | None = None


class NoteUpdate(ApiModel):
    title: str | None = None
    markdown: str | None = None
    task_id: uuid.UUID | None = None


class NoteRead(NoteCreate):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    updated_at: datetime
