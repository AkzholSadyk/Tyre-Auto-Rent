from datetime import datetime

from pydantic import BaseModel

from app.schemas.common import ORMBase


class DocumentCreate(BaseModel):
    driver_license_url: str
    passport_or_id_url: str


class DocumentOut(ORMBase):
    id: int
    user_id: int
    driver_license_url: str
    passport_or_id_url: str
    verification_status: str
    created_at: datetime
