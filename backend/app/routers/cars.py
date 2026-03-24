from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_admin_panel_token
from app.models.booking import Booking
from app.models.car_blocked_day import CarBlockedDay
from app.models.car import Car
from app.schemas.car import CarCreate, CarOut, CarUpdate

router = APIRouter(prefix='/cars', tags=['Cars'])


@router.get('', response_model=list[CarOut])
def list_cars(db: Session = Depends(get_db)):
    return db.query(Car).all()


@router.get('/{car_id}', response_model=CarOut)
def get_car(car_id: int, db: Session = Depends(get_db)):
    car = db.query(Car).filter(Car.id == car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail='Car not found')
    return car


@router.post('', response_model=CarOut)
def create_car(payload: CarCreate, db: Session = Depends(get_db), _: str = Depends(require_admin_panel_token)):
    car = Car(**payload.model_dump())
    db.add(car)
    db.commit()
    db.refresh(car)
    return car


@router.put('/{car_id}', response_model=CarOut)
def update_car(
    car_id: int,
    payload: CarUpdate,
    db: Session = Depends(get_db),
    _: str = Depends(require_admin_panel_token),
):
    car = db.query(Car).filter(Car.id == car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail='Car not found')

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(car, key, value)
    db.commit()
    db.refresh(car)
    return car


@router.delete('/{car_id}')
def delete_car(car_id: int, db: Session = Depends(get_db), _: str = Depends(require_admin_panel_token)):
    car = db.query(Car).filter(Car.id == car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail='Car not found')
    db.delete(car)
    db.commit()
    return {'message': 'Car deleted'}


@router.get('/{car_id}/availability')
def car_availability(
    car_id: int,
    date_from: date = Query(default_factory=date.today),
    date_to: date | None = Query(default=None),
    db: Session = Depends(get_db),
):
    car = db.query(Car).filter(Car.id == car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail='Car not found')

    if date_to is None:
        date_to = date_from + timedelta(days=60)
    if date_to <= date_from:
        raise HTTPException(status_code=400, detail='date_to must be after date_from')

    bookings = (
        db.query(Booking)
        .filter(Booking.car_id == car_id, Booking.start_date < date_to, Booking.end_date > date_from)
        .all()
    )

    booked_days: set[str] = set()
    for b in bookings:
        day = b.start_date
        while day < b.end_date:
            if date_from <= day < date_to:
                booked_days.add(day.isoformat())
            day += timedelta(days=1)

    blocked_rows = (
        db.query(CarBlockedDay)
        .filter(CarBlockedDay.car_id == car_id, CarBlockedDay.blocked_date >= date_from, CarBlockedDay.blocked_date < date_to)
        .all()
    )
    blocked_days = {row.blocked_date.isoformat() for row in blocked_rows}

    timeline = []
    cursor = date_from
    while cursor < date_to:
        iso = cursor.isoformat()
        is_available = car.status == 'available' and iso not in booked_days and iso not in blocked_days
        timeline.append({'date': iso, 'available': is_available, 'blocked_by_admin': iso in blocked_days})
        cursor += timedelta(days=1)

    return {
        'car_id': car_id,
        'status': car.status,
        'date_from': date_from,
        'date_to': date_to,
        'booked_days': sorted(booked_days),
        'blocked_days': sorted(blocked_days),
        'timeline': timeline,
    }
