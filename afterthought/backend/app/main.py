from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth

app = FastAPI(title="Afterthought API", description="Ideas worth thinking about twice.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])

@app.get("/")
async def root():
    return {"message": "Welcome to Afterthought API"}
