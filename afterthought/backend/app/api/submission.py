from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_admin_user, get_current_user
from app.core.rate_limit import rate_limit
from app.db.database import get_db
from app.models.submission import Feedback, Notification, Submission
from app.models.user import User
from app.schemas.submission import (
    FeedbackCreate,
    FeedbackResponse,
    FeedbackStatusUpdate,
    NotificationResponse,
    SubmissionCreate,
    SubmissionResponse,
    SubmissionStatusUpdate,
)

router = APIRouter()


async def _notify_admins(db: AsyncSession, message: str) -> None:
    admin_ids = (
        await db.execute(select(User.id).where(User.is_admin.is_(True), User.is_active.is_(True)))
    ).scalars().all()
    db.add_all([Notification(user_id=user_id, message=message) for user_id in admin_ids])


@router.post(
    "/submit",
    response_model=SubmissionResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(rate_limit("submissions", 3, 3600))],
)
async def submit_essay(submission: SubmissionCreate, db: AsyncSession = Depends(get_db)):
    new_submission = Submission(**submission.model_dump())
    db.add(new_submission)
    await db.flush()
    await _notify_admins(db, f"New essay submission: {new_submission.title}")
    await db.commit()
    await db.refresh(new_submission)
    return new_submission


@router.get("/editorial/submissions", response_model=list[SubmissionResponse])
async def list_submissions(
    _admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)
):
    stmt = select(Submission).order_by(Submission.created_at.desc()).limit(200)
    return (await db.execute(stmt)).scalars().all()


@router.patch("/editorial/submissions/{submission_id}", response_model=SubmissionResponse)
async def update_submission(
    submission_id: int,
    update: SubmissionStatusUpdate,
    _admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    submission = (
        await db.execute(select(Submission).where(Submission.id == submission_id))
    ).scalars().first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    submission.status = update.status
    submission.reviewer_notes = update.reviewer_notes
    submission.reviewed_at = (
        datetime.now(timezone.utc) if update.status in {"accepted", "rejected"} else None
    )
    await db.commit()
    await db.refresh(submission)
    return submission


@router.post(
    "/feedback",
    response_model=FeedbackResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(rate_limit("feedback", 5, 3600))],
)
async def create_feedback(feedback: FeedbackCreate, db: AsyncSession = Depends(get_db)):
    item = Feedback(**feedback.model_dump())
    db.add(item)
    await db.flush()
    await _notify_admins(db, f"New {item.category} feedback received")
    await db.commit()
    await db.refresh(item)
    return item


@router.get("/editorial/feedback", response_model=list[FeedbackResponse])
async def list_feedback(
    _admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)
):
    return (
        await db.execute(select(Feedback).order_by(Feedback.created_at.desc()).limit(200))
    ).scalars().all()


@router.patch("/editorial/feedback/{feedback_id}", response_model=FeedbackResponse)
async def update_feedback(
    feedback_id: int,
    update: FeedbackStatusUpdate,
    _admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    item = (
        await db.execute(select(Feedback).where(Feedback.id == feedback_id))
    ).scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Feedback not found")
    item.status = update.status
    await db.commit()
    await db.refresh(item)
    return item


@router.get("/notifications", response_model=list[NotificationResponse])
async def get_notifications(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(100)
    )
    return (await db.execute(stmt)).scalars().all()


@router.post("/notifications/{notification_id}/read", status_code=status.HTTP_204_NO_CONTENT)
async def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    notification = (
        await db.execute(
            select(Notification).where(
                Notification.id == notification_id,
                Notification.user_id == current_user.id,
            )
        )
    ).scalars().first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    notification.is_read = True
    await db.commit()
