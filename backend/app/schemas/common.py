from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class ORMBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = 'bearer'


class Message(BaseModel):
    message: str


class DateRange(BaseModel):
    start_date: date
    end_date: date


class Timestamped(ORMBase):
    created_at: datetime
