# TYRE Platform

Full-stack car rental platform with FastAPI + Angular + PostgreSQL.

## Structure

- `backend/app/routers`: REST modules (`auth`, `cars`, `bookings`, `locations`, `payments`, `users`, `documents`)
- `backend/app/models`: SQLAlchemy models
- `backend/app/schemas`: Pydantic schemas
- `backend/app/services`: business logic services
- `frontend/tyre-frontend`: Angular responsive web app
- `database/migrations`: SQL migration scripts

## API Modules

- Authentication: `POST /api/v1/auth/login`, `POST /api/v1/auth/register`, `GET /api/v1/auth/me`
- Profile: `GET /api/v1/profile/me`, `PUT /api/v1/profile/update`, `POST /api/v1/profile/license-upload`
- Admin verification: `GET /api/v1/admin/licenses`, `POST /api/v1/admin/licenses/{id}/approve`, `POST /api/v1/admin/licenses/{id}/reject`
- Cars: `GET/POST/PUT/DELETE /api/v1/cars`
- Bookings: `POST/GET/PUT/DELETE /api/v1/bookings`
- Locations: `GET/POST/PUT /api/v1/locations`
- Payments: `POST /api/v1/payments/create`, `POST /api/v1/payments/webhook`
- Users: admin/user profile endpoints
- Documents: `POST /api/v1/documents/upload`, `GET /api/v1/documents/{user_id}`

## Multi-language frontend

Translation files:

- `frontend/tyre-frontend/src/assets/i18n/en.json`
- `frontend/tyre-frontend/src/assets/i18n/kk.json`
- `frontend/tyre-frontend/src/assets/i18n/ru.json`
- `frontend/tyre-frontend/src/assets/i18n/zh.json`

## Run with Docker

```bash
cd tyre-platform
docker compose up --build
```

- FastAPI: `http://localhost:8000`
- Nginx (frontend + reverse proxy): `http://localhost`
- PostgreSQL: `localhost:5432`

## Local backend run

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```


## RUN
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload  
ng serve --host 0.0.0.0

## Admin Panel
http://192.168.1.168:4200/admin/panel/ 
login pass in .env
