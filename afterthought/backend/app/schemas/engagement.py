from pydantic import BaseModel, Field
from datetime import datetime


class CommentBase(BaseModel):
    content: str = Field(min_length=1, max_length=2000)
    essay_id: int


class CommentCreate(CommentBase):
    pass


class CommentResponse(CommentBase):
    id: int
    created_at: datetime
    is_approved: bool
    author_name: str
    is_anonymous: bool

    model_config = {"from_attributes": True}


class AdminCommentResponse(CommentResponse):
    user_id: int


class BookmarkBase(BaseModel):
    essay_id: int


class BookmarkCreate(BookmarkBase):
    pass


class BookmarkEssay(BaseModel):
    title: str
    slug: str
    reading_time_minutes: int | None = None

    model_config = {"from_attributes": True}


class BookmarkResponse(BookmarkBase):
    id: int
    created_at: datetime
    user_id: int
    essay: BookmarkEssay

    model_config = {"from_attributes": True}


class BookmarkState(BaseModel):
    bookmarked: bool
