from pydantic import BaseModel
from datetime import datetime

class SubmissionBase(BaseModel):
    author_name: str
    author_email: str
    title: str
    content: str

class SubmissionCreate(SubmissionBase):
    pass

class SubmissionResponse(SubmissionBase):
    id: int
    status: str
    created_at: datetime
    model_config = {"from_attributes": True}

class NotificationBase(BaseModel):
    message: str

class NotificationCreate(NotificationBase):
    user_id: int

class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime
    model_config = {"from_attributes": True}
