from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.schemas.common import ORMBase


class UserOut(ORMBase):
    id: int
    email: EmailStr
    first_name: str
    last_name: str
    phone: str | None = None
    is_verified: bool
    role: str
    created_at: datetime


class ProfileUpdateRequest(BaseModel):
    first_name: str | None = Field(default=None, min_length=1, max_length=80)
    last_name: str | None = Field(default=None, min_length=1, max_length=80)
    phone: str | None = None
