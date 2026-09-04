import bcrypt

PASSWORD_HINT = "That password does not meet the requirements."
PASSWORD_MAX_LENGTH = 128
PASSWORD_MIN_LENGTH = 8
BCRYPT_MAX_BYTES = 72
BCRYPT_ROUNDS = 12


def password_checks(password: str) -> dict[str, bool]:
    encoded = password.encode("utf-8")
    return {
        "length": (
            PASSWORD_MIN_LENGTH <= len(password) <= PASSWORD_MAX_LENGTH
            and len(encoded) <= BCRYPT_MAX_BYTES
        ),
        "letter": any(character.isalpha() for character in password),
        "number": any(character.isdigit() for character in password),
    }


def password_problem(password: str) -> str | None:
    if all(password_checks(password).values()):
        return None
    return PASSWORD_HINT


def hash_password(password: str) -> str:
    encoded = password.encode("utf-8")
    if len(encoded) > BCRYPT_MAX_BYTES:
        raise ValueError(PASSWORD_HINT)
    return bcrypt.hashpw(encoded, bcrypt.gensalt(rounds=BCRYPT_ROUNDS)).decode(
        "utf-8"
    )


DUMMY_PASSWORD_HASH = hash_password("not-a-real-user-password")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(
            password.encode("utf-8"),
            password_hash.encode("utf-8"),
        )
    except ValueError:
        return False
