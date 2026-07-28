from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.db.database import get_db
from app.models.essay import Series
from app.schemas.series import SeriesResponse, SeriesCreate
from app.api.deps import get_admin_user

router = APIRouter()


@router.get("/", response_model=list[SeriesResponse])
async def get_series(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Series).order_by(Series.name.asc()).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post(
    "/",
    response_model=SeriesResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(get_admin_user)],
)
async def create_series(series: SeriesCreate, db: AsyncSession = Depends(get_db)):
    new_series = Series(**series.model_dump())
    new_series.name = new_series.name.strip()
    db.add(new_series)
    try:
        await db.commit()
        await db.refresh(new_series)
        return new_series
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Series name already exists")
