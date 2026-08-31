import enum
import uuid
from datetime import date, time

from sqlalchemy import JSON, Date, Enum, ForeignKey, String, Text, Time
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class Recurrence(str, enum.Enum):
    NONE = "none"
    DAILY = "daily"
    WEEKLY = "weekly"
    WEEKDAYS = "weekdays"


class TimeBlock(Base):
    __tablename__ = "time_blocks"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")
    date: Mapped[date] = mapped_column(Date)
    start: Mapped[time] = mapped_column(Time)
    end: Mapped[time] = mapped_column(Time)
    recurrence: Mapped[Recurrence] = mapped_column(
        Enum(Recurrence, native_enum=False),
        default=Recurrence.NONE,
    )
    recurrence_days: Mapped[list[int]] = mapped_column(JSON, default=list)
