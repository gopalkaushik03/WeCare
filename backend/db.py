"""
backend/db.py

Production-ready async MongoDB client for WeCare (FastAPI + Motor).

Features:
  - Async Motor client (AsyncIOMotorClient) — never blocks the event loop
  - Graceful degradation: no crash at import time if MONGODB_URI is missing
  - Auto-initialises collections and indexes at startup via lifespan()
  - Structured Python logging (replaces raw print() calls)
  - Live db_state dictionary exported for /health endpoint
  - Proper error handling for connection, insert and query failures
  - Sensitive URIs are never logged
"""

from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import AsyncGenerator, Optional

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import ASCENDING, DESCENDING, IndexModel
from pymongo.errors import (
    ConnectionFailure,
    OperationFailure,
    ServerSelectionTimeoutError,
)

# ---------------------------------------------------------------------------
# Logging — structured, prefixed [DB]
# ---------------------------------------------------------------------------
log = logging.getLogger("wecare.db")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
)

# ---------------------------------------------------------------------------
# Configuration — loaded strictly from environment variables.
# Supports both MONGODB_URI (preferred) and MONGO_URI (alias).
# No hardcoded fallback to ensure secrets never enter source code.
# ---------------------------------------------------------------------------
load_dotenv(override=True)

MONGODB_URI: Optional[str] = os.getenv("MONGODB_URI") or os.getenv("MONGO_URI")
MONGODB_DB: str = os.getenv("MONGODB_DB", "wecare")

# ---------------------------------------------------------------------------
# Live connection state — exported for /health endpoint.
# ---------------------------------------------------------------------------
db_state: dict = {
    "connected": False,
    "status": "not_initialized",
    "database": MONGODB_DB,
    "collections": [],
    "error": None,
}

# ---------------------------------------------------------------------------
# Singleton Motor client — created once at startup, closed at shutdown.
# ---------------------------------------------------------------------------
_client: Optional[AsyncIOMotorClient] = None


def get_client() -> AsyncIOMotorClient:
    """Return the shared Motor client. Must be called after startup lifespan."""
    if _client is None:
        raise RuntimeError(
            "MongoDB client is not initialised. "
            "Ensure MONGODB_URI is set and the FastAPI lifespan has run."
        )
    return _client


async def get_db() -> AsyncGenerator[AsyncIOMotorDatabase, None]:
    """
    FastAPI dependency — yields the WeCare database handle.

    Usage:
        @app.get("/entries")
        async def list_entries(db: AsyncIOMotorDatabase = Depends(get_db)):
            docs = await db["mood_entries"].find().to_list(100)
            return docs
    """
    yield get_client()[MONGODB_DB]


def get_db_status() -> dict:
    """Return the current db_state snapshot (safe to expose in /health)."""
    return {
        "db_connected": db_state["connected"],
        "db_status": db_state["status"],
        "db_database": db_state["database"],
        "db_collections": db_state["collections"],
    }


# ---------------------------------------------------------------------------
# Collection & Index Initialisation
# ---------------------------------------------------------------------------
async def _init_collections(db: AsyncIOMotorDatabase) -> None:
    """
    Create required collections (if absent) and all production indexes.
    Safe to call repeatedly — Motor / MongoDB ignores duplicate index creation.
    """
    log.info("Initialising collections and indexes …")

    # -----------------------------------------------------------------------
    # users
    # -----------------------------------------------------------------------
    await db["users"].create_indexes([
        IndexModel([("email", ASCENDING)], unique=True, name="idx_users_email_unique"),
        IndexModel([("created_at", DESCENDING)], name="idx_users_created_at"),
    ])
    log.info("Collection 'users' — indexes ready.")

    # -----------------------------------------------------------------------
    # mood_entries
    # -----------------------------------------------------------------------
    await db["mood_entries"].create_indexes([
        IndexModel([("user_id", ASCENDING)], name="idx_mood_entries_user_id"),
        IndexModel([("created_at", DESCENDING)], name="idx_mood_entries_created_at"),
        # Compound index for the most common query pattern: user history by date
        IndexModel(
            [("user_id", ASCENDING), ("created_at", DESCENDING)],
            name="idx_mood_entries_user_created",
        ),
    ])
    log.info("Collection 'mood_entries' — indexes ready.")

    # -----------------------------------------------------------------------
    # analysis_logs
    # -----------------------------------------------------------------------
    await db["analysis_logs"].create_indexes([
        IndexModel([("user_id", ASCENDING)], name="idx_analysis_logs_user_id"),
        IndexModel([("created_at", DESCENDING)], name="idx_analysis_logs_created_at"),
        IndexModel([("request_id", ASCENDING)], unique=True, name="idx_analysis_logs_request_id"),
    ])
    log.info("Collection 'analysis_logs' — indexes ready.")

    # Report which collections are present after init
    existing = await db.list_collection_names()
    db_state["collections"] = existing
    log.info("Active collections: %s", existing)


# ---------------------------------------------------------------------------
# Lifespan — attach to FastAPI for clean startup / shutdown.
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app):  # type: ignore[type-arg]
    """
    Async context manager for FastAPI lifespan events.
    Connects to MongoDB, initialises collections/indexes, then yields.
    Gracefully degrades if MONGODB_URI is missing or unreachable.
    """
    global _client

    if not MONGODB_URI:
        log.warning(
            "MONGODB_URI / MONGO_URI is not set — running WITHOUT database persistence. "
            "Set this variable in backend/.env before deployment."
        )
        db_state["status"] = "disabled"
        db_state["error"] = "MONGODB_URI not configured"
        yield
        return

    log.info("Connecting to MongoDB …")
    try:
        _client = AsyncIOMotorClient(
            MONGODB_URI,
            maxPoolSize=10,
            minPoolSize=1,
            serverSelectionTimeoutMS=5_000,
            connectTimeoutMS=10_000,
            socketTimeoutMS=45_000,
            # Keeps connections alive through cloud NAT timeouts
            heartbeatFrequencyMS=10_000,
        )

        # Verify the connection is alive before opening to traffic
        await _client.admin.command("ping")

        db = _client[MONGODB_DB]
        await _init_collections(db)

        db_state["connected"] = True
        db_state["status"] = "connected"
        db_state["error"] = None
        log.info("✅ MongoDB connected — database: '%s'", MONGODB_DB)

        yield  # ← application serves requests here

    except ServerSelectionTimeoutError as exc:
        db_state["status"] = "timeout"
        db_state["error"] = "Server selection timed out"
        log.error("❌ MongoDB connection timed out: %s", exc)
        # Don't re-raise — allow the app to start in degraded mode
        yield

    except ConnectionFailure as exc:
        db_state["status"] = "connection_failed"
        db_state["error"] = "Connection failure"
        log.error("❌ MongoDB connection failure: %s", exc)
        yield

    except OperationFailure as exc:
        db_state["status"] = "auth_failed"
        db_state["error"] = "Authentication / operation failure"
        log.error("❌ MongoDB operation failure (check credentials): %s", exc)
        yield

    except Exception as exc:
        db_state["status"] = "error"
        db_state["error"] = str(exc)
        log.error("❌ Unexpected DB error during startup: %s", exc)
        yield

    finally:
        if _client is not None:
            log.info("Closing MongoDB connection …")
            _client.close()
            _client = None
            db_state["connected"] = False
            db_state["status"] = "disconnected"
            log.info("✅ MongoDB connection closed.")


# ---------------------------------------------------------------------------
# Helper — safe insert with error handling and logging
# ---------------------------------------------------------------------------
async def safe_insert(
    collection_name: str,
    document: dict,
    db: Optional[AsyncIOMotorDatabase] = None,
) -> Optional[str]:
    """
    Insert a document into `collection_name` with structured logging.
    Returns the inserted _id as a string, or None on failure.

    Args:
        collection_name: Target MongoDB collection.
        document: The document dict to insert (modified in-place: created_at added).
        db: Optional AsyncIOMotorDatabase; if None, uses get_client()[MONGODB_DB].

    Security:
        document values are never logged — only collection name and operation result.
    """
    if "created_at" not in document:
        document["created_at"] = datetime.now(timezone.utc)

    try:
        if db is None:
            db = get_client()[MONGODB_DB]
        result = await db[collection_name].insert_one(document)
        inserted_id = str(result.inserted_id)
        log.info("INSERT '%s' → id=%s", collection_name, inserted_id)
        return inserted_id

    except OperationFailure as exc:
        log.error("INSERT FAILED '%s': OperationFailure — %s", collection_name, exc)
        return None

    except RuntimeError as exc:
        log.warning("INSERT SKIPPED '%s': DB unavailable — %s", collection_name, exc)
        return None

    except Exception as exc:
        log.error("INSERT ERROR '%s': %s", collection_name, exc)
        return None


# ---------------------------------------------------------------------------
# Helper — safe query with error handling and logging
# ---------------------------------------------------------------------------
async def safe_find(
    collection_name: str,
    query: dict,
    projection: Optional[dict] = None,
    sort: Optional[list] = None,
    limit: int = 30,
    db: Optional[AsyncIOMotorDatabase] = None,
) -> list[dict]:
    """
    Query documents from `collection_name` with structured logging.
    Returns a list of matching documents on success, or [] on failure.

    Security: query keys are logged (for debugging), values are not.
    """
    try:
        if db is None:
            db = get_client()[MONGODB_DB]

        cursor = db[collection_name].find(query, projection or {})
        if sort:
            cursor = cursor.sort(sort)
        cursor = cursor.limit(limit)

        docs = await cursor.to_list(limit)
        log.info("QUERY '%s' filter_keys=%s → %d results", collection_name, list(query.keys()), len(docs))
        return docs

    except OperationFailure as exc:
        log.error("QUERY FAILED '%s': OperationFailure — %s", collection_name, exc)
        return []

    except RuntimeError as exc:
        log.warning("QUERY SKIPPED '%s': DB unavailable — %s", collection_name, exc)
        return []

    except Exception as exc:
        log.error("QUERY ERROR '%s': %s", collection_name, exc)
        return []
