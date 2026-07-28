from pydantic import BaseModel, EmailStr, Field
from typing import Literal
from datetime import datetime


class SubmissionBase(BaseModel):
    author_name: str = Field(min_length=1, max_length=100)
    author_email: EmailStr
    title: str = Field(min_length=1, max_length=250)
    content: str = Field(min_length=100, max_length=500_000)


class SubmissionCreate(SubmissionBase):
    pass


class SubmissionResponse(SubmissionBase):
    id: int
    status: Literal["pending", "in_review", "accepted", "rejected"]
    reviewer_notes: str | None = None
    created_at: datetime
    reviewed_at: datetime | None = None
    model_config = {"from_attributes": True}


class SubmissionStatusUpdate(BaseModel):
    status: Literal["pending", "in_review", "accepted", "rejected"]
    reviewer_notes: str | None = Field(default=None, max_length=5000)


class NotificationBase(BaseModel):
    message: str = Field(min_length=1, max_length=500)


class NotificationCreate(NotificationBase):
    user_id: int


class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime
    model_config = {"from_attributes": True}


class FeedbackCreate(BaseModel):
    email: EmailStr | None = None
    category: Literal["general", "bug", "accessibility", "editorial"] = "general"
    message: str = Field(min_length=10, max_length=5000)


class FeedbackResponse(FeedbackCreate):
    id: int
    status: Literal["new", "reviewed", "resolved"]
    created_at: datetime

    model_config = {"from_attributes": True}


class FeedbackStatusUpdate(BaseModel):
    status: Literal["new", "reviewed", "resolved"]
