from sqlalchemy import Column, Integer, String, Boolean, DateTime, func, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.database import Base

class ReadingHistory(Base):
    __tablename__ = "reading_history"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    essay_id = Column(Integer, ForeignKey("essays.id"), nullable=False)
    progress_percent = Column(Integer, default=0)
    last_read_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", backref="reading_history")
    essay = relationship("Essay", backref="readers")

class UserPreferences(Base):
    __tablename__ = "user_preferences"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    email_notifications = Column(Boolean, default=True)
    anonymous_posting = Column(Boolean, default=False)
    font_size_preference = Column(String, default="medium")
    theme_preference = Column(String, default="system")

    user = relationship("User", backref="preferences", uselist=False)
