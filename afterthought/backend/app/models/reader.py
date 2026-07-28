from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import relationship

from app.db.database import Base


class ReadingHistory(Base):
    __tablename__ = "reading_history"
    __table_args__ = (
        UniqueConstraint("user_id", "essay_id", name="uq_reading_history_user_essay"),
        CheckConstraint(
            "progress_percent >= 0 AND progress_percent <= 100",
            name="ck_reading_history_progress",
        ),
        Index("ix_reading_history_user_last", "user_id", "last_read_at"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    essay_id = Column(Integer, ForeignKey("essays.id", ondelete="CASCADE"), nullable=False)
    progress_percent = Column(Integer, nullable=False, default=0, server_default="0")
    last_read_at = Column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    user = relationship("User", backref="reading_history", lazy="selectin")
    essay = relationship("Essay", backref="readers", lazy="selectin")


class UserPreferences(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    email_notifications = Column(Boolean, nullable=False, default=True, server_default="true")
    anonymous_posting = Column(Boolean, nullable=False, default=False, server_default="false")
    font_size_preference = Column(String, nullable=False, default="medium", server_default="medium")
    theme_preference = Column(String, nullable=False, default="system", server_default="system")

    user = relationship("User", backref="preferences", uselist=False)
