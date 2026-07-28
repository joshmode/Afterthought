# Afterthought

Afterthought is a long-form editorial publication and CMS for essays about
technology, society, and philosophy.

## Architecture

- **Web:** Next.js App Router, React, TypeScript, Tailwind CSS, Zustand and Tiptap
- **API:** FastAPI, async SQLAlchemy, Alembic and APScheduler
- **Data:** PostgreSQL and Redis
- **Edge:** Nginx reverse proxy
- **Runtime:** Docker Compose with non-root application containers, health checks,
  persistent data volumes and a private service network

The browser uses same-origin `/api/*` requests. Authentication is stored in a
Secure, HttpOnly cookie; bearer tokens remain supported for non-browser API
clients. The embedded scheduler publishes eligible issues on Tuesdays at
09:00 in `PUBLICATION_TIMEZONE` and uses a PostgreSQL advisory lock to prevent
duplicate execution.

## Production-style startup

1. Copy `.env.example` to `.env`.
2. Replace every example secret and set the public origin/allowed hosts.
3. Put a TLS-terminating load balancer or reverse proxy in front of this stack.
4. Start the services:

   ```sh
   docker compose up --build -d
   ```

5. Check readiness at `/health` and sign in using the optional bootstrap admin.
6. Remove `BOOTSTRAP_ADMIN_PASSWORD` from the environment after the first
   successful bootstrap.

The backend entrypoint runs `alembic upgrade head` before Uvicorn starts.
PostgreSQL and Redis are not exposed on host ports. Only Nginx is published.

Do not use the example secrets in production. `ENVIRONMENT=production` rejects
short or default application secrets. The authentication cookie is Secure, so
a real deployment must use HTTPS.

## Local development

Backend:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\python.exe -m pip install -r requirements-dev.txt
.\venv\Scripts\python.exe -m pytest -q
```

Frontend:

```powershell
cd frontend
npm ci
npm run lint
npm run build
npm run dev
```

For a host-run backend, configure `DATABASE_URL`, `REDIS_URL`, `SECRET_KEY`,
`CORS_ORIGINS` and `ALLOWED_HOSTS`. The frontend server reads
`INTERNAL_API_URL`; browser requests stay relative to the public origin.

## Operations

- Readiness checks PostgreSQL and Redis; liveness checks the API process.
- Database and Redis data live in named Compose volumes.
- Back up the PostgreSQL volume/database and test restores before launch.
- Run one scheduler-bearing backend service unless all replicas share
  PostgreSQL; the job's advisory lock coordinates concurrent replicas.
- Use a durable log/metrics platform and alert on readiness failures, 5xx rate,
  scheduler exceptions and resource saturation.
- Review `FINAL_REPORT.md` before production approval. In particular, resolve
  the recorded npm advisory gate and provide TLS at the deployment edge.

## Verification

The audit suite covers authentication and permissions, draft privacy, content
sanitization, publishing, search, views, bookmarks, reading history, comment
moderation, submissions, feedback, notifications and scheduler rollover.

```powershell
cd backend
.\venv\Scripts\python.exe -m pytest -q

cd ..\frontend
npm run lint
npm run build
```

With the Compose stack running:

```sh
docker compose exec -T -w /app backend sh -c 'PYTHONPATH=/app alembic check'
```

See [FINAL_REPORT.md](FINAL_REPORT.md) for the independent engineering audit.
