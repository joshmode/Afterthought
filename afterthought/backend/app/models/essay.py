from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Table,
    Text,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.orm import relationship

from app.db.database import Base

essay_themes = Table(
    "essay_themes",
    Base.metadata,
    Column("essay_id", Integer, ForeignKey("essays.id", ondelete="CASCADE"), primary_key=True),
    Column("theme_id", Integer, ForeignKey("themes.id", ondelete="CASCADE"), primary_key=True),
)


class Series(Base):
    __tablename__ = "series"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String)
    is_active = Column(Boolean, nullable=False, default=False, server_default="false")
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    essays = relationship("Essay", back_populates="series", lazy="selectin")


class Theme(Base):
    __tablename__ = "themes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String)
    essays = relationship("Essay", secondary=essay_themes, back_populates="themes", lazy="selectin")


class Essay(Base):
    __tablename__ = "essays"
    __table_args__ = (
        CheckConstraint(
            "status IN ('draft', 'scheduled', 'published', 'archived')",
            name="ck_essays_status",
        ),
        CheckConstraint(
            "reading_time_minutes IS NULL OR reading_time_minutes > 0",
            name="ck_essays_reading_time_positive",
        ),
        Index("ix_essays_status_publication", "status", "publication_date"),
        Index("ix_essays_series_id", "series_id"),
        Index(
            "uq_essays_single_current",
            "is_current_issue",
            unique=True,
            postgresql_where=text("is_current_issue = true"),
            sqlite_where=text("is_current_issue = 1"),
        ),
        Index(
            "ix_essays_title_trgm",
            "title",
            postgresql_using="gin",
            postgresql_ops={"title": "gin_trgm_ops"},
        ),
        Index(
            "ix_essays_abstract_trgm",
            "abstract",
            postgresql_using="gin",
            postgresql_ops={"abstract": "gin_trgm_ops"},
        ),
    )

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
    is_published = Column(Boolean, nullable=False, default=False, server_default="false")
    is_current_issue = Column(Boolean, nullable=False, default=False, server_default="false")
    view_count = Column(Integer, nullable=False, default=0, server_default="0")
    canonical_url = Column(String, nullable=True)
    seo_title = Column(String, nullable=True)
    seo_description = Column(String, nullable=True)
    status = Column(String, nullable=False, default="draft", server_default="draft")

    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )
    series_id = Column(Integer, ForeignKey("series.id", ondelete="SET NULL"))
    author_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))

    series = relationship("Series", back_populates="essays", lazy="selectin")
    author = relationship("User", lazy="selectin")
    themes = relationship("Theme", secondary=essay_themes, back_populates="essays", lazy="selectin")
