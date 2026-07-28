from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_admin_user, get_current_user
from app.core.rate_limit import rate_limit
from app.db.database import get_db
from app.models.engagement import Bookmark, Comment
from app.models.essay import Essay
from app.models.reader import UserPreferences
from app.models.user import User
from app.schemas.engagement import (
    AdminCommentResponse,
    BookmarkCreate,
    BookmarkResponse,
    BookmarkState,
    CommentCreate,
    CommentResponse,
)

router = APIRouter()


def _comment_payload(comment: Comment, admin: bool = False) -> dict:
    anonymous = comment.is_anonymous or comment.user.hide_identity
    payload = {
        "id": comment.id,
        "content": comment.content,
        "essay_id": comment.essay_id,
        "created_at": comment.created_at,
        "is_approved": comment.is_approved,
        "is_anonymous": anonymous,
        "author_name": "Anonymous" if anonymous else (comment.user.display_name or "Reader"),
    }
    if admin:
        payload["user_id"] = comment.user_id
    return payload


@router.get("/essays/{essay_id}/comments", response_model=list[CommentResponse])
async def get_essay_comments(essay_id: int, db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Comment)
        .options(selectinload(Comment.user))
        .where(Comment.essay_id == essay_id, Comment.is_approved.is_(True))
        .order_by(Comment.created_at.asc())
    )
    comments = (await db.execute(stmt)).scalars().all()
    return [_comment_payload(comment) for comment in comments]


@router.post(
    "/comments",
    response_model=CommentResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(rate_limit("comments", 10, 3600))],
)
async def create_comment(
    comment: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    essay = (
        await db.execute(
            select(Essay).where(
                Essay.id == comment.essay_id,
                Essay.is_published.is_(True),
                Essay.status == "published",
            )
        )
    ).scalars().first()
    if not essay:
        raise HTTPException(status_code=404, detail="Published essay not found")
    prefs = (
        await db.execute(
            select(UserPreferences).where(UserPreferences.user_id == current_user.id)
        )
    ).scalars().first()
    new_comment = Comment(
        content=comment.content.strip(),
        essay_id=comment.essay_id,
        user_id=current_user.id,
        is_anonymous=bool(prefs and prefs.anonymous_posting),
    )
    db.add(new_comment)
    await db.commit()
    saved = (
        await db.execute(
            select(Comment)
            .options(selectinload(Comment.user))
            .where(Comment.id == new_comment.id)
        )
    ).scalars().one()
    return _comment_payload(saved)


@router.get("/admin/comments", response_model=list[AdminCommentResponse])
async def get_all_comments(
    _admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Comment)
        .options(selectinload(Comment.user))
        .order_by(Comment.is_approved.asc(), Comment.created_at.desc())
    )
    comments = (await db.execute(stmt)).scalars().all()
    return [_comment_payload(comment, admin=True) for comment in comments]


@router.post("/admin/comments/{comment_id}/approve", response_model=AdminCommentResponse)
async def approve_comment(
    comment_id: int,
    _admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    comment = (
        await db.execute(
            select(Comment)
            .options(selectinload(Comment.user))
            .where(Comment.id == comment_id)
        )
    ).scalars().first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    comment.is_approved = True
    await db.commit()
    await db.refresh(comment)
    return _comment_payload(comment, admin=True)


@router.delete("/admin/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: int,
    _admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    comment = (
        await db.execute(select(Comment).where(Comment.id == comment_id))
    ).scalars().first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    await db.delete(comment)
    await db.commit()


@router.get("/bookmarks", response_model=list[BookmarkResponse])
async def get_user_bookmarks(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Bookmark)
        .options(selectinload(Bookmark.essay))
        .where(Bookmark.user_id == current_user.id)
        .order_by(Bookmark.created_at.desc())
    )
    return (await db.execute(stmt)).scalars().all()


@router.get("/bookmarks/{essay_id}", response_model=BookmarkState)
async def get_bookmark_state(
    essay_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    bookmark = (
        await db.execute(
            select(Bookmark.id).where(
                Bookmark.user_id == current_user.id, Bookmark.essay_id == essay_id
            )
        )
    ).scalar_one_or_none()
    return BookmarkState(bookmarked=bookmark is not None)


@router.post("/bookmarks", response_model=BookmarkState)
async def toggle_bookmark(
    bookmark: BookmarkCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    essay_exists = (
        await db.execute(
            select(Essay.id).where(
                Essay.id == bookmark.essay_id,
                Essay.is_published.is_(True),
                Essay.status == "published",
            )
        )
    ).scalar_one_or_none()
    if essay_exists is None:
        raise HTTPException(status_code=404, detail="Published essay not found")
    existing = (
        await db.execute(
            select(Bookmark).where(
                Bookmark.user_id == current_user.id,
                Bookmark.essay_id == bookmark.essay_id,
            )
        )
    ).scalars().first()
    if existing:
        await db.delete(existing)
        await db.commit()
        return BookmarkState(bookmarked=False)
    db.add(Bookmark(user_id=current_user.id, essay_id=bookmark.essay_id))
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
    return BookmarkState(bookmarked=True)


@router.post(
    "/essays/{essay_id}/view",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(rate_limit("essay-view", 120, 3600))],
)
async def record_essay_view(essay_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        update(Essay)
        .where(
            Essay.id == essay_id,
            Essay.is_published.is_(True),
            Essay.status == "published",
        )
        .values(view_count=Essay.view_count + 1)
        .returning(Essay.id)
    )
    if result.scalar_one_or_none() is None:
        await db.rollback()
        raise HTTPException(status_code=404, detail="Published essay not found")
    await db.commit()
