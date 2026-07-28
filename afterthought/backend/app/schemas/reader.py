from pydantic import BaseModel, Field
from typing import Literal, Optional
from datetime import datetime


class UserPreferencesBase(BaseModel):
    email_notifications: Optional[bool] = True
    anonymous_posting: Optional[bool] = False
    font_size_preference: Optional[Literal["small", "medium", "large"]] = "medium"
    theme_preference: Optional[Literal["system", "dark", "light"]] = "system"


class UserPreferencesUpdate(UserPreferencesBase):
    pass


class UserPreferencesResponse(UserPreferencesBase):
    id: int
    user_id: int
    model_config = {"from_attributes": True}


class ReadingHistoryBase(BaseModel):
    essay_id: int
    progress_percent: int = Field(ge=0, le=100)


class ReadingHistoryCreate(ReadingHistoryBase):
    pass


class ReadingHistoryEssay(BaseModel):
    title: str
    slug: str

    model_config = {"from_attributes": True}


class ReadingHistoryResponse(ReadingHistoryBase):
    id: int
    user_id: int
    last_read_at: datetime
    essay: ReadingHistoryEssay
    model_config = {"from_attributes": True}
