import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)
    event_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    # event_type examples: "session_started", "attempt_made", "attempt_failed",
    #                      "game_over", "game_won", "clue_marked"
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    # Optional extra data (JSON), e.g., {"attempts_remaining": 2}
    metadata_json: Mapped[str | None] = mapped_column(String(500), nullable=True)
