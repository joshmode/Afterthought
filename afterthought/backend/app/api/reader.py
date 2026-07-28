from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user
from app.db.database import get_db
from app.models.essay import Essay
from app.models.reader import ReadingHistory, UserPreferences
from app.models.user import User
from app.schemas.reader import (
    ReadingHistoryCreate,
    ReadingHistoryResponse,
    UserPreferencesResponse,
    UserPreferencesUpdate,
)

router = APIRouter()


@router.get("/preferences", response_model=UserPreferencesResponse)
async def get_preferences(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    prefs = (
        await db.execute(
            select(UserPreferences).where(UserPreferences.user_id == current_user.id)
        )
    ).scalars().first()
    if not prefs:
        prefs = UserPreferences(user_id=current_user.id)
        db.add(prefs)
        try:
            await db.commit()
        except IntegrityError:
            await db.rollback()
            prefs = (
                await db.execute(
                    select(UserPreferences).where(
                        UserPreferences.user_id == current_user.id
                    )
                )
            ).scalars().one()
        else:
            await db.refresh(prefs)
    return prefs


@router.put("/preferences", response_model=UserPreferencesResponse)
async def update_preferences(
    prefs_update: UserPreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    prefs = (
        await db.execute(
            select(UserPreferences).where(UserPreferences.user_id == current_user.id)
        )
    ).scalars().first()
    if not prefs:
        prefs = UserPreferences(user_id=current_user.id)
        db.add(prefs)
    for key, value in prefs_update.model_dump(exclude_unset=True).items():
        setattr(prefs, key, value)
    await db.commit()
    await db.refresh(prefs)
    return prefs


@router.post("/history", response_model=ReadingHistoryResponse)
async def update_reading_history(
    history: ReadingHistoryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    essay = (
        await db.execute(
            select(Essay).where(
                Essay.id == history.essay_id,
                Essay.is_published.is_(True),
                Essay.status == "published",
            )
        )
    ).scalars().first()
    if not essay:
        raise HTTPException(status_code=404, detail="Published essay not found")
    existing = (
        await db.execute(
            select(ReadingHistory)
            .options(selectinload(ReadingHistory.essay))
            .where(
                ReadingHistory.user_id == current_user.id,
                ReadingHistory.essay_id == history.essay_id,
            )
        )
    ).scalars().first()
    if existing:
        existing.progress_percent = history.progress_percent
        await db.commit()
        await db.refresh(existing)
        return existing
    new_history = ReadingHistory(**history.model_dump(), user_id=current_user.id)
    new_history.essay = essay
    db.add(new_history)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        existing = (
            await db.execute(
                select(ReadingHistory)
                .options(selectinload(ReadingHistory.essay))
                .where(
                    ReadingHistory.user_id == current_user.id,
                    ReadingHistory.essay_id == history.essay_id,
                )
            )
        ).scalars().one()
        existing.progress_percent = history.progress_percent
        await db.commit()
        return existing
    await db.refresh(new_history)
    return new_history


@router.get("/history", response_model=list[ReadingHistoryResponse])
async def get_reading_history(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(ReadingHistory)
        .options(selectinload(ReadingHistory.essay))
        .where(ReadingHistory.user_id == current_user.id)
        .order_by(ReadingHistory.last_read_at.desc())
        .limit(100)
    )
    return (await db.execute(stmt)).scalars().all()
