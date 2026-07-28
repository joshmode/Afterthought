from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class SeriesBase(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: Optional[str] = Field(default=None, max_length=2000)
    is_active: bool = False


class SeriesCreate(SeriesBase):
    pass


class SeriesResponse(SeriesBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}
