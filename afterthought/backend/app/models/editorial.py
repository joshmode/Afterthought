from sqlalchemy import Column, DateTime, ForeignKey, Index, Integer, Text, func
from sqlalchemy.orm import relationship

from app.db.database import Base


class EssayVersion(Base):
    __tablename__ = "essay_versions"
    __table_args__ = (Index("ix_essay_versions_essay_created", "essay_id", "created_at"),)

    id = Column(Integer, primary_key=True, index=True)
    essay_id = Column(Integer, ForeignKey("essays.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))

    essay = relationship("Essay", backref="versions", lazy="selectin")
