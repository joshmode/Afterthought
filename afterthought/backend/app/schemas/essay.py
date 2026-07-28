from pydantic import BaseModel, Field
from typing import Literal, Optional
from datetime import datetime


class ThemeSummary(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class SeriesSummary(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class EssayBase(BaseModel):
    title: str = Field(min_length=1, max_length=250)
    slug: str = Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$", max_length=250)
    abstract: Optional[str] = Field(default=None, max_length=2000)
    issue_number: Optional[int] = Field(default=None, ge=1)
    reading_time_minutes: Optional[int] = Field(default=None, ge=1, le=1440)
    featured_quote: Optional[str] = Field(default=None, max_length=1000)
    cover_illustration: Optional[str] = Field(default=None, max_length=1000)
    canonical_url: Optional[str] = Field(default=None, max_length=1000)
    seo_title: Optional[str] = Field(default=None, max_length=70)
    seo_description: Optional[str] = Field(default=None, max_length=170)


class EssayCreate(EssayBase):
    content: str = Field(min_length=1, max_length=500_000)
    series_id: Optional[int] = None
    theme_ids: list[int] = Field(default_factory=list, max_length=20)


class EssayUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=250)
    slug: Optional[str] = Field(
        default=None, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$", max_length=250
    )
    abstract: Optional[str] = Field(default=None, max_length=2000)
    content: Optional[str] = Field(default=None, min_length=1, max_length=500_000)
    reading_time_minutes: Optional[int] = Field(default=None, ge=1, le=1440)
    featured_quote: Optional[str] = Field(default=None, max_length=1000)
    cover_illustration: Optional[str] = Field(default=None, max_length=1000)
    canonical_url: Optional[str] = Field(default=None, max_length=1000)
    seo_title: Optional[str] = Field(default=None, max_length=70)
    seo_description: Optional[str] = Field(default=None, max_length=170)
    series_id: Optional[int] = None
    theme_ids: Optional[list[int]] = Field(default=None, max_length=20)


class EssaySummaryResponse(EssayBase):
    id: int
    is_published: bool
    is_current_issue: bool
    status: Literal["draft", "scheduled", "published", "archived"]
    view_count: int
    publication_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    series: Optional[SeriesSummary] = None
    themes: list[ThemeSummary] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class EssayResponse(EssaySummaryResponse):
    content: str
