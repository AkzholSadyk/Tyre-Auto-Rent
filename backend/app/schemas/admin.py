from datetime import datetime

from pydantic import BaseModel, EmailStr


class AdminUserOut(BaseModel):
    id: int
    email: EmailStr
    first_name: str
    last_name: str
    phone: str | None = None
    role: str
    is_verified: bool
    created_at: datetime
    license_status: str | None = None
    document_status: str | None = None
    bookings_count: int
