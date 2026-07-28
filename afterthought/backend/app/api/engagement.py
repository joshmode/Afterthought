from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.db.database import get_db
from app.models.engagement import Comment, Bookmark
from app.models.essay import Essay
from app.schemas.engagement import CommentResponse, CommentCreate, BookmarkResponse, BookmarkCreate
from app.api.deps import get_current_user

router = APIRouter()

async def get_admin_user(current_user = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user

@router.get("/essays/{essay_id}/comments", response_model=List[CommentResponse])
async def get_essay_comments(essay_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Comment).where(Comment.essay_id == essay_id, Comment.is_approved == True)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/comments", response_model=CommentResponse, dependencies=[Depends(get_current_user)])
async def create_comment(comment: CommentCreate, current_user = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Check if essay exists
    essay_stmt = select(Essay).where(Essay.id == comment.essay_id)
    essay_result = await db.execute(essay_stmt)
    if not essay_result.scalars().first():
        raise HTTPException(status_code=404, detail="Essay not found")

    new_comment = Comment(**comment.model_dump(), user_id=current_user.id)
    db.add(new_comment)
    await db.commit()
    await db.refresh(new_comment)
    return new_comment

@router.get("/admin/comments", response_model=List[CommentResponse], dependencies=[Depends(get_admin_user)])
async def get_all_comments(db: AsyncSession = Depends(get_db)):
    stmt = select(Comment).order_by(Comment.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/admin/comments/{comment_id}/approve", response_model=CommentResponse, dependencies=[Depends(get_admin_user)])
async def approve_comment(comment_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Comment).where(Comment.id == comment_id)
    result = await db.execute(stmt)
    comment = result.scalars().first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    comment.is_approved = True
    await db.commit()
    await db.refresh(comment)
    return comment

@router.delete("/admin/comments/{comment_id}", dependencies=[Depends(get_admin_user)])
async def delete_comment(comment_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Comment).where(Comment.id == comment_id)
    result = await db.execute(stmt)
    comment = result.scalars().first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    await db.delete(comment)
    await db.commit()
    return {"message": "Comment deleted successfully"}

@router.get("/bookmarks", response_model=List[BookmarkResponse], dependencies=[Depends(get_current_user)])
async def get_user_bookmarks(current_user = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    stmt = select(Bookmark).where(Bookmark.user_id == current_user.id)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/bookmarks", response_model=BookmarkResponse, dependencies=[Depends(get_current_user)])
async def toggle_bookmark(bookmark: BookmarkCreate, current_user = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Check if exists
    stmt = select(Bookmark).where(Bookmark.user_id == current_user.id, Bookmark.essay_id == bookmark.essay_id)
    result = await db.execute(stmt)
    existing = result.scalars().first()

    if existing:
        # Toggle off (delete)
        await db.delete(existing)
        await db.commit()
        # Return the deleted bookmark for frontend sync
        return existing

    # Toggle on (create)
    new_bookmark = Bookmark(user_id=current_user.id, essay_id=bookmark.essay_id)
    db.add(new_bookmark)
    await db.commit()
    await db.refresh(new_bookmark)
    return new_bookmark
