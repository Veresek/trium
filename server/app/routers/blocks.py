import uuid
from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.models.user import User
from app.schemas.time_block import TimeBlockCreate, TimeBlockRead, TimeBlockUpdate
from app.services.blocks import (
    create_owned_block,
    delete_owned_block,
    get_owned_block,
    list_owned_blocks,
    update_owned_block,
)

router = APIRouter(prefix="/blocks", tags=["blocks"])


@router.get("", response_model=list[TimeBlockRead])
def list_blocks(
    date_filter: Annotated[str | None, Query(alias="date")] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[TimeBlockRead]:
    on_date = None
    if date_filter is not None:
        try:
            on_date = date.fromisoformat(date_filter)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="Date must be YYYY-MM-DD.",
            ) from None
    return list_owned_blocks(db, user.id, on_date)


@router.post("", response_model=TimeBlockRead, status_code=status.HTTP_201_CREATED)
def create_block(
    payload: TimeBlockCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> TimeBlockRead:
    return create_owned_block(db, user.id, payload)


@router.get("/{block_id}", response_model=TimeBlockRead)
def get_block(
    block_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> TimeBlockRead:
    return get_owned_block(db, block_id, user.id)


@router.patch("/{block_id}", response_model=TimeBlockRead)
def update_block(
    block_id: uuid.UUID,
    payload: TimeBlockUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> TimeBlockRead:
    return update_owned_block(db, block_id, user.id, payload)


@router.delete("/{block_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_block(
    block_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> None:
    delete_owned_block(db, block_id, user.id)
