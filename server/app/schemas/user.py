import uuid
from datetime import datetime

from app.schemas.base import ApiModel, ApiReadModel


class UserRead(ApiReadModel):
    id: uuid.UUID
    email: str
    verified_at: datetime | None
    created_at: datetime


class UserUpdate(ApiModel):
    email: str
