from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.db.database import get_db
from app.models.reader import ReadingHistory, UserPreferences
from app.schemas.reader import ReadingHistoryResponse, ReadingHistoryCreate, UserPreferencesResponse, UserPreferencesUpdate
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/preferences", response_model=UserPreferencesResponse)
async def get_preferences(current_user = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    stmt = select(UserPreferences).where(UserPreferences.user_id == current_user.id)
    result = await db.execute(stmt)
    prefs = result.scalars().first()
    if not prefs:
        prefs = UserPreferences(user_id=current_user.id)
        db.add(prefs)
        await db.commit()
        await db.refresh(prefs)
    return prefs

@router.put("/preferences", response_model=UserPreferencesResponse)
async def update_preferences(prefs_update: UserPreferencesUpdate, current_user = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    stmt = select(UserPreferences).where(UserPreferences.user_id == current_user.id)
    result = await db.execute(stmt)
    prefs = result.scalars().first()
    if not prefs:
        prefs = UserPreferences(user_id=current_user.id)
        db.add(prefs)

    update_data = prefs_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(prefs, key, value)

    await db.commit()
    await db.refresh(prefs)
    return prefs

@router.post("/history", response_model=ReadingHistoryResponse)
async def update_reading_history(history: ReadingHistoryCreate, current_user = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    stmt = select(ReadingHistory).where(ReadingHistory.user_id == current_user.id, ReadingHistory.essay_id == history.essay_id)
    result = await db.execute(stmt)
    existing = result.scalars().first()

    if existing:
        existing.progress_percent = history.progress_percent
        await db.commit()
        await db.refresh(existing)
        return existing

    new_history = ReadingHistory(**history.model_dump(), user_id=current_user.id)
    db.add(new_history)
    await db.commit()
    await db.refresh(new_history)
    return new_history

@router.get("/history", response_model=List[ReadingHistoryResponse])
async def get_reading_history(current_user = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    stmt = select(ReadingHistory).where(ReadingHistory.user_id == current_user.id).order_by(ReadingHistory.last_read_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()
