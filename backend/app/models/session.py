import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class GameSession(Base):
    __tablename__ = "game_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    attempts_used: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    max_attempts: Mapped[int] = mapped_column(Integer, default=3, nullable=False)
    state: Mapped[str] = mapped_column(String(20), default="playing", nullable=False)
    # state: "playing" | "won" | "lost"
    solved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    last_seen_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    # Store current placement as JSON string for state persistence
    current_placement: Mapped[str | None] = mapped_column(Text, nullable=True)
    # Store marked clues as JSON string
    marked_clues: Mapped[str | None] = mapped_column(Text, nullable=True)

    @property
    def attempts_remaining(self) -> int:
        return self.max_attempts - self.attempts_used

    @property
    def is_active(self) -> bool:
        return self.state == "playing"
