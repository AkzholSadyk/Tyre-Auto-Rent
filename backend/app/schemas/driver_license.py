from datetime import datetime

from pydantic import BaseModel

from app.schemas.common import ORMBase


class DriverLicenseOut(ORMBase):
    id: int
    user_id: int
    license_number: str
    license_image_url: str
    verification_status: str
    uploaded_at: datetime


class DriverLicenseAdminActionResponse(BaseModel):
    message: str
