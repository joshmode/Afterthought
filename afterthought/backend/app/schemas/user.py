from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    display_name: Optional[str] = Field(default=None, min_length=1, max_length=100)


class UserCreate(UserBase):
    password: str = Field(min_length=12, max_length=72)

    @field_validator("password")
    @classmethod
    def password_fits_bcrypt(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password exceeds bcrypt's 72-byte limit")
        return value


class UserUpdate(BaseModel):
    display_name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    avatar: Optional[str] = Field(default=None, max_length=500)
    biography: Optional[str] = Field(default=None, max_length=2000)
    hide_identity: Optional[bool] = None


class UserResponse(UserBase):
    id: int
    avatar: Optional[str] = None
    biography: Optional[str] = None
    hide_identity: bool
    is_active: bool
    is_admin: bool
    created_at: datetime

    model_config = {"from_attributes": True}
