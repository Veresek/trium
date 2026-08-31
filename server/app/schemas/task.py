import uuid
from datetime import date as DateType
from datetime import datetime

from pydantic import ConfigDict, Field, field_validator

from app.schemas.base import ApiModel


class TaskCreate(ApiModel):
    title: str = Field(min_length=1, max_length=255)
    description: str = Field(default="", max_length=10_000)
    done: bool = False
    date: DateType | None = None
    time_block_id: uuid.UUID | None = None
    order: int = Field(default=0, ge=0)

    @field_validator("title")
    @classmethod
    def normalize_title(cls, value: str) -> str:
        title = value.strip()
        if not title:
            raise ValueError("Title cannot be empty.")
        return title

    @field_validator("description")
    @classmethod
    def normalize_description(cls, value: str) -> str:
        return value.strip()


class TaskUpdate(ApiModel):
    title: str | None = None
    description: str | None = None
    done: bool | None = None
    date: DateType | None = None
    time_block_id: uuid.UUID | None = None
    order: int | None = None

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

    @field_validator("description")
    @classmethod
    def normalize_description(cls, value: str | None) -> str:
        if value is None:
            raise ValueError("Description cannot be null.")
        description = value.strip()
        if len(description) > 10_000:
            raise ValueError("Description cannot exceed 10000 characters.")
        return description

    @field_validator("done")
    @classmethod
    def validate_done(cls, value: bool | None) -> bool:
        if value is None:
            raise ValueError("Done cannot be null.")
        return value

    @field_validator("order")
    @classmethod
    def validate_order(cls, value: int | None) -> int:
        if value is None:
            raise ValueError("Order cannot be null.")
        if value < 0:
            raise ValueError("Order cannot be negative.")
        return value


class TaskRead(TaskCreate):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    order: int = Field(validation_alias="sort_order")
    created_at: datetime
