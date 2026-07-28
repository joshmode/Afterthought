from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserPreferencesBase(BaseModel):
    email_notifications: Optional[bool] = True
    anonymous_posting: Optional[bool] = False
    font_size_preference: Optional[str] = "medium"
    theme_preference: Optional[str] = "system"

class UserPreferencesUpdate(UserPreferencesBase):
    pass

class UserPreferencesResponse(UserPreferencesBase):
    id: int
    user_id: int
    model_config = {"from_attributes": True}

class ReadingHistoryBase(BaseModel):
    essay_id: int
    progress_percent: int

class ReadingHistoryCreate(ReadingHistoryBase):
    pass

class ReadingHistoryResponse(ReadingHistoryBase):
    id: int
    user_id: int
    last_read_at: datetime
    model_config = {"from_attributes": True}
