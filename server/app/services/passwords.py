import bcrypt

PASSWORD_HINT = "That password does not meet the requirements."
PASSWORD_MAX_LENGTH = 128
PASSWORD_MIN_LENGTH = 8


def password_checks(password: str) -> dict[str, bool]:
    return {
        "length": PASSWORD_MIN_LENGTH <= len(password) <= PASSWORD_MAX_LENGTH,
        "letter": any(character.isalpha() for character in password),
        "number": any(character.isdigit() for character in password),
    }


def password_problem(password: str) -> str | None:
    if all(password_checks(password).values()):
        return None
    return PASSWORD_HINT


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(
            password.encode("utf-8"),
            password_hash.encode("utf-8"),
        )
    except ValueError:
        return False
