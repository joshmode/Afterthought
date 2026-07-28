from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class EssayBase(BaseModel):
    title: str
    slug: str
    abstract: Optional[str] = None
    content: str
    issue_number: Optional[int] = None
    reading_time_minutes: Optional[int] = None
    featured_quote: Optional[str] = None

class EssayCreate(EssayBase):
    series_id: Optional[int] = None

class EssayResponse(EssayBase):
    id: int
    is_published: bool
    is_current_issue: bool
    publication_date: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}
