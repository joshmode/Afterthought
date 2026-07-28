# Afterthought

A premium digital publication dedicated to long-form essays regarding technology, society, and philosophy.

## Overview
Afterthought transforms the traditional blogging experience into an editorial CMS matching the aesthetic and operational flow of premium publications. It features a rich text editor (Notion-like), automated publishing schedules, and a highly polished reader experience.

## Architecture & Technology Stack
- **Frontend:** Next.js (App Router), React, Tailwind CSS, TypeScript, Zustand, Tiptap.
- **Backend:** FastAPI, Python 3.11, SQLAlchemy (Async), Alembic, APScheduler, Passlib/Bcrypt.
- **Infrastructure:** Docker, Docker Compose, PostgreSQL, Redis, Nginx.

## Setup & Development
1. Ensure Docker and Docker Compose are installed.
2. In the `backend` folder, copy `.env.example` to `.env` and configure your `DATABASE_URL` and `SECRET_KEY`.
3. In the `frontend` folder, create `.env.local` to override `NEXT_PUBLIC_API_URL` if needed.
4. Run `docker compose up --build` to start all services locally.

## Automated Publishing
Afterthought employs `APScheduler` embedded into the FastAPI lifecycle. Every Tuesday at 9:00 AM, the system archives the "Current Issue" and publishes the next scheduled draft, automatically rolling forward issue numbers.

## Migrations
Alembic manages database migrations. On startup, the backend container automatically runs `./start.sh` which executes `alembic upgrade head` before booting Uvicorn. For local development, set `PYTHONPATH=.` and run `alembic revision --autogenerate -m "..."`.

## Deployment
For production, verify that ports and volumes in `docker-compose.yml` map correctly to secure networks. Nginx sits as a reverse proxy over the React frontend and FastAPI backend. Ensure you supply safe environment variables rather than falling back to defaults.

## Future Roadmap
- Deeper comment moderation queues.
- Real-time collaborative editing (via Yjs or advanced Tiptap extensions).
- Email newsletter synchronization.
