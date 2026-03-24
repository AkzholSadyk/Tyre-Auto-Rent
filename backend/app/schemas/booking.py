from datetime import date, datetime

from pydantic import BaseModel

from app.schemas.common import ORMBase


class BookingCreate(BaseModel):
    car_id: int
    start_date: date
    end_date: date


class BookingOut(ORMBase):
    id: int
    user_id: int
    car_id: int
    start_date: date
    end_date: date
    total_price: float
    booking_status: str
    created_at: datetime
