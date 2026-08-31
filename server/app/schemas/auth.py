from pydantic import EmailStr, Field

from app.schemas.base import ApiModel


class Credentials(ApiModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class RegisterRequest(ApiModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class VerifyRequest(ApiModel):
    email: EmailStr
    instance_code: str


class ResetRequest(VerifyRequest):
    new_password: str = Field(min_length=8, max_length=128)
