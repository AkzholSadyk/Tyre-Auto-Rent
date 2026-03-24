from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.booking import Booking
from app.models.car import Car
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingOut

router = APIRouter(prefix='/bookings', tags=['Bookings'])


@router.post('', response_model=BookingOut)
def create_booking(payload: BookingCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.is_verified:
        raise HTTPException(
            status_code=403,
            detail="You must verify your driver's license before booking a car.",
        )

    days = (payload.end_date - payload.start_date).days
    if days <= 0:
        raise HTTPException(status_code=400, detail='end_date must be after start_date')
    if payload.start_date < date.today():
        raise HTTPException(status_code=400, detail='start_date cannot be in the past')

    car = db.query(Car).filter(Car.id == payload.car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail='Car not found')

    booking = Booking(
        user_id=current_user.id,
        car_id=payload.car_id,
        pickup_type='office',
        delivery_price=0.0,
        payment_status='pending',
        start_date=payload.start_date,
        end_date=payload.end_date,
        total_price=round(car.price_per_day * days, 2),
        booking_status='pending',
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


@router.get('', response_model=list[BookingOut])
def list_bookings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role == 'admin':
        return db.query(Booking).all()
    return db.query(Booking).filter(Booking.user_id == current_user.id).all()


@router.get('/{booking_id}', response_model=BookingOut)
def get_booking(booking_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail='Booking not found')
    if current_user.role != 'admin' and booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail='Not allowed')
    return booking


@router.delete('/{booking_id}')
def delete_booking(booking_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail='Booking not found')
    if current_user.role != 'admin' and booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail='Not allowed')
    db.delete(booking)
    db.commit()
    return {'message': 'Booking deleted'}
