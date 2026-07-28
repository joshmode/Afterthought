from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime
from app.db.database import AsyncSessionLocal
from app.models.essay import Essay
import logging

logger = logging.getLogger(__name__)

async def weekly_publish_job():
    logger.info("Running weekly publish job...")
    async with AsyncSessionLocal() as session:
        # 1. Archive the current issue
        stmt_current = select(Essay).where(Essay.is_current_issue == True)
        result_current = await session.execute(stmt_current)
        current_essay = result_current.scalars().first()

        if current_essay:
            current_essay.is_current_issue = False
            current_essay.status = "archived"

        # 2. Find the next scheduled essay (publication_date <= now, status == scheduled)
        now = datetime.now()
        stmt_next = select(Essay).where(Essay.status == "scheduled", Essay.publication_date <= now).order_by(Essay.publication_date.asc())
        result_next = await session.execute(stmt_next)
        next_essay = result_next.scalars().first()

        if next_essay:
            # Get max issue number
            stmt_max_issue = select(Essay).order_by(Essay.issue_number.desc().nulls_last())
            result_max_issue = await session.execute(stmt_max_issue)
            last_essay = result_max_issue.scalars().first()
            next_issue_num = (last_essay.issue_number or 0) + 1 if last_essay else 1

            next_essay.is_published = True
            next_essay.is_current_issue = True
            next_essay.status = "published"
            next_essay.issue_number = next_issue_num
            logger.info(f"Published essay: {next_essay.title} (Issue #{next_issue_num})")
        else:
            logger.info("No scheduled essays found to publish.")

        await session.commit()


scheduler = AsyncIOScheduler()

def start_scheduler():
    scheduler.add_job(weekly_publish_job, 'cron', day_of_week='tue', hour=9, minute=0) # Every Tuesday at 9:00 AM
    scheduler.start()
    logger.info("Scheduler started.")

def stop_scheduler():
    scheduler.shutdown()
