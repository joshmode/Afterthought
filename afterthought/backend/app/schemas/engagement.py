from pydantic import BaseModel
from datetime import datetime

class CommentBase(BaseModel):
    content: str
    essay_id: int

class CommentCreate(CommentBase):
    pass

class CommentResponse(CommentBase):
    id: int
    created_at: datetime
    is_approved: bool
    user_id: int

    model_config = {"from_attributes": True}

class BookmarkBase(BaseModel):
    essay_id: int

class BookmarkCreate(BookmarkBase):
    pass

class BookmarkResponse(BookmarkBase):
    id: int
    created_at: datetime
    user_id: int

    model_config = {"from_attributes": True}
