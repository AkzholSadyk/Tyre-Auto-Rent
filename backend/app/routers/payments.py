from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.booking import Booking
from app.models.payment import Payment
from app.models.user import User
from app.schemas.payment import PaymentCreateRequest, PaymentOut, PaymentWebhookRequest
from app.services.payment_service import validate_provider

router = APIRouter(prefix='/payments', tags=['Payments'])


@router.post('/create', response_model=PaymentOut)
def create_payment(payload: PaymentCreateRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    booking = db.query(Booking).filter(Booking.id == payload.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail='Booking not found')
    if current_user.role != 'admin' and booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail='Not allowed')

    provider = validate_provider(payload.provider)

    payment = db.query(Payment).filter(Payment.booking_id == payload.booking_id).first()
    if payment:
        return payment

    payment = Payment(
        booking_id=booking.id,
        provider=provider,
        amount=booking.total_price,
        currency=payload.currency,
        status='created',
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


@router.post('/webhook')
def payment_webhook(payload: PaymentWebhookRequest, db: Session = Depends(get_db)):
    payment = db.query(Payment).filter(Payment.booking_id == payload.booking_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail='Payment not found')

    payment.status = payload.status
    payment.transaction_id = payload.transaction_id

    booking = db.query(Booking).filter(Booking.id == payload.booking_id).first()
    if booking and payload.status.lower() in {'paid', 'succeeded', 'completed'}:
        if booking.booking_status == 'pending':
            booking.booking_status = 'confirmed'

    db.commit()
    return {'message': 'Webhook processed'}
