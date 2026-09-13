from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import verify_token
from app.data.game_config import GAME_CONFIG
from app.models.session import GameSession
from app.services.game_service import game_service

router = APIRouter()
security = HTTPBearer()
limiter = Limiter(key_func=get_remote_address)


# ─── DEPENDENCY: Verify JWT auth token ────────────────────────────────────────

async def get_current_auth(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    token = credentials.credentials
    payload = verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado.",
        )
    return payload


# ─── DEPENDENCY: Get active game session ──────────────────────────────────────

async def get_active_session(
    session_id: str,
    db: AsyncSession = Depends(get_db),
) -> GameSession:
    session = await game_service.get_session(db, session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sessão não encontrada.",
        )
    return session


# ─── SCHEMAS ──────────────────────────────────────────────────────────────────

class GameStartResponse(BaseModel):
    session_id: str
    state: str
    attempts_remaining: int
    max_attempts: int
    characters: list[dict]
    locations: list[dict]
    clues: list[dict]
    current_placement: dict
    marked_clues: list[str]


class GameStateResponse(BaseModel):
    session_id: str
    state: str
    attempts_used: int
    attempts_remaining: int
    max_attempts: int
    current_placement: dict
    marked_clues: list[str]


class SubmitRequest(BaseModel):
    session_id: str
    placement: dict[str, str]  # char_id → loc_id


class SubmitResponse(BaseModel):
    correct: bool
    game_over: bool
    already_won: bool
    attempts_remaining: int
    message: str
    reward: Optional[dict] = None


class SaveStateRequest(BaseModel):
    session_id: str
    placement: dict[str, str]
    marked_clues: list[str]


# ─── ENDPOINTS ────────────────────────────────────────────────────────────────

@router.post("/game/start", response_model=GameStartResponse)
async def start_game(
    auth: dict = Depends(get_current_auth),
    db: AsyncSession = Depends(get_db),
) -> GameStartResponse:
    """
    Create a new game session.
    Returns game data (characters, locations, clues) — but NOT the solution.
    """
    session = await game_service.create_session(db)

    # Return public game data (no solution)
    return GameStartResponse(
        session_id=session.id,
        state=session.state,
        attempts_remaining=session.attempts_remaining,
        max_attempts=session.max_attempts,
        characters=GAME_CONFIG["characters"],
        locations=GAME_CONFIG["locations"],
        clues=GAME_CONFIG["clues"],
        current_placement={},
        marked_clues=[],
    )


@router.get("/game/state/{session_id}", response_model=GameStateResponse)
async def get_game_state(
    session_id: str,
    auth: dict = Depends(get_current_auth),
    db: AsyncSession = Depends(get_db),
) -> GameStateResponse:
    """
    Get current session state (for page refresh recovery).
    """
    session = await game_service.get_session(db, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada.")

    await game_service.touch_session(db, session)
    public_state = await game_service.get_public_state(session)

    return GameStateResponse(**public_state)


@router.post("/game/submit", response_model=SubmitResponse)
@limiter.limit("20/minute")
async def submit_solution(
    request: Request,
    body: SubmitRequest,
    auth: dict = Depends(get_current_auth),
    db: AsyncSession = Depends(get_db),
) -> SubmitResponse:
    """
    Submit a solution attempt.
    Solution is validated server-side — never trust the frontend.
    """
    session = await game_service.get_session(db, body.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada.")

    result = await game_service.submit_solution(db, session, body.placement)
    return SubmitResponse(**result)


@router.post("/game/save")
async def save_game_state(
    body: SaveStateRequest,
    auth: dict = Depends(get_current_auth),
    db: AsyncSession = Depends(get_db),
):
    """
    Auto-save current placement and marked clues (for reload recovery).
    """
    session = await game_service.get_session(db, body.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada.")

    if not session.is_active:
        raise HTTPException(status_code=400, detail="Sessão já encerrada.")

    await game_service.save_placement(
        db, session, body.placement, body.marked_clues
    )
    return {"ok": True}
