import uuid

from fastapi import APIRouter, Depends, HTTPException, status

from app.deps import get_current_user
from app.schemas.time_block import (
    TimeBlockCreate,
    TimeBlockRead,
    TimeBlockUpdate,
)

router = APIRouter(
    prefix="/blocks",
    tags=["blocks"],
    dependencies=[Depends(get_current_user)],
)


def not_implemented() -> None:
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Time block mutations are not implemented yet.",
    )


@router.get("", response_model=list[TimeBlockRead])
def list_blocks() -> list[TimeBlockRead]:
    return []


@router.post("", response_model=TimeBlockRead, status_code=status.HTTP_201_CREATED)
def create_block(_: TimeBlockCreate) -> TimeBlockRead:
    not_implemented()


@router.get("/{block_id}", response_model=TimeBlockRead)
def get_block(block_id: uuid.UUID) -> TimeBlockRead:
    del block_id
    not_implemented()


@router.patch("/{block_id}", response_model=TimeBlockRead)
def update_block(block_id: uuid.UUID, _: TimeBlockUpdate) -> TimeBlockRead:
    del block_id
    not_implemented()


@router.delete("/{block_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_block(block_id: uuid.UUID) -> None:
    del block_id
    not_implemented()
