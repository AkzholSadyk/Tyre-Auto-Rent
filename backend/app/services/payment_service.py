from fastapi import HTTPException


SUPPORTED_PROVIDERS = {'stripe', 'paypal', 'kaspi'}


def validate_provider(provider: str) -> str:
    normalized = provider.lower().strip()
    if normalized not in SUPPORTED_PROVIDERS:
        raise HTTPException(status_code=400, detail='Unsupported payment provider')
    return normalized
