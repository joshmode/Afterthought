from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_admin_user
from app.core.config import settings
from app.core.content import sanitize_editorial_html
from app.db.database import get_db
from app.models.essay import Essay, Theme
from app.models.user import User
from app.schemas.essay import EssayCreate, EssayResponse, EssaySummaryResponse

router = APIRouter()


def _essay_options():
    return (
        selectinload(Essay.series),
        selectinload(Essay.themes),
        selectinload(Essay.author),
    )


def _public_essay(essay: Essay) -> EssayResponse:
    response = EssayResponse.model_validate(essay)
    return response.model_copy(update={"content": sanitize_editorial_html(response.content)})


@router.get("/", response_model=list[EssaySummaryResponse])
async def get_essays(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    series_id: int | None = Query(default=None, ge=1),
    theme_id: int | None = Query(default=None, ge=1),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Essay)
        .options(*_essay_options())
        .where(Essay.is_published.is_(True), Essay.status == "published")
        .order_by(Essay.publication_date.desc(), Essay.id.desc())
        .offset(skip)
        .limit(limit)
    )
    if series_id is not None:
        stmt = stmt.where(Essay.series_id == series_id)
    if theme_id is not None:
        stmt = stmt.join(Essay.themes).where(Theme.id == theme_id)
    result = await db.execute(stmt)
    return result.scalars().unique().all()


@router.get("/current", response_model=EssayResponse)
async def get_current_essay(db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Essay)
        .options(*_essay_options())
        .where(
            Essay.is_current_issue.is_(True),
            Essay.is_published.is_(True),
            Essay.status == "published",
        )
        .order_by(Essay.publication_date.desc())
    )
    essay = (await db.execute(stmt)).scalars().first()
    if not essay:
        raise HTTPException(status_code=404, detail="No current issue is published")
    return _public_essay(essay)


@router.get("/next-publication")
async def get_next_publication():
    now = datetime.now(ZoneInfo(settings.publication_timezone))
    days_until_tuesday = (1 - now.weekday()) % 7
    target = (now + timedelta(days=days_until_tuesday)).replace(
        hour=9, minute=0, second=0, microsecond=0
    )
    if target <= now:
        target += timedelta(days=7)
    return {
        "publication_at": target.astimezone(timezone.utc),
        "timezone": settings.publication_timezone,
    }


@router.get("/{slug}", response_model=EssayResponse)
async def get_essay(slug: str, db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Essay)
        .options(*_essay_options())
        .where(
            Essay.slug == slug,
            Essay.is_published.is_(True),
            Essay.status == "published",
        )
    )
    essay = (await db.execute(stmt)).scalars().first()
    if not essay:
        raise HTTPException(status_code=404, detail="Essay not found")
    return _public_essay(essay)


@router.post("/", response_model=EssayResponse, status_code=status.HTTP_201_CREATED)
async def create_essay(
    essay: EssayCreate,
    current_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    data = essay.model_dump(exclude={"theme_ids"})
    data["content"] = sanitize_editorial_html(data["content"])
    if not data["content"]:
        raise HTTPException(status_code=422, detail="Essay content is empty after sanitization")
    new_essay = Essay(**data, author_id=current_user.id)
    if essay.theme_ids:
        themes = (
            await db.execute(select(Theme).where(Theme.id.in_(set(essay.theme_ids))))
        ).scalars().all()
        if len(themes) != len(set(essay.theme_ids)):
            raise HTTPException(status_code=422, detail="One or more themes do not exist")
        new_essay.themes = list(themes)
    db.add(new_essay)
    try:
        await db.commit()
        refreshed = await db.execute(
            select(Essay).options(*_essay_options()).where(Essay.id == new_essay.id)
        )
        return refreshed.scalars().one()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Slug or issue number already exists")
