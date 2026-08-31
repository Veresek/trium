import uuid
from datetime import date as DateType
from datetime import time as TimeType

from pydantic import ConfigDict, Field, model_validator

from app.models.time_block import Recurrence
from app.schemas.base import ApiModel


class TimeBlockCreate(ApiModel):
    title: str
    description: str = ""
    date: DateType
    start: TimeType
    end: TimeType
    recurrence: Recurrence = Recurrence.NONE
    recurrence_days: list[int] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_time_range(self) -> "TimeBlockCreate":
        if self.end <= self.start:
            raise ValueError("end must be later than start")
        if any(day < 0 or day > 6 for day in self.recurrence_days):
            raise ValueError("recurrence_days must use 0 (Monday) through 6 (Sunday)")
        return self


class TimeBlockUpdate(ApiModel):
    title: str | None = None
    description: str | None = None
    date: DateType | None = None
    start: TimeType | None = None
    end: TimeType | None = None
    recurrence: Recurrence | None = None
    recurrence_days: list[int] | None = None


class TimeBlockRead(TimeBlockCreate):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
