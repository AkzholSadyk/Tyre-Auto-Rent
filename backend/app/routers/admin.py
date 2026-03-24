import json
from datetime import date, timedelta
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy.orm import Session

from app.core.config import get_admin_panel_credentials_signature, get_admin_panel_email, get_admin_panel_password, settings
from app.core.database import get_db
from app.core.deps import require_admin, require_admin_panel_token
from app.core.security import create_admin_panel_token
from app.models.booking import Booking
from app.models.car_blocked_day import CarBlockedDay
from app.models.car import Car
from app.models.document import Document
from app.models.driver_license import DriverLicense
from app.models.user import User
from app.schemas.admin import AdminUserOut
from app.schemas.driver_license import DriverLicenseAdminActionResponse, DriverLicenseOut

router = APIRouter(prefix='/admin', tags=['Admin Verification'])
CAR_UPLOAD_DIR = (Path(__file__).resolve().parents[2] / 'uploads' / 'cars').resolve()
HOME_UPLOAD_DIR = (Path(__file__).resolve().parents[2] / 'uploads' / 'home').resolve()
HOME_VIDEOS_META = HOME_UPLOAD_DIR / 'home_videos.json'
ABOUT_VIDEOS_META = HOME_UPLOAD_DIR / 'about_videos.json'
SOCIAL_VIDEOS_META = HOME_UPLOAD_DIR / 'social_videos.json'
HOMEPAGE_META = HOME_UPLOAD_DIR / 'homepage_content.json'


def _read_videos(meta_path: Path) -> list[str]:
    if not meta_path.exists():
        return []
    try:
        payload = json.loads(meta_path.read_text(encoding='utf-8'))
        videos = payload.get('videos', [])
        result: list[str] = []
        for raw in videos:
            if not isinstance(raw, str):
                continue
            if raw.startswith('/uploads/home/'):
                file_path = _home_file_from_public_path(raw)
                if not file_path.exists():
                    continue
            result.append(raw)
        return result
    except Exception:
        return []


def _write_videos(meta_path: Path, videos: list[str]) -> None:
    HOME_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    meta_path.write_text(json.dumps({'videos': videos}, ensure_ascii=False), encoding='utf-8')


def _home_file_from_public_path(public_path: str) -> Path:
    if not public_path.startswith('/uploads/home/'):
        raise HTTPException(status_code=400, detail='Invalid video path')
    file_name = public_path.split('/uploads/home/', 1)[1]
    return HOME_UPLOAD_DIR / file_name


async def _upload_videos(files: list[UploadFile], replace: bool, meta_path: Path, file_prefix: str) -> list[str]:
    if not files:
        raise HTTPException(status_code=400, detail='At least one video file is required')
    if len(files) > 3:
        raise HTTPException(status_code=400, detail='Maximum 3 video files allowed')

    HOME_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    existing_videos = [] if replace else _read_videos(meta_path)
    if replace:
        for old_path in _read_videos(meta_path):
            old_file = _home_file_from_public_path(old_path)
            if old_file.exists():
                old_file.unlink()

    if len(existing_videos) + len(files) > 3:
        raise HTTPException(status_code=400, detail='Total videos cannot exceed 3')

    urls: list[str] = list(existing_videos)
    for file in files:
        content_type = (file.content_type or '').lower()
        if content_type and not content_type.startswith('video/'):
            raise HTTPException(status_code=400, detail='Only video files are allowed')

        ext = Path(file.filename or '').suffix.lower() or '.mp4'
        file_name = f'{file_prefix}_{uuid4().hex}{ext}'
        path = HOME_UPLOAD_DIR / file_name
        path.write_bytes(await file.read())
        urls.append(f'/uploads/home/{file_name}')

    _write_videos(meta_path, urls)
    return urls


def _default_homepage_content() -> dict:
    return {
        'quick_search': {
            'title': 'Quick rental search',
            'locations': ['Almaty'],
            'car_types': ['SUV', 'Sedan', 'Premium'],
            'button_text': 'Search Car',
        },
        'popular': {
            'title': 'Popular Cars',
            'car_ids': [],
            'button_text': 'View all cars',
        },
        'why_choose': {
            'title': 'Why choose TYRE?',
            'items': [
                {'icon': '🚗', 'title': 'Premium cars', 'description': 'Only clean and new vehicles'},
                {'icon': '📍', 'title': 'Multiple pickup points', 'description': 'Airport and city delivery'},
                {'icon': '⚡', 'title': 'Fast booking', 'description': 'Confirm in WhatsApp in minutes'},
                {'icon': '🛡', 'title': 'Full insurance', 'description': 'Safe and secure rental'},
            ],
        },
        'how_it_works': {
            'title': 'How it works',
            'steps': [
                {'title': 'Choose your car', 'description': 'Browse our fleet'},
                {'title': 'Book online', 'description': 'Select dates'},
                {'title': 'Pick up car', 'description': 'Airport or office'},
                {'title': 'Drive and enjoy', 'description': 'Explore Almaty'},
            ],
        },
        'social': {
            'title': 'Follow TYRE on Instagram',
        },
        'reviews': {
            'title': 'Customer Reviews',
            'items': [
                {'name': 'Alex', 'rating': 5, 'text': 'Great service and clean cars!'},
                {'name': 'Maria', 'rating': 5, 'text': 'Very easy booking via WhatsApp'},
            ],
        },
        'cta': {
            'title': 'Need a car today?',
            'subtitle': 'Book now via WhatsApp',
            'button_text': 'Book now',
            'button_link': '',
        },
    }


def _read_homepage_content() -> dict:
    if not HOMEPAGE_META.exists():
        data = _default_homepage_content()
        _write_homepage_content(data)
        return data
    try:
        payload = json.loads(HOMEPAGE_META.read_text(encoding='utf-8'))
        if not isinstance(payload, dict):
            return _default_homepage_content()
        defaults = _default_homepage_content()
        defaults.update(payload)
        return defaults
    except Exception:
        return _default_homepage_content()


def _write_homepage_content(data: dict) -> None:
    HOME_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    HOMEPAGE_META.write_text(json.dumps(data, ensure_ascii=False), encoding='utf-8')


def _read_social_videos() -> list[dict]:
    if not SOCIAL_VIDEOS_META.exists():
        return []
    try:
        payload = json.loads(SOCIAL_VIDEOS_META.read_text(encoding='utf-8'))
        items = payload.get('items', [])
        result: list[dict] = []
        for row in items:
            if not isinstance(row, dict):
                continue
            video_url = str(row.get('video_url') or '')
            if not video_url.startswith('/uploads/home/'):
                continue
            file_path = _home_file_from_public_path(video_url)
            if not file_path.exists():
                continue
            result.append({'video_url': video_url, 'link_url': str(row.get('link_url') or '')})
        return result
    except Exception:
        return []


def _write_social_videos(items: list[dict]) -> None:
    HOME_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    SOCIAL_VIDEOS_META.write_text(json.dumps({'items': items}, ensure_ascii=False), encoding='utf-8')


@router.post('/panel/login')
def admin_panel_login(payload: dict):
    email = str(payload.get('email') or '').strip().lower()
    password = str(payload.get('password') or '')
    if email != get_admin_panel_email().lower() or password != get_admin_panel_password():
        raise HTTPException(status_code=401, detail='Invalid admin panel credentials')
    return {'access_token': create_admin_panel_token(get_admin_panel_credentials_signature()), 'token_type': 'bearer'}


@router.get('/home-videos/public')
def list_home_videos_public():
    return {'videos': _read_videos(HOME_VIDEOS_META)}


@router.get('/home-videos')
def list_home_videos(_: str = Depends(require_admin_panel_token)):
    return {'videos': _read_videos(HOME_VIDEOS_META)}


@router.post('/home-videos')
async def upload_home_videos(
    files: list[UploadFile] = File(...),
    replace: bool = Query(default=False),
    _: str = Depends(require_admin_panel_token),
):
    urls = await _upload_videos(files, replace, HOME_VIDEOS_META, 'home')
    return {'videos': urls}


@router.put('/home-videos')
def reorder_home_videos(payload: dict, _: str = Depends(require_admin_panel_token)):
    incoming = payload.get('videos')
    if not isinstance(incoming, list):
        raise HTTPException(status_code=400, detail='videos list is required')

    current = _read_videos(HOME_VIDEOS_META)
    if len(incoming) > 3:
        raise HTTPException(status_code=400, detail='Maximum 3 videos allowed')
    if len(set(incoming)) != len(incoming):
        raise HTTPException(status_code=400, detail='Duplicate video paths are not allowed')
    if set(map(str, incoming)) != set(current):
        raise HTTPException(status_code=400, detail='videos list must contain current videos only')

    ordered = [str(v) for v in incoming]
    _write_videos(HOME_VIDEOS_META, ordered)
    return {'videos': ordered}


@router.delete('/home-videos')
def delete_home_video(video_url: str = Query(...), _: str = Depends(require_admin_panel_token)):
    current = _read_videos(HOME_VIDEOS_META)
    if video_url not in current:
        raise HTTPException(status_code=404, detail='Video not found')

    file_path = _home_file_from_public_path(video_url)
    if file_path.exists():
        file_path.unlink()

    updated = [v for v in current if v != video_url]
    _write_videos(HOME_VIDEOS_META, updated)
    return {'videos': updated}


@router.get('/about-videos/public')
def list_about_videos_public():
    return {'videos': _read_videos(ABOUT_VIDEOS_META)}


@router.get('/about-videos')
def list_about_videos(_: str = Depends(require_admin_panel_token)):
    return {'videos': _read_videos(ABOUT_VIDEOS_META)}


@router.post('/about-videos')
async def upload_about_videos(
    files: list[UploadFile] = File(...),
    replace: bool = Query(default=False),
    _: str = Depends(require_admin_panel_token),
):
    urls = await _upload_videos(files, replace, ABOUT_VIDEOS_META, 'about')
    return {'videos': urls}


@router.put('/about-videos')
def reorder_about_videos(payload: dict, _: str = Depends(require_admin_panel_token)):
    incoming = payload.get('videos')
    if not isinstance(incoming, list):
        raise HTTPException(status_code=400, detail='videos list is required')

    current = _read_videos(ABOUT_VIDEOS_META)
    if len(incoming) > 3:
        raise HTTPException(status_code=400, detail='Maximum 3 videos allowed')
    if len(set(incoming)) != len(incoming):
        raise HTTPException(status_code=400, detail='Duplicate video paths are not allowed')
    if set(map(str, incoming)) != set(current):
        raise HTTPException(status_code=400, detail='videos list must contain current videos only')

    ordered = [str(v) for v in incoming]
    _write_videos(ABOUT_VIDEOS_META, ordered)
    return {'videos': ordered}


@router.delete('/about-videos')
def delete_about_video(video_url: str = Query(...), _: str = Depends(require_admin_panel_token)):
    current = _read_videos(ABOUT_VIDEOS_META)
    if video_url not in current:
        raise HTTPException(status_code=404, detail='Video not found')

    file_path = _home_file_from_public_path(video_url)
    if file_path.exists():
        file_path.unlink()

    updated = [v for v in current if v != video_url]
    _write_videos(ABOUT_VIDEOS_META, updated)
    return {'videos': updated}


@router.get('/social-videos/public')
def list_social_videos_public():
    return {'items': _read_social_videos()}


@router.get('/social-videos')
def list_social_videos(_: str = Depends(require_admin_panel_token)):
    return {'items': _read_social_videos()}


@router.post('/social-videos')
async def upload_social_videos(
    files: list[UploadFile] = File(...),
    replace: bool = Query(default=False),
    _: str = Depends(require_admin_panel_token),
):
    if not files:
        raise HTTPException(status_code=400, detail='At least one video file is required')
    if len(files) > 3:
        raise HTTPException(status_code=400, detail='Maximum 3 video files allowed')

    HOME_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    current = [] if replace else _read_social_videos()
    if replace:
        for old in _read_social_videos():
            old_file = _home_file_from_public_path(old['video_url'])
            if old_file.exists():
                old_file.unlink()

    if len(current) + len(files) > 3:
        raise HTTPException(status_code=400, detail='Total videos cannot exceed 3')

    items = list(current)
    for file in files:
        content_type = (file.content_type or '').lower()
        if content_type and not content_type.startswith('video/'):
            raise HTTPException(status_code=400, detail='Only video files are allowed')

        ext = Path(file.filename or '').suffix.lower() or '.mp4'
        file_name = f'social_{uuid4().hex}{ext}'
        path = HOME_UPLOAD_DIR / file_name
        path.write_bytes(await file.read())
        items.append({'video_url': f'/uploads/home/{file_name}', 'link_url': ''})

    _write_social_videos(items)
    return {'items': items}


@router.put('/social-videos')
def update_social_videos(payload: dict, _: str = Depends(require_admin_panel_token)):
    incoming = payload.get('items')
    if not isinstance(incoming, list):
        raise HTTPException(status_code=400, detail='items list is required')
    if len(incoming) > 3:
        raise HTTPException(status_code=400, detail='Maximum 3 videos allowed')

    current_urls = {row['video_url'] for row in _read_social_videos()}
    next_items: list[dict] = []
    next_urls: set[str] = set()
    for row in incoming:
        if not isinstance(row, dict):
            raise HTTPException(status_code=400, detail='Invalid items payload')
        video_url = str(row.get('video_url') or '')
        link_url = str(row.get('link_url') or '')
        if video_url not in current_urls:
            raise HTTPException(status_code=400, detail='items list must contain current videos only')
        if video_url in next_urls:
            raise HTTPException(status_code=400, detail='Duplicate video paths are not allowed')
        next_urls.add(video_url)
        next_items.append({'video_url': video_url, 'link_url': link_url})

    _write_social_videos(next_items)
    return {'items': next_items}


@router.delete('/social-videos')
def delete_social_video(video_url: str = Query(...), _: str = Depends(require_admin_panel_token)):
    current = _read_social_videos()
    found = next((row for row in current if row['video_url'] == video_url), None)
    if not found:
        raise HTTPException(status_code=404, detail='Video not found')
    file_path = _home_file_from_public_path(video_url)
    if file_path.exists():
        file_path.unlink()
    updated = [row for row in current if row['video_url'] != video_url]
    _write_social_videos(updated)
    return {'items': updated}


@router.get('/homepage/public')
def get_homepage_public():
    return _read_homepage_content()


@router.get('/homepage')
def get_homepage(_: str = Depends(require_admin_panel_token)):
    return _read_homepage_content()


@router.put('/homepage')
def update_homepage(payload: dict, _: str = Depends(require_admin_panel_token)):
    if not isinstance(payload, dict):
        raise HTTPException(status_code=400, detail='Invalid payload')
    defaults = _default_homepage_content()
    defaults.update(payload)
    _write_homepage_content(defaults)
    return defaults


@router.get('/users', response_model=list[AdminUserOut])
def list_users_with_status(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    users = db.query(User).order_by(User.created_at.desc()).all()
    response: list[AdminUserOut] = []

    for user in users:
        license_row = db.query(DriverLicense).filter(DriverLicense.user_id == user.id).first()
        document_row = db.query(Document).filter(Document.user_id == user.id).order_by(Document.created_at.desc()).first()
        bookings_count = db.query(Booking).filter(Booking.user_id == user.id).count()
        response.append(
            AdminUserOut(
                id=user.id,
                email=user.email,
                first_name=user.first_name,
                last_name=user.last_name,
                phone=user.phone,
                role=user.role,
                is_verified=user.is_verified,
                created_at=user.created_at,
                license_status=license_row.verification_status if license_row else None,
                document_status=document_row.verification_status if document_row else None,
                bookings_count=bookings_count,
            )
        )

    return response


@router.get('/documents')
def list_documents(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    rows = db.query(Document).order_by(Document.created_at.desc()).all()
    result = []
    for doc in rows:
        user = db.query(User).filter(User.id == doc.user_id).first()
        result.append(
            {
                'id': doc.id,
                'user_id': doc.user_id,
                'user_email': user.email if user else None,
                'user_name': f'{user.first_name} {user.last_name}' if user else None,
                'driver_license_url': doc.driver_license_url,
                'passport_or_id_url': doc.passport_or_id_url,
                'verification_status': doc.verification_status,
                'created_at': doc.created_at,
            }
        )
    return result


@router.post('/documents/{document_id}/approve', response_model=DriverLicenseAdminActionResponse)
def approve_document(document_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail='Document not found')

    doc.verification_status = 'approved'
    user = db.query(User).filter(User.id == doc.user_id).first()
    if user:
        user.is_verified = True
    db.commit()
    return DriverLicenseAdminActionResponse(message='Document approved, user verified')


@router.post('/documents/{document_id}/reject', response_model=DriverLicenseAdminActionResponse)
def reject_document(document_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail='Document not found')

    doc.verification_status = 'rejected'
    user = db.query(User).filter(User.id == doc.user_id).first()
    if user:
        user.is_verified = False
    db.commit()
    return DriverLicenseAdminActionResponse(message='Document rejected, user unverified')


@router.get('/licenses', response_model=list[DriverLicenseOut])
def list_licenses(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return db.query(DriverLicense).all()


@router.post('/licenses/{license_id}/approve', response_model=DriverLicenseAdminActionResponse)
def approve_license(license_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    row = db.query(DriverLicense).filter(DriverLicense.id == license_id).first()
    if not row:
        raise HTTPException(status_code=404, detail='License not found')

    row.verification_status = 'approved'
    user = db.query(User).filter(User.id == row.user_id).first()
    if user:
        user.is_verified = True
    db.commit()
    return DriverLicenseAdminActionResponse(message='License approved')


@router.post('/licenses/{license_id}/reject', response_model=DriverLicenseAdminActionResponse)
def reject_license(license_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    row = db.query(DriverLicense).filter(DriverLicense.id == license_id).first()
    if not row:
        raise HTTPException(status_code=404, detail='License not found')

    row.verification_status = 'rejected'
    user = db.query(User).filter(User.id == row.user_id).first()
    if user:
        user.is_verified = False
    db.commit()
    return DriverLicenseAdminActionResponse(message='License rejected')


@router.post('/cars/upload-images')
async def upload_car_images(files: list[UploadFile] = File(...), _: str = Depends(require_admin_panel_token)):
    CAR_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    urls = []
    for file in files:
        ext = Path(file.filename or '').suffix.lower() or '.jpg'
        file_name = f'car_{uuid4().hex}{ext}'
        path = CAR_UPLOAD_DIR / file_name
        path.write_bytes(await file.read())
        urls.append(f'/uploads/cars/{file_name}')
    return {'images': urls}


@router.get('/cars/available')
def get_available_cars_for_date(
    target_date: date = Query(default_factory=date.today),
    db: Session = Depends(get_db),
    _: str = Depends(require_admin_panel_token),
):
    cars = db.query(Car).filter(Car.status == 'available').all()
    available = []
    for car in cars:
        overlap = (
            db.query(Booking)
            .filter(
                Booking.car_id == car.id,
                Booking.start_date <= target_date,
                Booking.end_date > target_date,
            )
            .first()
        )
        is_blocked = (
            db.query(CarBlockedDay)
            .filter(CarBlockedDay.car_id == car.id, CarBlockedDay.blocked_date == target_date)
            .first()
        )
        if not overlap and not is_blocked:
            available.append(
                {
                    'id': car.id,
                    'brand': car.brand,
                    'model': car.model,
                    'price_per_day': car.price_per_day,
                    'status': car.status,
                    'image': (car.images or '').split(',')[0] if car.images else None,
                }
            )
    return available


@router.get('/cars/{car_id}/blocked-dates')
def list_blocked_dates(
    car_id: int,
    date_from: date = Query(default_factory=date.today),
    date_to: date | None = Query(default=None),
    db: Session = Depends(get_db),
    _: str = Depends(require_admin_panel_token),
):
    if date_to is None:
        date_to = date_from + timedelta(days=62)

    rows = (
        db.query(CarBlockedDay)
        .filter(CarBlockedDay.car_id == car_id, CarBlockedDay.blocked_date >= date_from, CarBlockedDay.blocked_date < date_to)
        .order_by(CarBlockedDay.blocked_date.asc())
        .all()
    )
    return [
        {
            'id': row.id,
            'car_id': row.car_id,
            'blocked_date': row.blocked_date,
            'reason': row.reason,
            'created_at': row.created_at,
        }
        for row in rows
    ]


@router.post('/cars/{car_id}/blocked-dates')
def add_blocked_date(car_id: int, payload: dict, db: Session = Depends(get_db), _: str = Depends(require_admin_panel_token)):
    car = db.query(Car).filter(Car.id == car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail='Car not found')

    blocked_date_raw = payload.get('blocked_date')
    blocked_date_from_raw = payload.get('blocked_date_from')
    blocked_date_to_raw = payload.get('blocked_date_to')
    reason = payload.get('reason')

    if blocked_date_from_raw and blocked_date_to_raw:
        blocked_from = date.fromisoformat(blocked_date_from_raw)
        blocked_to = date.fromisoformat(blocked_date_to_raw)
        if blocked_to < blocked_from:
            raise HTTPException(status_code=400, detail='blocked_date_to must be after or equal blocked_date_from')
    elif blocked_date_raw:
        blocked_from = date.fromisoformat(blocked_date_raw)
        blocked_to = blocked_from
    else:
        raise HTTPException(status_code=400, detail='blocked_date or blocked_date_from/blocked_date_to is required')

    created = 0
    cursor = blocked_from
    while cursor <= blocked_to:
        exists = (
            db.query(CarBlockedDay)
            .filter(CarBlockedDay.car_id == car_id, CarBlockedDay.blocked_date == cursor)
            .first()
        )
        if not exists:
            db.add(CarBlockedDay(car_id=car_id, blocked_date=cursor, reason=reason))
            created += 1
        cursor += timedelta(days=1)

    db.commit()
    return {'message': 'Dates blocked', 'created': created}


@router.delete('/cars/{car_id}/blocked-dates/{blocked_id}')
def delete_blocked_date(
    car_id: int,
    blocked_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(require_admin_panel_token),
):
    row = db.query(CarBlockedDay).filter(CarBlockedDay.id == blocked_id, CarBlockedDay.car_id == car_id).first()
    if not row:
        raise HTTPException(status_code=404, detail='Blocked date not found')
    db.delete(row)
    db.commit()
    return {'message': 'Blocked date removed'}
