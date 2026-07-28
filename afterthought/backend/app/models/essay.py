from sqlalchemy import Column, Integer, String, Boolean, DateTime, func, ForeignKey, Table, Text
from sqlalchemy.orm import relationship
from app.db.database import Base

essay_themes = Table(
    'essay_themes',
    Base.metadata,
    Column('essay_id', Integer, ForeignKey('essays.id')),
    Column('theme_id', Integer, ForeignKey('themes.id'))
)

class Series(Base):
    __tablename__ = "series"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String)
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    essays = relationship("Essay", back_populates="series")

class Theme(Base):
    __tablename__ = "themes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String)
    essays = relationship("Essay", secondary=essay_themes, back_populates="themes")

class Essay(Base):
    __tablename__ = "essays"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    abstract = Column(Text)
    content = Column(Text, nullable=False)
    issue_number = Column(Integer, unique=True)
    publication_date = Column(DateTime(timezone=True))
    reading_time_minutes = Column(Integer)
    featured_quote = Column(String)
    cover_illustration = Column(String)
    is_published = Column(Boolean, default=False)
    is_current_issue = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    series_id = Column(Integer, ForeignKey("series.id"))
    author_id = Column(Integer, ForeignKey("users.id"))

    series = relationship("Series", back_populates="essays")
    author = relationship("User")
    themes = relationship("Theme", secondary=essay_themes, back_populates="essays")
