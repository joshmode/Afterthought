from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.db.database import get_db
from app.models.essay import Essay
from app.schemas.essay import EssayResponse

router = APIRouter()

@router.get("/", response_model=List[EssayResponse])
async def search_essays(
    q: str = Query(..., min_length=1),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Essay).where(
        Essay.is_published == True,
        (Essay.title.ilike(f"%{q}%")) | (Essay.content.ilike(f"%{q}%")) | (Essay.abstract.ilike(f"%{q}%"))
    )
    result = await db.execute(stmt)
    return result.scalars().all()
