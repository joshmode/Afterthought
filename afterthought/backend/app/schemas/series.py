from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SeriesBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = False

class SeriesCreate(SeriesBase):
    pass

class SeriesResponse(SeriesBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}
