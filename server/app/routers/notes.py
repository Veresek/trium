import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.models.user import User
from app.schemas.note import NoteCreate, NoteRead, NoteUpdate
from app.services.notes import (
    create_owned_note,
    delete_owned_note,
    get_owned_note,
    list_owned_notes,
    update_owned_note,
)

router = APIRouter(prefix="/notes", tags=["notes"])


@router.get("", response_model=list[NoteRead])
def list_notes(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[NoteRead]:
    return list_owned_notes(db, user.id)


@router.post("", response_model=NoteRead, status_code=status.HTTP_201_CREATED)
def create_note(
    payload: NoteCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> NoteRead:
    return create_owned_note(db, user.id, payload)


@router.get("/{note_id}", response_model=NoteRead)
def get_note(
    note_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> NoteRead:
    return get_owned_note(db, note_id, user.id)


@router.patch("/{note_id}", response_model=NoteRead)
def update_note(
    note_id: uuid.UUID,
    payload: NoteUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> NoteRead:
    return update_owned_note(db, note_id, user.id, payload)


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    note_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> None:
    delete_owned_note(db, note_id, user.id)
