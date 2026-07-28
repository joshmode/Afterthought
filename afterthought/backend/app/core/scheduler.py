import logging
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import func, select, text, update

from app.core.config import settings
from app.db.database import AsyncSessionLocal
from app.models.essay import Essay

logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler(timezone=ZoneInfo(settings.publication_timezone))
SCHEDULER_LOCK_ID = 2_026_072_801


async def weekly_publish_job() -> None:
    logger.info("Running weekly publication job")
    async with AsyncSessionLocal() as session:
        async with session.begin():
            if session.bind and session.bind.dialect.name == "postgresql":
                acquired = (
                    await session.execute(
                        text("SELECT pg_try_advisory_xact_lock(:lock_id)"),
                        {"lock_id": SCHEDULER_LOCK_ID},
                    )
                ).scalar()
                if not acquired:
                    logger.info("Another worker owns the publication lock; skipping")
                    return

            now = datetime.now(timezone.utc)
            stmt = (
                select(Essay)
                .where(
                    Essay.status == "scheduled",
                    Essay.is_published.is_(False),
                    Essay.publication_date.is_not(None),
                    Essay.publication_date <= now,
                )
                .order_by(Essay.publication_date.asc(), Essay.id.asc())
                .with_for_update(skip_locked=True)
            )
            next_essay = (await session.execute(stmt)).scalars().first()
            if not next_essay:
                logger.info("No eligible scheduled essay found")
                return

            await session.execute(
                update(Essay)
                .where(Essay.is_current_issue.is_(True), Essay.id != next_essay.id)
                .values(is_current_issue=False, status="archived")
            )
            max_issue = (await session.execute(select(func.max(Essay.issue_number)))).scalar() or 0
            next_essay.is_published = True
            next_essay.is_current_issue = True
            next_essay.status = "published"
            next_essay.issue_number = next_essay.issue_number or max_issue + 1
            logger.info("Published essay %s as issue %s", next_essay.id, next_essay.issue_number)


def start_scheduler() -> None:
    if not settings.scheduler_enabled or scheduler.running:
        return
    scheduler.add_job(
        weekly_publish_job,
        "cron",
        id="weekly-publication",
        replace_existing=True,
        day_of_week="tue",
        hour=9,
        minute=0,
        misfire_grace_time=3600,
        coalesce=True,
        max_instances=1,
    )
    scheduler.start()
    logger.info("Scheduler started in %s", settings.publication_timezone)


def stop_scheduler() -> None:
    if scheduler.running:
        scheduler.shutdown(wait=False)
