from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_admin
from app.models.location import Location
from app.models.user import User
from app.schemas.location import LocationCreate, LocationOut, LocationUpdate

router = APIRouter(prefix='/locations', tags=['Locations'])


@router.get('', response_model=list[LocationOut])
def list_locations(db: Session = Depends(get_db)):
    return db.query(Location).all()


@router.post('', response_model=LocationOut)
def create_location(payload: LocationCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    location = Location(**payload.model_dump())
    db.add(location)
    db.commit()
    db.refresh(location)
    return location


@router.put('/{location_id}', response_model=LocationOut)
def update_location(location_id: int, payload: LocationUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    location = db.query(Location).filter(Location.id == location_id).first()
    if not location:
        raise HTTPException(status_code=404, detail='Location not found')
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(location, key, value)
    db.commit()
    db.refresh(location)
    return location
