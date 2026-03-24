from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.document import Document
from app.models.driver_license import DriverLicense
from app.models.user import User
from app.schemas.driver_license import DriverLicenseOut
from app.schemas.profile import ProfileMeResponse
from app.schemas.user import ProfileUpdateRequest, UserOut

router = APIRouter(prefix='/profile', tags=['Profile'])

UPLOAD_DIR = (Path(__file__).resolve().parents[2] / 'uploads' / 'licenses').resolve()
DOCS_UPLOAD_DIR = (Path(__file__).resolve().parents[2] / 'uploads' / 'documents').resolve()


@router.get('/me', response_model=ProfileMeResponse)
def get_profile_me(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    license_row = db.query(DriverLicense).filter(DriverLicense.user_id == current_user.id).first()
    return ProfileMeResponse(user=current_user, driver_license=license_row)


@router.put('/update', response_model=UserOut)
def update_profile(payload: ProfileUpdateRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(current_user, key, value)
    current_user.full_name = f'{current_user.first_name} {current_user.last_name}'.strip()
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post('/license-upload', response_model=DriverLicenseOut)
async def upload_license(
    license_number: str = Form(...),
    license_image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    ext = Path(license_image.filename or '').suffix.lower() or '.jpg'
    file_name = f'{current_user.id}_{uuid4().hex}{ext}'
    file_path = UPLOAD_DIR / file_name
    public_path = f'/uploads/licenses/{file_name}'

    content = await license_image.read()
    file_path.write_bytes(content)

    existing = db.query(DriverLicense).filter(DriverLicense.user_id == current_user.id).first()
    if existing:
        existing.license_number = license_number
        existing.license_image_url = public_path
        existing.verification_status = 'pending'
        current_user.is_verified = False
        db.commit()
        db.refresh(existing)
        return existing

    row = DriverLicense(
        user_id=current_user.id,
        license_number=license_number,
        license_image_url=public_path,
        verification_status='pending',
    )
    db.add(row)
    current_user.is_verified = False
    db.commit()
    db.refresh(row)
    return row


@router.post('/document-upload')
async def upload_identity_documents(
    passport_or_id_image: UploadFile = File(...),
    driver_license_image: UploadFile | None = File(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    DOCS_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    passport_ext = Path(passport_or_id_image.filename or '').suffix.lower() or '.jpg'
    passport_file_name = f'passport_{current_user.id}_{uuid4().hex}{passport_ext}'
    passport_file_path = DOCS_UPLOAD_DIR / passport_file_name
    passport_file_path.write_bytes(await passport_or_id_image.read())
    passport_public_path = f'/uploads/documents/{passport_file_name}'

    existing_license = db.query(DriverLicense).filter(DriverLicense.user_id == current_user.id).first()
    license_public_path = existing_license.license_image_url if existing_license else None

    if driver_license_image is not None:
        dl_ext = Path(driver_license_image.filename or '').suffix.lower() or '.jpg'
        dl_file_name = f'license_{current_user.id}_{uuid4().hex}{dl_ext}'
        dl_file_path = DOCS_UPLOAD_DIR / dl_file_name
        dl_file_path.write_bytes(await driver_license_image.read())
        license_public_path = f'/uploads/documents/{dl_file_name}'

    if not license_public_path:
        raise HTTPException(
            status_code=400,
            detail='Driver license is required. Upload via license upload first or include driver_license_image file.',
        )

    existing_doc = db.query(Document).filter(Document.user_id == current_user.id).order_by(Document.created_at.desc()).first()
    if existing_doc:
        existing_doc.driver_license_url = license_public_path
        existing_doc.passport_or_id_url = passport_public_path
        existing_doc.verification_status = 'pending'
    else:
        db.add(
            Document(
                user_id=current_user.id,
                driver_license_url=license_public_path,
                passport_or_id_url=passport_public_path,
                verification_status='pending',
            )
        )

    current_user.is_verified = False
    db.commit()
    return {'message': 'Documents uploaded, waiting for admin verification'}
