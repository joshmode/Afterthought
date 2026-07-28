from datetime import datetime, timezone
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_admin_user
from app.core.config import settings
from app.core.content import sanitize_editorial_html
from app.db.database import get_db
from app.models.editorial import EssayVersion
from app.models.engagement import Comment
from app.models.essay import Essay, Theme
from app.models.submission import Submission
from app.models.user import User
from app.schemas.editorial import DashboardStats, EditorialCalendarItem, PublishRequest
from app.schemas.essay import EssayResponse, EssaySummaryResponse, EssayUpdate

router = APIRouter()


def _essay_options():
    return (
        selectinload(Essay.series),
        selectinload(Essay.themes),
        selectinload(Essay.author),
    )


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    _admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)
):
    total_essays = (await db.execute(select(func.count()).select_from(Essay))).scalar() or 0
    published_essays = (
        await db.execute(
            select(func.count()).select_from(Essay).where(Essay.status == "published")
        )
    ).scalar() or 0
    total_readers = (
        await db.execute(
            select(func.count()).select_from(User).where(User.is_admin.is_(False))
        )
    ).scalar() or 0
    total_views = (await db.execute(select(func.coalesce(func.sum(Essay.view_count), 0)))).scalar()
    pending_comments = (
        await db.execute(
            select(func.count()).select_from(Comment).where(Comment.is_approved.is_(False))
        )
    ).scalar() or 0
    pending_submissions = (
        await db.execute(
            select(func.count())
            .select_from(Submission)
            .where(Submission.status.in_(["pending", "in_review"]))
        )
    ).scalar() or 0
    return DashboardStats(
        total_essays=total_essays,
        published_essays=published_essays,
        total_readers=total_readers,
        total_views=total_views or 0,
        pending_comments=pending_comments,
        pending_submissions=pending_submissions,
    )


@router.get("/calendar", response_model=list[EditorialCalendarItem])
async def get_editorial_calendar(
    _admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)
):
    stmt = select(Essay).order_by(Essay.publication_date.desc().nullslast(), Essay.id.desc()).limit(100)
    essays = (await db.execute(stmt)).scalars().all()
    return [
        EditorialCalendarItem(
            id=essay.id,
            title=essay.title,
            status=essay.status,
            publication_date=essay.publication_date,
        )
        for essay in essays
    ]


@router.get("/essays", response_model=list[EssaySummaryResponse])
async def get_editorial_essays(
    _admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)
):
    stmt = select(Essay).options(*_essay_options()).order_by(Essay.updated_at.desc())
    return (await db.execute(stmt)).scalars().unique().all()


@router.get("/essays/{essay_id}", response_model=EssayResponse)
async def get_editorial_essay(
    essay_id: int,
    _admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    essay = (
        await db.execute(
            select(Essay).options(*_essay_options()).where(Essay.id == essay_id)
        )
    ).scalars().first()
    if not essay:
        raise HTTPException(status_code=404, detail="Essay not found")
    return essay


@router.put("/essays/{essay_id}", response_model=EssayResponse)
async def update_essay(
    essay_id: int,
    update_data: EssayUpdate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    essay = (
        await db.execute(
            select(Essay).options(*_essay_options()).where(Essay.id == essay_id)
        )
    ).scalars().first()
    if not essay:
        raise HTTPException(status_code=404, detail="Essay not found")
    payload = update_data.model_dump(exclude_unset=True, exclude={"theme_ids"})
    if "content" in payload:
        sanitized = sanitize_editorial_html(payload["content"])
        if not sanitized:
            raise HTTPException(status_code=422, detail="Essay content is empty after sanitization")
        db.add(
            EssayVersion(
                essay_id=essay.id,
                content=essay.content,
                created_by_id=admin.id,
            )
        )
        payload["content"] = sanitized
    for key, value in payload.items():
        setattr(essay, key, value)
    if update_data.theme_ids is not None:
        unique_ids = set(update_data.theme_ids)
        themes = (
            await db.execute(select(Theme).where(Theme.id.in_(unique_ids)))
        ).scalars().all()
        if len(themes) != len(unique_ids):
            raise HTTPException(status_code=422, detail="One or more themes do not exist")
        essay.themes = list(themes)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Slug already exists")
    refreshed = await db.execute(
        select(Essay).options(*_essay_options()).where(Essay.id == essay.id)
    )
    return refreshed.scalars().one()


@router.delete("/essays/{essay_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_essay(
    essay_id: int,
    _admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    essay = (
        await db.execute(select(Essay).where(Essay.id == essay_id))
    ).scalars().first()
    if not essay:
        raise HTTPException(status_code=404, detail="Essay not found")
    if essay.status in {"published", "archived"}:
        raise HTTPException(status_code=409, detail="Published essays must be archived, not deleted")
    await db.delete(essay)
    await db.commit()


@router.post("/essays/{essay_id}/publish")
async def publish_essay(
    essay_id: int,
    request: PublishRequest,
    _admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    essay = (
        await db.execute(select(Essay).where(Essay.id == essay_id).with_for_update())
    ).scalars().first()
    if not essay:
        raise HTTPException(status_code=404, detail="Essay not found")
    if request.publish_now:
        await db.execute(
            update(Essay)
            .where(Essay.is_current_issue.is_(True), Essay.id != essay.id)
            .values(is_current_issue=False, status="archived")
        )
        max_issue = (await db.execute(select(func.max(Essay.issue_number)))).scalar() or 0
        essay.issue_number = essay.issue_number or max_issue + 1
        essay.status = "published"
        essay.is_published = True
        essay.is_current_issue = True
        essay.publication_date = datetime.now(timezone.utc)
    else:
        if request.scheduled_date is None:
            raise HTTPException(status_code=422, detail="scheduled_date is required")
        scheduled = request.scheduled_date
        if scheduled.tzinfo is None:
            scheduled = scheduled.replace(tzinfo=ZoneInfo(settings.publication_timezone))
        scheduled = scheduled.astimezone(timezone.utc)
        if scheduled <= datetime.now(timezone.utc):
            raise HTTPException(status_code=422, detail="scheduled_date must be in the future")
        essay.status = "scheduled"
        essay.is_published = False
        essay.is_current_issue = False
        essay.publication_date = scheduled
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Issue number conflict; retry the operation")
    return {"message": f"Essay {essay.id} status updated to {essay.status}"}
