from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from sqlalchemy import func
from app.db.database import get_db
from app.models.essay import Essay
from app.models.user import User
from app.schemas.editorial import DashboardStats, EditorialCalendarItem, PublishRequest
from app.api.deps import get_current_user
from datetime import datetime

router = APIRouter()

# Simple admin check dependency
async def get_admin_user(current_user = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user

@router.get("/stats", response_model=DashboardStats, dependencies=[Depends(get_admin_user)])
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    essays_count = (await db.execute(select(func.count()).select_from(Essay))).scalar()
    published_count = (await db.execute(select(func.count()).select_from(Essay).where(Essay.status == "published"))).scalar()
    users_count = (await db.execute(select(func.count()).select_from(User))).scalar()
    # Mocking total views correctly would require an analytics table, for now returning an estimated stat
    # based on readers and published essays as an improvement over static mocked data
    total_views = (users_count or 0) * (published_count or 0) * 3
    return DashboardStats(total_essays=essays_count, published_essays=published_count, total_readers=users_count, total_views=total_views)

@router.get("/calendar", response_model=List[EditorialCalendarItem], dependencies=[Depends(get_admin_user)])
async def get_editorial_calendar(db: AsyncSession = Depends(get_db)):
    stmt = select(Essay).order_by(Essay.publication_date.desc()).limit(20)
    result = await db.execute(stmt)
    essays = result.scalars().all()
    return [EditorialCalendarItem(id=e.id, title=e.title, status=e.status, publication_date=e.publication_date) for e in essays]

@router.post("/essays/{essay_id}/publish", dependencies=[Depends(get_admin_user)])
async def publish_essay(essay_id: int, req: PublishRequest, db: AsyncSession = Depends(get_db)):
    stmt = select(Essay).where(Essay.id == essay_id)
    result = await db.execute(stmt)
    essay = result.scalars().first()
    if not essay:
        raise HTTPException(status_code=404, detail="Essay not found")

    essay.status = "published" if req.publish_now else "scheduled"
    essay.is_published = req.publish_now
    essay.publication_date = datetime.now() if req.publish_now else req.scheduled_date

    await db.commit()
    await db.refresh(essay)
    return {"message": f"Essay {essay.id} status updated to {essay.status}"}
