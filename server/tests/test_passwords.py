from app.services.passwords import (
    PASSWORD_HINT,
    hash_password,
    password_checks,
    password_problem,
    verify_password,
)


def test_hash_password_is_not_plaintext() -> None:
    hashed = hash_password("password1")

    assert hashed != "password1"
    assert hashed.startswith("$2")


def test_verify_password_accepts_the_original() -> None:
    hashed = hash_password("password1")

    assert verify_password("password1", hashed) is True


def test_verify_password_rejects_a_wrong_password() -> None:
    hashed = hash_password("password1")

    assert verify_password("other-password", hashed) is False


def test_verify_password_rejects_a_malformed_hash() -> None:
    assert verify_password("password1", "not-a-bcrypt-hash") is False


def test_password_problem_accepts_a_letter_and_a_number() -> None:
    assert password_problem("password1") is None


def test_password_problem_rejects_letters_only() -> None:
    assert password_problem("password") == PASSWORD_HINT


def test_password_problem_rejects_numbers_only() -> None:
    assert password_problem("12345678") == PASSWORD_HINT


def test_password_checks_are_independent() -> None:
    assert password_checks("password") == {
        "length": True,
        "letter": True,
        "number": False,
    }
