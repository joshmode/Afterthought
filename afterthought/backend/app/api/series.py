from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.db.database import get_db
from app.models.essay import Series
from app.schemas.series import SeriesResponse, SeriesCreate
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[SeriesResponse])
async def get_series(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    stmt = select(Series).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/", response_model=SeriesResponse, dependencies=[Depends(get_current_user)])
async def create_series(series: SeriesCreate, db: AsyncSession = Depends(get_db)):
    new_series = Series(**series.model_dump())
    db.add(new_series)
    try:
        await db.commit()
        await db.refresh(new_series)
        return new_series
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Series name already exists")
