from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Index, Integer, Text, UniqueConstraint, func
from sqlalchemy.orm import relationship

from app.db.database import Base


class Comment(Base):
    __tablename__ = "comments"
    __table_args__ = (Index("ix_comments_essay_approved", "essay_id", "is_approved"),)

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    is_approved = Column(Boolean, nullable=False, default=False, server_default="false")
    is_anonymous = Column(Boolean, nullable=False, default=False, server_default="false")
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    essay_id = Column(Integer, ForeignKey("essays.id", ondelete="CASCADE"), nullable=False)

    user = relationship("User", backref="comments", lazy="selectin")
    essay = relationship("Essay", backref="comments", lazy="selectin")


class Bookmark(Base):
    __tablename__ = "bookmarks"
    __table_args__ = (
        UniqueConstraint("user_id", "essay_id", name="uq_bookmarks_user_essay"),
        Index("ix_bookmarks_user_created", "user_id", "created_at"),
    )

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    essay_id = Column(Integer, ForeignKey("essays.id", ondelete="CASCADE"), nullable=False)

    user = relationship("User", backref="bookmarks", lazy="selectin")
    essay = relationship("Essay", backref="bookmarks", lazy="selectin")
