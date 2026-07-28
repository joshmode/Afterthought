from pydantic import BaseModel, Field
from typing import Optional


class ThemeBase(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: Optional[str] = Field(default=None, max_length=1000)


class ThemeCreate(ThemeBase):
    pass


class ThemeResponse(ThemeBase):
    id: int

    model_config = {"from_attributes": True}
