from fastapi import Depends, Header, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import get_admin_panel_credentials_signature, settings
from app.core.database import get_db
from app.models.user import User


oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f'{settings.api_prefix}/auth/login')


def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail='Could not validate credentials',
        headers={'WWW-Authenticate': 'Bearer'},
    )
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        email = payload.get('sub')
        if email is None:
            raise credentials_exception
    except JWTError as exc:
        raise credentials_exception from exc

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != 'admin' or current_user.email.lower() != settings.admin_email.lower():
        raise HTTPException(status_code=403, detail='Admin access required')
    return current_user


def require_admin_panel_token(x_admin_panel_token: str | None = Header(default=None)) -> str:
    if not x_admin_panel_token:
        raise HTTPException(status_code=401, detail='Admin panel token required')

    credentials_exception = HTTPException(status_code=401, detail='Invalid admin panel token')
    try:
        payload = jwt.decode(x_admin_panel_token, settings.secret_key, algorithms=[settings.algorithm])
        if payload.get('scope') != 'admin_panel':
            raise credentials_exception
        if payload.get('sig') != get_admin_panel_credentials_signature():
            raise credentials_exception
    except JWTError as exc:
        raise credentials_exception from exc

    return x_admin_panel_token
