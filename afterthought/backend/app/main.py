from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from sqlalchemy import select, text

from app.api import auth, editorial, engagement, essays, reader, search, series, submission, themes
from app.core.config import settings
from app.core.rate_limit import redis_client
from app.core.scheduler import start_scheduler, stop_scheduler
from app.core.security import get_password_hash
from app.db.database import AsyncSessionLocal
from app.models.user import User


async def _bootstrap_admin() -> None:
    if not settings.bootstrap_admin_email or not settings.bootstrap_admin_password:
        return
    async with AsyncSessionLocal() as session:
        email = settings.bootstrap_admin_email.lower()
        user = (
            await session.execute(select(User).where(User.email == email))
        ).scalars().first()
        if user:
            if not user.is_admin:
                user.is_admin = True
                await session.commit()
            return
        session.add(
            User(
                email=email,
                display_name="Editor",
                hashed_password=get_password_hash(settings.bootstrap_admin_password),
                is_admin=True,
            )
        )
        await session.commit()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await _bootstrap_admin()
    start_scheduler()
    yield
    stop_scheduler()
    await redis_client.aclose()


app = FastAPI(
    title="Afterthought API",
    description="Ideas worth thinking about twice.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs" if settings.environment != "production" else None,
    redoc_url=None,
)

app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.allowed_host_list)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next) -> Response:
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    if settings.environment == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(essays.router, prefix="/api/essays", tags=["essays"])
app.include_router(themes.router, prefix="/api/themes", tags=["themes"])
app.include_router(series.router, prefix="/api/series", tags=["series"])
app.include_router(engagement.router, prefix="/api/engagement", tags=["engagement"])
app.include_router(search.router, prefix="/api/search", tags=["search"])
app.include_router(reader.router, prefix="/api/reader", tags=["reader"])
app.include_router(editorial.router, prefix="/api/editorial", tags=["editorial"])
app.include_router(submission.router, prefix="/api", tags=["submissions"])


@app.get("/")
async def root():
    return {"message": "Welcome to Afterthought API"}


@app.get("/health/live")
async def liveness():
    return {"status": "ok"}


@app.get("/health/ready")
async def readiness(response: Response):
    checks = {"database": False, "redis": False}
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
        checks["database"] = True
    except Exception:
        pass
    try:
        checks["redis"] = bool(await redis_client.ping())
    except Exception:
        pass
    if not all(checks.values()):
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    return {"status": "ok" if all(checks.values()) else "degraded", "checks": checks}
