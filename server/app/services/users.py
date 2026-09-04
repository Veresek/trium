from sqlalchemy.orm import Session

from app.models.user import User


def delete_me(db: Session, user: User) -> None:
    db.delete(user)
    db.commit()
