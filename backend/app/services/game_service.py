import json
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.session import GameSession
from app.models.event import AnalyticsEvent
from app.data.game_config import GAME_CONFIG, SOLUTION


class GameService:
    """
    Core game logic service.
    All game state validation happens here — never trust the frontend.
    """

    async def create_session(self, db: AsyncSession) -> GameSession:
        """Create a new game session."""
        session = GameSession(
            max_attempts=GAME_CONFIG["max_attempts"],
        )
        db.add(session)
        await db.flush()
        await db.refresh(session)

        # Log analytics
        await self._log_event(db, session.id, "session_started")
        return session

    async def get_session(self, db: AsyncSession, session_id: str) -> Optional[GameSession]:
        """Retrieve an existing session by ID."""
        result = await db.execute(
            select(GameSession).where(GameSession.id == session_id)
        )
        return result.scalar_one_or_none()

    async def touch_session(self, db: AsyncSession, session: GameSession) -> None:
        """Update last_seen_at for session persistence tracking."""
        session.last_seen_at = datetime.now(timezone.utc)
        await db.flush()

    async def submit_solution(
        self,
        db: AsyncSession,
        session: GameSession,
        placement: dict[str, str],
    ) -> dict:
        """
        Validate a submitted solution.
        
        Returns:
            dict with keys: correct (bool), attempts_remaining (int),
                           game_over (bool), reward (dict | None)
        """
        if not session.is_active:
            return {
                "correct": False,
                "attempts_remaining": 0,
                "game_over": session.state == "lost",
                "already_won": session.state == "won",
                "message": "Este caso já foi encerrado.",
                "reward": None,
            }

        # Validate placement has all characters
        expected_chars = {c["id"] for c in GAME_CONFIG["characters"]}
        submitted_chars = set(placement.keys())

        if expected_chars != submitted_chars:
            return {
                "correct": False,
                "attempts_remaining": session.attempts_remaining,
                "game_over": False,
                "already_won": False,
                "message": "Solução incompleta. Coloca todos os suspeitos.",
                "reward": None,
            }

        # Validate all locations are valid
        valid_locs = {l["id"] for l in GAME_CONFIG["locations"]}
        submitted_locs = set(placement.values())

        if not submitted_locs.issubset(valid_locs):
            return {
                "correct": False,
                "attempts_remaining": session.attempts_remaining,
                "game_over": False,
                "already_won": False,
                "message": "Localização inválida detectada.",
                "reward": None,
            }

        # Check for duplicate locations
        if len(submitted_locs) != len(placement):
            return {
                "correct": False,
                "attempts_remaining": session.attempts_remaining,
                "game_over": False,
                "already_won": False,
                "message": "Cada suspeito tem de estar num local diferente.",
                "reward": None,
            }

        # Compare against correct solution
        correct_placement = SOLUTION["placement"]
        is_correct = placement == correct_placement

        if is_correct:
            session.state = "won"
            session.solved_at = datetime.now(timezone.utc)
            await db.flush()
            await self._log_event(db, session.id, "game_won")

            return {
                "correct": True,
                "attempts_remaining": session.attempts_remaining,
                "game_over": False,
                "already_won": False,
                "message": "CASO RESOLVIDO",
                "reward": GAME_CONFIG["reward"],
            }
        else:
            # Increment attempts
            session.attempts_used += 1
            await db.flush()

            remaining = session.attempts_remaining

            await self._log_event(
                db, session.id, "attempt_failed",
                {"attempts_remaining": remaining}
            )

            if remaining <= 0:
                session.state = "lost"
                await db.flush()
                await self._log_event(db, session.id, "game_over")

                return {
                    "correct": False,
                    "attempts_remaining": 0,
                    "game_over": True,
                    "already_won": False,
                    "message": "CASO ENCERRADO",
                    "reward": None,
                }
            else:
                humorous_messages = [
                    "Dedução incorreta. A lógica não é obrigatória no DETI, mas ajudava.",
                    "Essa investigação precisava de mais umas aulas de Lógica Computacional.",
                    "Impressionante. Erraram com onze pessoas e onze locais.",
                    "O Estandarte continua desaparecido. A vossa dignidade também.",
                ]
                msg = humorous_messages[session.attempts_used % len(humorous_messages)]

                return {
                    "correct": False,
                    "attempts_remaining": remaining,
                    "game_over": False,
                    "already_won": False,
                    "message": msg,
                    "reward": None,
                }

    async def get_public_state(self, session: GameSession) -> dict:
        """Return safe public state (no solution data)."""
        placement = {}
        if session.current_placement:
            try:
                placement = json.loads(session.current_placement)
            except (json.JSONDecodeError, TypeError):
                placement = {}

        marked_clues = []
        if session.marked_clues:
            try:
                marked_clues = json.loads(session.marked_clues)
            except (json.JSONDecodeError, TypeError):
                marked_clues = []

        return {
            "session_id": session.id,
            "state": session.state,
            "attempts_used": session.attempts_used,
            "attempts_remaining": session.attempts_remaining,
            "max_attempts": session.max_attempts,
            "current_placement": placement,
            "marked_clues": marked_clues,
        }

    async def save_placement(
        self,
        db: AsyncSession,
        session: GameSession,
        placement: dict[str, str],
        marked_clues: list[str],
    ) -> None:
        """Persist current placement to DB (for reload recovery)."""
        session.current_placement = json.dumps(placement)
        session.marked_clues = json.dumps(marked_clues)
        await db.flush()

    async def _log_event(
        self,
        db: AsyncSession,
        session_id: str,
        event_type: str,
        metadata: dict | None = None,
    ) -> None:
        event = AnalyticsEvent(
            session_id=session_id,
            event_type=event_type,
            metadata_json=json.dumps(metadata) if metadata else None,
        )
        db.add(event)
        await db.flush()


game_service = GameService()
