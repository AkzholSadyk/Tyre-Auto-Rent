from pydantic import BaseModel

from app.schemas.common import ORMBase


class LocationBase(BaseModel):
    name: str
    type: str
    latitude: float
    longitude: float
    delivery_price: float = 0.0


class LocationCreate(LocationBase):
    pass


class LocationUpdate(BaseModel):
    name: str | None = None
    type: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    delivery_price: float | None = None


class LocationOut(LocationBase, ORMBase):
    id: int
