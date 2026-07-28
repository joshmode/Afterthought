from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.db.database import get_db
from app.models.essay import Theme
from app.schemas.theme import ThemeResponse, ThemeCreate
from app.api.deps import get_admin_user

router = APIRouter()


@router.get("/", response_model=list[ThemeResponse])
async def get_themes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Theme).order_by(Theme.name.asc()).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post(
    "/",
    response_model=ThemeResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(get_admin_user)],
)
async def create_theme(theme: ThemeCreate, db: AsyncSession = Depends(get_db)):
    new_theme = Theme(name=theme.name.strip(), description=theme.description)
    db.add(new_theme)
    try:
        await db.commit()
        await db.refresh(new_theme)
        return new_theme
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Theme name already exists")
