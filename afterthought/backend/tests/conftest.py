import asyncio
import os

os.environ.update(
    {
        "ENVIRONMENT": "test",
        "DATABASE_URL": "sqlite+aiosqlite:///./test-afterthought.db",
        "REDIS_URL": "redis://127.0.0.1:1/0",
        "SECRET_KEY": "test-secret-key-with-at-least-32-characters",
        "SCHEDULER_ENABLED": "false",
        "ALLOWED_HOSTS": "testserver,localhost",
    }
)

import pytest
from fastapi.testclient import TestClient

import app.models  # noqa: F401
from app.core.rate_limit import _local_requests
from app.db.database import Base, engine
from app.main import app


async def _create_schema() -> None:
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)


async def _drop_schema() -> None:
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.drop_all)


@pytest.fixture(autouse=True)
def reset_database():
    asyncio.run(_drop_schema())
    asyncio.run(_create_schema())
    _local_requests.clear()
    yield


@pytest.fixture
def client():
    return TestClient(app)
