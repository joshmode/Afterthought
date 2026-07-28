from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.db.database import get_db
from app.models.essay import Theme
from app.schemas.theme import ThemeResponse, ThemeCreate
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[ThemeResponse])
async def get_themes(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    stmt = select(Theme).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/", response_model=ThemeResponse, dependencies=[Depends(get_current_user)])
async def create_theme(theme: ThemeCreate, db: AsyncSession = Depends(get_db)):
    new_theme = Theme(**theme.model_dump())
    db.add(new_theme)
    try:
        await db.commit()
        await db.refresh(new_theme)
        return new_theme
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Theme name already exists")
