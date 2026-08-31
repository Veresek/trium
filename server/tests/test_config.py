import pytest
from pydantic import ValidationError

from app.config import Settings

STRONG_SECRET = "a-unique-production-secret-with-32-characters"


def test_development_allows_an_empty_instance_code() -> None:
    settings = Settings(
        environment="development",
        instance_code="",
    )

    assert settings.instance_code == ""


def test_production_rejects_an_empty_instance_code() -> None:
    with pytest.raises(
        ValidationError,
        match="INSTANCE_CODE must not be empty in production",
    ):
        Settings(
            environment="production",
            instance_code="",
            secret_key=STRONG_SECRET,
        )


@pytest.mark.parametrize(
    "secret_key",
    [
        "too-short",
        "a" * 40,
        "change-me-before-deploying",
        "replace-with-a-long-random-secret",
        "local-development-only",
    ],
)
def test_production_rejects_weak_or_default_secret_keys(
    secret_key: str,
) -> None:
    with pytest.raises(
        ValidationError,
        match="SECRET_KEY must be at least 32 characters and non-default",
    ):
        Settings(
            environment="production",
            instance_code="instance-code",
            secret_key=secret_key,
        )


def test_production_accepts_explicit_security_configuration() -> None:
    settings = Settings(
        environment="production",
        instance_code="instance-code",
        secret_key=STRONG_SECRET,
        client_origin="https://trium.example.com",
    )

    assert settings.environment == "production"


def test_production_rejects_an_insecure_client_origin() -> None:
    with pytest.raises(
        ValidationError,
        match="CLIENT_ORIGIN must use HTTPS in production",
    ):
        Settings(
            environment="production",
            instance_code="instance-code",
            secret_key=STRONG_SECRET,
            client_origin="http://trium.example.com",
        )
