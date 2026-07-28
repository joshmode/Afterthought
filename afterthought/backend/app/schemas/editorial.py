from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.schemas.essay import EssayResponse

class DashboardStats(BaseModel):
    total_essays: int
    published_essays: int
    total_readers: int
    total_views: int

class EditorialCalendarItem(BaseModel):
    id: int
    title: str
    status: str
    publication_date: Optional[datetime] = None

class PublishRequest(BaseModel):
    publish_now: bool = True
    scheduled_date: Optional[datetime] = None
