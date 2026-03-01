"""
backend/db.py

Async MongoDB client for FastAPI using Motor.

Install dependency:
    pip install motor

Usage in main.py:
    from db import get_db, lifespan

    app = FastAPI(lifespan=lifespan)

    @app.post("/analyze")
    async def analyze_mood(request: MoodRequest, db=Depends(get_db)):
        collection = db["mood_entries"]
        await collection.insert_one({"mood": request.mood, "notes": request.notes})
        ...
"""

import os
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

load_dotenv()

# ---------------------------------------------------------------------------
# Configuration — loaded strictly from environment variables. No hardcoded
# fallback for MONGODB_URI to ensure secrets are never baked into source code.
# ---------------------------------------------------------------------------
MONGODB_URI: str | None = os.getenv("MONGODB_URI")
MONGODB_DB: str = os.getenv("MONGODB_DB", "wecare")

if not MONGODB_URI:
    raise RuntimeError(
        "MONGODB_URI environment variable is not set. "
        "Copy backend/.env.example to backend/.env and fill in your credentials."
    )

# ---------------------------------------------------------------------------
# Singleton client – created once at startup, closed at shutdown.
# ---------------------------------------------------------------------------
_client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    """Return the shared Motor client (must be called after startup)."""
    if _client is None:
        raise RuntimeError("MongoDB client is not initialised. Use the lifespan context.")
    return _client


async def get_db() -> AsyncGenerator[AsyncIOMotorDatabase, None]:
    """
    FastAPI dependency that yields the WeCare database.

    Example:
        @app.get("/entries")
        async def list_entries(db: AsyncIOMotorDatabase = Depends(get_db)):
            docs = await db["mood_entries"].find().to_list(100)
            return docs
    """
    yield get_client()[MONGODB_DB]


# ---------------------------------------------------------------------------
# Lifespan – attach to FastAPI for clean startup / shutdown.
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app):  # type: ignore[type-arg]
    """
    Async context manager for FastAPI lifespan events.

    Replace the existing `app = FastAPI()` in main.py with:
        app = FastAPI(lifespan=lifespan)
    """
    global _client
    print("[DB] Connecting to MongoDB Atlas …")
    _client = AsyncIOMotorClient(
        MONGODB_URI,
        maxPoolSize=10,
        serverSelectionTimeoutMS=5000,
        socketTimeoutMS=45000,
    )
    # Verify the connection is alive
    await _client.admin.command("ping")
    print(f"[DB] ✅  Connected to database: '{MONGODB_DB}'")

    yield  # Application runs here

    print("[DB] Closing MongoDB connection …")
    _client.close()
    _client = None
    print("[DB] ✅  MongoDB connection closed.")
