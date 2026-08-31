import uuid
from datetime import datetime

from pydantic import ConfigDict, Field, field_validator

from app.schemas.base import ApiModel


class NoteCreate(ApiModel):
    title: str = Field(min_length=1, max_length=255)
    markdown: str = Field(default="", max_length=100_000)
    task_id: uuid.UUID | None = None

    @field_validator("title")
    @classmethod
    def normalize_title(cls, value: str) -> str:
        title = value.strip()
        if not title:
            raise ValueError("Title cannot be empty.")
        return title


class NoteUpdate(ApiModel):
    title: str | None = None
    markdown: str | None = None
    task_id: uuid.UUID | None = None

    @field_validator("title")
    @classmethod
    def normalize_title(cls, value: str | None) -> str:
        if value is None:
            raise ValueError("Title cannot be null.")
        title = value.strip()
        if not title:
            raise ValueError("Title cannot be empty.")
        if len(title) > 255:
            raise ValueError("Title cannot exceed 255 characters.")
        return title

    @field_validator("markdown")
    @classmethod
    def validate_markdown(cls, value: str | None) -> str:
        if value is None:
            raise ValueError("Markdown cannot be null.")
        if len(value) > 100_000:
            raise ValueError("Markdown cannot exceed 100000 characters.")
        return value


class NoteRead(NoteCreate):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    updated_at: datetime
