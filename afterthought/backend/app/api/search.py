from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.database import get_db
from app.models.essay import Essay
from app.schemas.essay import EssaySummaryResponse

router = APIRouter()


def _escape_like(value: str) -> str:
    return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


@router.get("/", response_model=list[EssaySummaryResponse])
async def search_essays(
    q: str = Query(..., min_length=2, max_length=100),
    limit: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    pattern = f"%{_escape_like(q.strip())}%"
    stmt = (
        select(Essay)
        .options(
            selectinload(Essay.series),
            selectinload(Essay.themes),
            selectinload(Essay.author),
        )
        .where(
            Essay.is_published.is_(True),
            Essay.status == "published",
            or_(
                Essay.title.ilike(pattern, escape="\\"),
                Essay.content.ilike(pattern, escape="\\"),
                Essay.abstract.ilike(pattern, escape="\\"),
            ),
        )
        .order_by(Essay.publication_date.desc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    return result.scalars().unique().all()
