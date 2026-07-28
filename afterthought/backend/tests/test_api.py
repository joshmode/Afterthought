import asyncio
from datetime import datetime, timedelta, timezone

from sqlalchemy import select

from app.core.scheduler import weekly_publish_job
from app.core.security import get_password_hash
from app.db.database import AsyncSessionLocal
from app.models.essay import Essay
from app.models.user import User


def register(client, email="reader@example.com", password="a-secure-password"):
    return client.post(
        "/api/auth/register",
        json={"email": email, "display_name": "Reader", "password": password},
    )


def login(client, email="reader@example.com", password="a-secure-password"):
    return client.post(
        "/api/auth/token",
        data={"username": email, "password": password},
    )


async def create_admin() -> None:
    async with AsyncSessionLocal() as session:
        session.add(
            User(
                email="editor@example.com",
                display_name="Editor",
                hashed_password=get_password_hash("editor-password"),
                is_admin=True,
            )
        )
        await session.commit()


def create_and_publish_essay(client, title="A Real Essay", slug="a-real-essay"):
    created = client.post(
        "/api/essays/",
        json={
            "title": title,
            "slug": slug,
            "abstract": "A useful abstract",
            "content": '<h2 onclick="bad()">Opening</h2><p>Hello</p><script>bad()</script>',
            "reading_time_minutes": 4,
            "theme_ids": [],
        },
    )
    assert created.status_code == 201, created.text
    essay = created.json()
    published = client.post(
        f"/api/editorial/essays/{essay['id']}/publish",
        json={"publish_now": True},
    )
    assert published.status_code == 200, published.text
    return essay


def test_registration_cookie_login_and_role_enforcement(client):
    response = register(client)
    assert response.status_code == 201
    assert response.json()["email"] == "reader@example.com"
    assert register(client).status_code == 400
    assert login(client, password="wrong-password").status_code == 401
    signed_in = login(client)
    assert signed_in.status_code == 200
    assert "afterthought_session" in signed_in.cookies
    assert client.get("/api/auth/me").status_code == 200
    forbidden = client.post(
        "/api/themes/",
        json={"name": "Security", "description": "A theme"},
    )
    assert forbidden.status_code == 403
    client.post("/api/auth/logout")
    assert client.get("/api/auth/me").status_code == 401


def test_admin_editorial_publication_and_sanitized_public_read(client):
    asyncio.run(create_admin())
    assert login(client, "editor@example.com", "editor-password").status_code == 200
    theme = client.post("/api/themes/", json={"name": "Ethics"}).json()
    series = client.post(
        "/api/series/",
        json={"name": "Tuesday Essays", "is_active": True},
    ).json()
    created = client.post(
        "/api/essays/",
        json={
            "title": "A Real Essay",
            "slug": "a-real-essay",
            "abstract": "A useful abstract",
            "content": '<h2 onclick="bad()">Opening</h2><p>Hello</p><script>bad()</script>',
            "reading_time_minutes": 4,
            "theme_ids": [theme["id"]],
            "series_id": series["id"],
        },
    )
    assert created.status_code == 201, created.text
    essay = created.json()
    assert client.get("/api/essays/a-real-essay").status_code == 404
    assert client.get("/api/essays/?limit=20").json() == []
    published = client.post(
        f"/api/editorial/essays/{essay['id']}/publish",
        json={"publish_now": True},
    )
    assert published.status_code == 200
    public = client.get("/api/essays/a-real-essay")
    assert public.status_code == 200
    assert "script" not in public.json()["content"]
    assert "onclick" not in public.json()["content"]
    assert public.json()["themes"][0]["name"] == "Ethics"
    assert public.json()["series"]["name"] == "Tuesday Essays"
    assert client.get("/api/essays/current").json()["id"] == essay["id"]
    assert client.post(f"/api/engagement/essays/{essay['id']}/view").status_code == 204
    stats = client.get("/api/editorial/stats").json()
    assert stats["total_views"] == 1
    assert client.get("/api/search/?q=%25%25").json() == []


def test_reader_engagement_workflow_and_moderation(client):
    asyncio.run(create_admin())
    login(client, "editor@example.com", "editor-password")
    essay = create_and_publish_essay(client)
    client.post("/api/auth/logout")
    register(client)
    login(client)

    toggled = client.post(
        "/api/engagement/bookmarks", json={"essay_id": essay["id"]}
    )
    assert toggled.json() == {"bookmarked": True}
    bookmark = client.get("/api/engagement/bookmarks").json()[0]
    assert bookmark["essay"]["slug"] == essay["slug"]

    history = client.post(
        "/api/reader/history",
        json={"essay_id": essay["id"], "progress_percent": 67},
    )
    assert history.status_code == 200
    assert history.json()["essay"]["title"] == essay["title"]
    assert (
        client.post(
            "/api/reader/history",
            json={"essay_id": essay["id"], "progress_percent": 101},
        ).status_code
        == 422
    )

    pending = client.post(
        "/api/engagement/comments",
        json={"essay_id": essay["id"], "content": "A considered response."},
    )
    assert pending.status_code == 201
    assert client.get(f"/api/engagement/essays/{essay['id']}/comments").json() == []
    comment_id = pending.json()["id"]

    client.post("/api/auth/logout")
    login(client, "editor@example.com", "editor-password")
    assert (
        client.post(f"/api/engagement/admin/comments/{comment_id}/approve").status_code
        == 200
    )
    public_comments = client.get(
        f"/api/engagement/essays/{essay['id']}/comments"
    ).json()
    assert public_comments[0]["content"] == "A considered response."


def test_submission_feedback_and_notifications(client):
    asyncio.run(create_admin())
    submitted = client.post(
        "/api/submit",
        json={
            "author_name": "Writer",
            "author_email": "writer@example.com",
            "title": "A submitted essay",
            "content": "word " * 30,
        },
    )
    assert submitted.status_code == 201
    assert client.post(
        "/api/feedback",
        json={"category": "accessibility", "message": "Please improve focus visibility."},
    ).status_code == 201

    login(client, "editor@example.com", "editor-password")
    assert len(client.get("/api/editorial/submissions").json()) == 1
    assert len(client.get("/api/editorial/feedback").json()) == 1
    notifications = client.get("/api/notifications").json()
    assert len(notifications) == 2
    notification_id = notifications[0]["id"]
    assert client.post(f"/api/notifications/{notification_id}/read").status_code == 204
    assert client.post("/api/notifications/9999/read").status_code == 404


def test_scheduler_only_archives_when_an_eligible_replacement_exists(client):
    async def seed_and_run():
        async with AsyncSessionLocal() as session:
            current = Essay(
                title="Current",
                slug="current",
                content="<p>Current</p>",
                status="published",
                is_published=True,
                is_current_issue=True,
                issue_number=1,
                publication_date=datetime.now(timezone.utc) - timedelta(days=7),
            )
            scheduled = Essay(
                title="Scheduled",
                slug="scheduled",
                content="<p>Next</p>",
                status="scheduled",
                is_published=False,
                is_current_issue=False,
                publication_date=datetime.now(timezone.utc) - timedelta(minutes=1),
            )
            session.add_all([current, scheduled])
            await session.commit()
        await weekly_publish_job()
        async with AsyncSessionLocal() as session:
            essays = (await session.execute(select(Essay).order_by(Essay.id))).scalars().all()
            return essays

    essays = asyncio.run(seed_and_run())
    assert essays[0].status == "archived"
    assert essays[0].is_current_issue is False
    assert essays[1].status == "published"
    assert essays[1].is_current_issue is True
    assert essays[1].issue_number == 2
