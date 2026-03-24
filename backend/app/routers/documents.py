from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.document import Document
from app.models.user import User
from app.schemas.document import DocumentCreate, DocumentOut

router = APIRouter(prefix='/documents', tags=['Documents'])


@router.post('/upload', response_model=DocumentOut)
def upload_documents(payload: DocumentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(Document).filter(Document.user_id == current_user.id).first()
    if existing:
        existing.driver_license_url = payload.driver_license_url
        existing.passport_or_id_url = payload.passport_or_id_url
        existing.verification_status = 'pending'
        db.commit()
        db.refresh(existing)
        return existing

    document = Document(user_id=current_user.id, **payload.model_dump())
    db.add(document)
    db.commit()
    db.refresh(document)
    return document


@router.get('/{user_id}', response_model=list[DocumentOut])
def get_documents(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != 'admin' and current_user.id != user_id:
        raise HTTPException(status_code=403, detail='Not allowed')
    return db.query(Document).filter(Document.user_id == user_id).all()
