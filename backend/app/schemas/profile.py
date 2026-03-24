from pydantic import BaseModel

from app.schemas.driver_license import DriverLicenseOut
from app.schemas.user import UserOut


class ProfileMeResponse(BaseModel):
    user: UserOut
    driver_license: DriverLicenseOut | None = None
