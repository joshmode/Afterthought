from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from app.db.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    display_name = Column(String)
    avatar = Column(String, nullable=True)
    biography = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    hide_identity = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
