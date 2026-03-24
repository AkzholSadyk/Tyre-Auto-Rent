from datetime import datetime

from pydantic import BaseModel

from app.schemas.common import ORMBase


class PaymentCreateRequest(BaseModel):
    booking_id: int
    provider: str
    currency: str = 'USD'


class PaymentWebhookRequest(BaseModel):
    provider: str
    transaction_id: str
    status: str
    booking_id: int


class PaymentOut(ORMBase):
    id: int
    booking_id: int
    provider: str
    amount: float
    currency: str
    status: str
    transaction_id: str | None = None
    created_at: datetime
