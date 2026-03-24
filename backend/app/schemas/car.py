from datetime import datetime

from pydantic import BaseModel

from app.schemas.common import ORMBase


class CarBase(BaseModel):
    brand: str
    model: str
    year: int
    price_per_day: float
    deposit: float
    transmission: str
    fuel_type: str
    seats: int
    horsepower: int | None = None
    engine: str | None = None
    car_type: str | None = None
    drive: str | None = None
    acceleration: str | None = None
    color: str | None = None
    interior_color: str | None = None
    max_speed: str | None = None
    # Legacy single description (kept for backward compatibility)
    description: str | None = None
    # Multilingual descriptions
    description_en: str | None = None
    description_ru: str | None = None
    description_kk: str | None = None
    description_zh: str | None = None
    consumption: str | None = None
    images: str | None = None
    status: str = "available"


class CarCreate(CarBase):
    pass


class CarUpdate(BaseModel):
    brand: str | None = None
    model: str | None = None
    year: int | None = None
    price_per_day: float | None = None
    deposit: float | None = None
    transmission: str | None = None
    fuel_type: str | None = None
    seats: int | None = None
    horsepower: int | None = None
    engine: str | None = None
    car_type: str | None = None
    drive: str | None = None
    acceleration: str | None = None
    color: str | None = None
    interior_color: str | None = None
    max_speed: str | None = None
    description: str | None = None
    description_en: str | None = None
    description_ru: str | None = None
    description_kk: str | None = None
    description_zh: str | None = None
    consumption: str | None = None
    images: str | None = None
    status: str | None = None


class CarOut(CarBase, ORMBase):
    id: int
    created_at: datetime
