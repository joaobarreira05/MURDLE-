from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_db
from app.core.security import create_access_token

router = APIRouter()
settings = get_settings()
limiter = Limiter(key_func=get_remote_address)


class AuthRequest(BaseModel):
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    message: str


@router.post("/auth", response_model=AuthResponse)
@limiter.limit("10/minute")
async def authenticate(
    request: Request,
    body: AuthRequest,
    db: AsyncSession = Depends(get_db),
) -> AuthResponse:
    """
    Validate game access password.
    Password is NEVER sent to frontend — only validated here.
    Returns JWT token on success.
    """
    # Constant-time comparison to prevent timing attacks
    import hmac

    if not hmac.compare_digest(
        body.password.strip(),
        settings.GAME_ACCESS_PASSWORD,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Código de acesso inválido.",
        )

    # Create JWT token (no session_id yet — session created on game start)
    token = create_access_token(
        data={"type": "auth"},
        expires_delta=timedelta(hours=settings.ACCESS_TOKEN_EXPIRE_HOURS),
    )

    return AuthResponse(
        access_token=token,
        message="Acesso autorizado. Bem-vindo ao caso.",
    )
