from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.models.user import User
from app.schemas.state import AppStateRead
from app.services.state import read_app_state

router = APIRouter(tags=["state"])


@router.get("/state", response_model=AppStateRead)
def get_state(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> AppStateRead:
    return read_app_state(db, user.id)
