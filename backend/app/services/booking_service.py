from math import atan2, cos, radians, sin, sqrt

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.car import Car


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    earth_radius = 6371.0
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return earth_radius * c


def calculate_delivery_price(pickup_type: str, pickup_lat: float | None, pickup_lng: float | None, dropoff_lat: float | None, dropoff_lng: float | None) -> float:
    if pickup_type == 'office':
        return 0.0
    if pickup_type == 'airport':
        return 5000.0
    if pickup_type == 'delivery':
        if None in (pickup_lat, pickup_lng, dropoff_lat, dropoff_lng):
            raise HTTPException(status_code=400, detail='Coordinates required for delivery pickup')
        distance_km = haversine_km(pickup_lat, pickup_lng, dropoff_lat, dropoff_lng)
        return round(distance_km * 700.0, 2)
    raise HTTPException(status_code=400, detail='Invalid pickup_type')


def calculate_total_price(db: Session, car_id: int, days: int, delivery_price: float) -> float:
    car = db.query(Car).filter(Car.id == car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail='Car not found')
    return round((car.price_per_day * days) + delivery_price, 2)
