from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.models import Location
from app.models.user import User
from app.routers import admin, auth, bookings, cars, documents, locations, payments, profile, users

app = FastAPI(title=settings.app_name)

UPLOADS_ROOT = (Path(__file__).resolve().parents[1] / 'uploads').resolve()
LICENSES_ROOT = (UPLOADS_ROOT / 'licenses').resolve()
CARS_ROOT = (UPLOADS_ROOT / 'cars').resolve()
DOCS_ROOT = (UPLOADS_ROOT / 'documents').resolve()
UPLOADS_ROOT.mkdir(parents=True, exist_ok=True)
LICENSES_ROOT.mkdir(parents=True, exist_ok=True)
CARS_ROOT.mkdir(parents=True, exist_ok=True)
DOCS_ROOT.mkdir(parents=True, exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


def run_legacy_migrations():
    # Backward-compatible schema upgrades for existing databases.
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(120)"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(80)"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(80)"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE"))
        conn.execute(
            text(
                """
                UPDATE users
                SET first_name = COALESCE(NULLIF(split_part(COALESCE(full_name, ''), ' ', 1), ''), 'User')
                WHERE first_name IS NULL OR first_name = ''
                """
            )
        )
        conn.execute(
            text(
                """
                UPDATE users
                SET last_name = COALESCE(
                    NULLIF(TRIM(REGEXP_REPLACE(COALESCE(full_name, ''), '^\\S+\\s*', '')), ''),
                    'Customer'
                )
                WHERE last_name IS NULL OR last_name = ''
                """
            )
        )
        conn.execute(
            text(
                """
                UPDATE users
                SET full_name = CONCAT(first_name, ' ', last_name)
                WHERE full_name IS NULL OR full_name = ''
                """
            )
        )
        conn.execute(text("ALTER TABLE users ALTER COLUMN full_name SET DEFAULT ''"))
        conn.execute(text("ALTER TABLE users ALTER COLUMN first_name SET NOT NULL"))
        conn.execute(text("ALTER TABLE users ALTER COLUMN last_name SET NOT NULL"))
        conn.execute(text("ALTER TABLE users ALTER COLUMN is_verified SET NOT NULL"))

        conn.execute(
            text(
                """
                CREATE TABLE IF NOT EXISTS driver_licenses (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    license_number VARCHAR(100) NOT NULL,
                    license_image_url VARCHAR(255) NOT NULL,
                    verification_status VARCHAR(20) NOT NULL DEFAULT 'pending',
                    uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
                )
                """
            )
        )

        conn.execute(text("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pickup_type VARCHAR(30)"))
        conn.execute(text("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pickup_lat DOUBLE PRECISION"))
        conn.execute(text("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pickup_lng DOUBLE PRECISION"))
        conn.execute(text("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS dropoff_lat DOUBLE PRECISION"))
        conn.execute(text("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS dropoff_lng DOUBLE PRECISION"))
        conn.execute(text("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS delivery_price DOUBLE PRECISION"))
        conn.execute(text("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20)"))
        conn.execute(text("UPDATE bookings SET pickup_type = 'office' WHERE pickup_type IS NULL"))
        conn.execute(text("UPDATE bookings SET delivery_price = 0 WHERE delivery_price IS NULL"))
        conn.execute(text("UPDATE bookings SET payment_status = 'pending' WHERE payment_status IS NULL"))
        conn.execute(text("ALTER TABLE bookings ALTER COLUMN pickup_type SET DEFAULT 'office'"))
        conn.execute(text("ALTER TABLE bookings ALTER COLUMN delivery_price SET DEFAULT 0"))
        conn.execute(text("ALTER TABLE bookings ALTER COLUMN payment_status SET DEFAULT 'pending'"))
        conn.execute(text("ALTER TABLE bookings ALTER COLUMN pickup_type SET NOT NULL"))
        conn.execute(text("ALTER TABLE bookings ALTER COLUMN delivery_price SET NOT NULL"))
        conn.execute(text("ALTER TABLE bookings ALTER COLUMN payment_status SET NOT NULL"))
        conn.execute(text("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW()"))

        conn.execute(text("ALTER TABLE cars ADD COLUMN IF NOT EXISTS horsepower INTEGER"))
        conn.execute(text("ALTER TABLE cars ADD COLUMN IF NOT EXISTS engine VARCHAR(50)"))
        conn.execute(text("ALTER TABLE cars ADD COLUMN IF NOT EXISTS car_type VARCHAR(50)"))
        conn.execute(text("ALTER TABLE cars ADD COLUMN IF NOT EXISTS drive VARCHAR(60)"))
        conn.execute(text("ALTER TABLE cars ADD COLUMN IF NOT EXISTS acceleration VARCHAR(30)"))
        conn.execute(text("ALTER TABLE cars ADD COLUMN IF NOT EXISTS color VARCHAR(40)"))
        conn.execute(text("ALTER TABLE cars ADD COLUMN IF NOT EXISTS interior_color VARCHAR(40)"))
        conn.execute(text("ALTER TABLE cars ADD COLUMN IF NOT EXISTS max_speed VARCHAR(30)"))
        conn.execute(text("ALTER TABLE cars ADD COLUMN IF NOT EXISTS consumption VARCHAR(30)"))


@app.on_event('startup')
def on_startup():
    run_legacy_migrations()
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        users = db.query(User).all()
        for user in users:
            user.role = 'admin' if user.email.lower() == settings.admin_email.lower() else 'customer'
        if users:
            db.commit()

        if db.query(Location).count() == 0:
            db.add_all(
                [
                    Location(
                        name='TYRE Office',
                        type='office',
                        latitude=43.238949,
                        longitude=76.889709,
                        delivery_price=0.0,
                    ),
                    Location(
                        name='Almaty International Airport',
                        type='airport',
                        latitude=43.352100,
                        longitude=77.040497,
                        delivery_price=5000.0,
                    ),
                ]
            )
            db.commit()
    finally:
        db.close()


@app.get('/health')
def health_check():
    return {'status': 'ok'}


app.include_router(auth.router, prefix=settings.api_prefix)
app.include_router(profile.router, prefix=settings.api_prefix)
app.include_router(cars.router, prefix=settings.api_prefix)
app.include_router(bookings.router, prefix=settings.api_prefix)
app.include_router(locations.router, prefix=settings.api_prefix)
app.include_router(payments.router, prefix=settings.api_prefix)
app.include_router(users.router, prefix=settings.api_prefix)
app.include_router(documents.router, prefix=settings.api_prefix)
app.include_router(admin.router, prefix=settings.api_prefix)

app.mount('/uploads', StaticFiles(directory=str(UPLOADS_ROOT)), name='uploads')
