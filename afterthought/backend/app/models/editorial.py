from sqlalchemy import Column, Integer, String, Boolean, DateTime, func, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.db.database import Base

class EssayVersion(Base):
    __tablename__ = "essay_versions"
    id = Column(Integer, primary_key=True, index=True)
    essay_id = Column(Integer, ForeignKey("essays.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by_id = Column(Integer, ForeignKey("users.id"))

    essay = relationship("Essay", backref="versions")
