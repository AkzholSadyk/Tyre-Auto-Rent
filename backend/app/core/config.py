import hashlib
import os
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8')

    app_name: str = 'TYRE API'
    api_prefix: str = '/api/v1'

    database_url: str = 'postgresql://akzholsadyk@localhost:5432/tyre_db'

    secret_key: str = 'CHANGE_ME'
    algorithm: str = 'HS256'
    access_token_expire_minutes: int = 60
    admin_email: str = 'akzholsadyk@gmail.com'
    admin_panel_email: str = 'akzholsadyk@gmail.com'
    admin_panel_password: str = 'Admin'
    admin_panel_token_expire_minutes: int = 720

    stripe_api_key: str = ''
    paypal_client_id: str = ''
    paypal_secret: str = ''
    kaspi_merchant_id: str = ''
    google_maps_api_key: str = ''


settings = Settings()

_RUNTIME_ENV_FILE = (Path(__file__).resolve().parents[2] / '.env').resolve()


def _read_env_value(key: str) -> str | None:
    env_value = os.getenv(key)
    if env_value is not None and str(env_value).strip() != '':
        return str(env_value).strip().strip('"').strip("'")
    if not _RUNTIME_ENV_FILE.exists():
        return None
    try:
        for raw_line in _RUNTIME_ENV_FILE.read_text(encoding='utf-8').splitlines():
            line = raw_line.strip()
            if not line or line.startswith('#') or '=' not in line:
                continue
            env_key, env_value = line.split('=', 1)
            if env_key.strip() == key:
                return env_value.strip().strip('"').strip("'")
    except Exception:
        return None
    return None


def get_admin_panel_email() -> str:
    return _read_env_value('ADMIN_PANEL_EMAIL') or settings.admin_panel_email


def get_admin_panel_password() -> str:
    return _read_env_value('ADMIN_PANEL_PASSWORD') or settings.admin_panel_password


def get_admin_panel_credentials_signature() -> str:
    digest = hashlib.sha256(f'{get_admin_panel_email()}::{get_admin_panel_password()}'.encode('utf-8')).hexdigest()
    return digest[:24]
