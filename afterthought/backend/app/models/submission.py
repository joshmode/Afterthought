from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import relationship

from app.db.database import Base


class Submission(Base):
    __tablename__ = "submissions"
    __table_args__ = (
        CheckConstraint(
            "status IN ('pending', 'in_review', 'accepted', 'rejected')",
            name="ck_submissions_status",
        ),
        Index("ix_submissions_status_created", "status", "created_at"),
    )

    id = Column(Integer, primary_key=True, index=True)
    author_name = Column(String, nullable=False)
    author_email = Column(String, nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    status = Column(String, nullable=False, default="pending", server_default="pending")
    reviewer_notes = Column(Text)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    reviewed_at = Column(DateTime(timezone=True))


class Notification(Base):
    __tablename__ = "notifications"
    __table_args__ = (Index("ix_notifications_user_read", "user_id", "is_read"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    message = Column(String, nullable=False)
    is_read = Column(Boolean, nullable=False, default=False, server_default="false")
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    user = relationship("User", backref="notifications", lazy="selectin")


class Feedback(Base):
    __tablename__ = "feedback"
    __table_args__ = (
        CheckConstraint(
            "status IN ('new', 'reviewed', 'resolved')",
            name="ck_feedback_status",
        ),
        Index("ix_feedback_status_created", "status", "created_at"),
    )

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String)
    category = Column(String, nullable=False, default="general", server_default="general")
    message = Column(Text, nullable=False)
    status = Column(String, nullable=False, default="new", server_default="new")
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
