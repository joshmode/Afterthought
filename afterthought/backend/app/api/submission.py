from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.db.database import get_db
from app.models.submission import Submission, Notification
from app.schemas.submission import SubmissionResponse, SubmissionCreate, NotificationResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/submit", response_model=SubmissionResponse)
async def submit_essay(submission: SubmissionCreate, db: AsyncSession = Depends(get_db)):
    new_sub = Submission(**submission.model_dump())
    db.add(new_sub)
    await db.commit()
    await db.refresh(new_sub)
    return new_sub

@router.get("/notifications", response_model=List[NotificationResponse])
async def get_notifications(current_user = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    stmt = select(Notification).where(Notification.user_id == current_user.id).order_by(Notification.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: int, current_user = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    stmt = select(Notification).where(Notification.id == notification_id, Notification.user_id == current_user.id)
    result = await db.execute(stmt)
    notif = result.scalars().first()
    if notif:
        notif.is_read = True
        await db.commit()
    return {"success": True}
