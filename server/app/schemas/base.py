from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

TITLE_MAX_LENGTH = 255
DESCRIPTION_MAX_LENGTH = 10_000


class ApiModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        serialize_by_alias=True,
    )


class ApiReadModel(ApiModel):
    model_config = ConfigDict(from_attributes=True)


def normalize_required_title(value: str) -> str:
    title = value.strip()
    if not title:
        raise ValueError("Title cannot be empty.")
    return title


def normalize_optional_title(value: str | None) -> str:
    if value is None:
        raise ValueError("Title cannot be null.")
    title = normalize_required_title(value)
    if len(title) > TITLE_MAX_LENGTH:
        raise ValueError(f"Title cannot exceed {TITLE_MAX_LENGTH} characters.")
    return title


def normalize_description(value: str) -> str:
    return value.strip()


def normalize_optional_description(value: str | None) -> str:
    if value is None:
        raise ValueError("Description cannot be null.")
    description = normalize_description(value)
    if len(description) > DESCRIPTION_MAX_LENGTH:
        raise ValueError(
            f"Description cannot exceed {DESCRIPTION_MAX_LENGTH} characters."
        )
    return description
