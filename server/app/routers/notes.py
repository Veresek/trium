import uuid

from fastapi import APIRouter, Depends, HTTPException, status

from app.deps import get_current_user
from app.schemas.note import NoteCreate, NoteRead, NoteUpdate

router = APIRouter(
    prefix="/notes",
    tags=["notes"],
    dependencies=[Depends(get_current_user)],
)


def not_implemented() -> None:
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Note mutations are not implemented yet.",
    )


@router.get("", response_model=list[NoteRead])
def list_notes() -> list[NoteRead]:
    return []


@router.post("", response_model=NoteRead, status_code=status.HTTP_201_CREATED)
def create_note(_: NoteCreate) -> NoteRead:
    not_implemented()


@router.get("/{note_id}", response_model=NoteRead)
def get_note(note_id: uuid.UUID) -> NoteRead:
    del note_id
    not_implemented()


@router.patch("/{note_id}", response_model=NoteRead)
def update_note(note_id: uuid.UUID, _: NoteUpdate) -> NoteRead:
    del note_id
    not_implemented()


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(note_id: uuid.UUID) -> None:
    del note_id
    not_implemented()
