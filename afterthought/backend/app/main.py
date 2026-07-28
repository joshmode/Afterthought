from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, essays, themes, series, engagement, search, reader, editorial, submission
from app.core.scheduler import start_scheduler, stop_scheduler

app = FastAPI(title="Afterthought API", description="Ideas worth thinking about twice.")

@app.on_event("startup")
async def startup_event():
    start_scheduler()

@app.on_event("shutdown")
async def shutdown_event():
    stop_scheduler()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(essays.router, prefix="/api/essays", tags=["essays"])
app.include_router(themes.router, prefix="/api/themes", tags=["themes"])
app.include_router(series.router, prefix="/api/series", tags=["series"])
app.include_router(engagement.router, prefix="/api/engagement", tags=["engagement"])
app.include_router(search.router, prefix="/api/search", tags=["search"])
app.include_router(reader.router, prefix="/api/reader", tags=["reader"])
app.include_router(editorial.router, prefix="/api/editorial", tags=["editorial"])
app.include_router(submission.router, prefix="/api", tags=["submission"])

@app.get("/")
async def root():
    return {"message": "Welcome to Afterthought API"}
