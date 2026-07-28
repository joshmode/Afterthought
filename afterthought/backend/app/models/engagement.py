from sqlalchemy import Column, Integer, String, Boolean, DateTime, func, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.database import Base

class Comment(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_approved = Column(Boolean, default=False)
    user_id = Column(Integer, ForeignKey("users.id"))
    essay_id = Column(Integer, ForeignKey("essays.id"))

    user = relationship("User", backref="comments")
    essay = relationship("Essay", backref="comments")

class Bookmark(Base):
    __tablename__ = "bookmarks"
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(Integer, ForeignKey("users.id"))
    essay_id = Column(Integer, ForeignKey("essays.id"))

    user = relationship("User", backref="bookmarks")
    essay = relationship("Essay", backref="bookmarks")
