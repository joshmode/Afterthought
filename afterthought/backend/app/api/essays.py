from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from app.db.database import get_db
from app.models.essay import Essay
from app.schemas.essay import EssayResponse, EssayCreate
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[EssayResponse])
async def get_essays(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    published_only: bool = True,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Essay).offset(skip).limit(limit)
    if published_only:
        stmt = stmt.where(Essay.is_published == True)

    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/{slug}", response_model=EssayResponse)
async def get_essay(slug: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Essay).where(Essay.slug == slug)
    result = await db.execute(stmt)
    essay = result.scalars().first()
    if not essay:
        raise HTTPException(status_code=404, detail="Essay not found")
    return essay

@router.post("/", response_model=EssayResponse, dependencies=[Depends(get_current_user)])
async def create_essay(essay: EssayCreate, db: AsyncSession = Depends(get_db)):
    new_essay = Essay(**essay.model_dump())
    db.add(new_essay)
    try:
        await db.commit()
        await db.refresh(new_essay)
        return new_essay
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Could not create essay (e.g., slug must be unique)")
