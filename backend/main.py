"""
backend/main.py

Production-ready FastAPI entrypoint for WeCare.
- MongoDB lifespan wired via db.py
- All routes registered with /api/v1 prefix
- Rate limiting via slowapi
- CORS configured for local + Vercel production
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from dotenv import load_dotenv
import os

# Load env vars: backend/.env takes priority over root .env
load_dotenv(override=True)

# -----------------------------------------------------------------
# Rate Limiter (must be created before app)
# -----------------------------------------------------------------
limiter = Limiter(key_func=get_remote_address)

# -----------------------------------------------------------------
# DB Lifespan — connects MongoDB on startup, closes on shutdown
# -----------------------------------------------------------------
# Graceful degradation: if MONGODB_URI is not set, skip DB init
# so the analysis endpoint still works without a DB connection.
MONGODB_URI = os.getenv("MONGODB_URI")

if MONGODB_URI:
    from db import lifespan as db_lifespan

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        async with db_lifespan(app):
            yield
else:
    print("[MAIN] ⚠️  MONGODB_URI not set — running without database persistence.")

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        yield

# -----------------------------------------------------------------
# FastAPI App
# -----------------------------------------------------------------
app = FastAPI(
    title="WeCare API",
    description="AI-powered mental health companion backend",
    version="1.0.0",
    lifespan=lifespan,
)

# Rate limiter error handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# -----------------------------------------------------------------
# CORS
# -----------------------------------------------------------------
# Hard-coded safe origins (local dev + Vercel production).
# Add any additional domains via ALLOWED_ORIGINS env var (comma-separated).
PRODUCTION_ORIGINS = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o.strip()]

origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    # Vercel production frontend
    "https://we-care-one-navy.vercel.app",
] + PRODUCTION_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------------------------------------
# Routers
# -----------------------------------------------------------------
from routes.analyze import router as analyze_router
from routes.entries import router as entries_router
from routes.trajectory import router as trajectory_router
from routes.auth import router as auth_router

app.include_router(auth_router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(analyze_router, prefix="/api/v1", tags=["Analysis"])
app.include_router(entries_router, prefix="/api/v1", tags=["Entries"])
app.include_router(trajectory_router, prefix="/api/v1", tags=["Trajectory"])

# -----------------------------------------------------------------
# Health & Root
# -----------------------------------------------------------------
@app.get("/", tags=["Health"])
def root():
    from services.gemini_client import client as gemini_client
    from db import get_db_status
    db_info = get_db_status()
    return {
        "message": "WeCare Backend is Running",
        "version": "1.0.0",
        "gemini_status": "✅ Connected" if gemini_client else "❌ Not initialized",
        "db_status": "✅ Connected" if db_info["db_connected"] else "⚠️ Degraded",
        **db_info,
    }


@app.get("/health", tags=["Health"])
def health():
    from db import get_db_status
    db_info = get_db_status()
    return {
        "status": "ok",
        "api_key_set": bool(os.getenv("GEMINI_API_KEY")),
        "db_enabled": bool(MONGODB_URI),
        **db_info,
    }