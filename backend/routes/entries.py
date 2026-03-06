"""
backend/routes/entries.py

Mood entry persistence endpoints.
- POST /api/v1/entries        — save a completed analysis entry
- GET  /api/v1/entries        — retrieve last N entries for a user
- GET  /api/v1/entries/streak — compute check-in streak from entry history
"""

import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, Query, Depends

from models import MoodEntryCreate, MoodEntryDocument
from services.auth_service import get_current_user

log = logging.getLogger("wecare.entries")
router = APIRouter()


from pydantic import BaseModel


class StreakResponse(BaseModel):
    current: int
    longest: int
    total_entries: int
    last_checked_in: Optional[str] = None


# -----------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------
def _compute_streak(dates: list[str]) -> tuple[int, int]:
    """
    Given a sorted list of ISO date strings (ascending), compute
    (current_streak, longest_streak).
    """
    if not dates:
        return 0, 0

    from datetime import date as date_cls, timedelta

    unique_dates = sorted(set(dates))
    longest = 1
    current = 1

    for i in range(1, len(unique_dates)):
        d_prev = date_cls.fromisoformat(unique_dates[i - 1])
        d_curr = date_cls.fromisoformat(unique_dates[i])
        if (d_curr - d_prev).days == 1:
            current += 1
            longest = max(longest, current)
        elif (d_curr - d_prev).days > 1:
            current = 1

    today = date_cls.today().isoformat()
    if unique_dates[-1] != today:
        # Check if streak is still alive (yesterday was the last day)
        from datetime import date as date_cls2, timedelta as td
        yesterday = (date_cls2.today() - td(days=1)).isoformat()
        if unique_dates[-1] != yesterday:
            current = 0  # streak broken

    return current, longest


# -----------------------------------------------------------------------
# POST /api/v1/entries — Persist an entry
# -----------------------------------------------------------------------
@router.post("/entries", status_code=201)
async def create_entry(entry: MoodEntryCreate, user_id: str = Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    date_str = entry.date or now.date().isoformat()
    
    # Override any incoming user_id from the JSON payload with the cryptographically verified JWT user_id
    entry.user_id = user_id
    date_str = entry.date or now.date().isoformat()

    # Build a validated MoodEntryDocument from the incoming request
    doc = MoodEntryDocument.from_create(entry, date_str=date_str)
    document = doc.model_dump()

    from db import safe_insert
    inserted_id = await safe_insert("mood_entries", document)

    if inserted_id:
        log.info("Entry persisted: user=%s date=%s id=%s", entry.user_id, date_str, inserted_id)
        return {"success": True, "id": inserted_id, "date": date_str}

    log.warning("Entry not persisted (DB unavailable): user=%s date=%s", entry.user_id, date_str)
    return {"success": False, "id": None, "date": date_str, "message": "DB unavailable"}


# -----------------------------------------------------------------------
# GET /api/v1/entries/streak — Compute streak
# -----------------------------------------------------------------------
@router.get("/entries/streak", response_model=StreakResponse)
async def get_streak(user_id: str = Depends(get_current_user)):
    from db import safe_find
    from pymongo import ASCENDING

    docs = await safe_find(
        "mood_entries",
        query={"user_id": user_id},
        projection={"date": 1, "_id": 0},
        sort=[("created_at", ASCENDING)],
        limit=365,
    )
    dates = [d["date"] for d in docs if "date" in d]
    current, longest = _compute_streak(dates)
    last_date = dates[-1] if dates else None

    log.info("Streak query: user=%s entries=%d current=%d longest=%d", user_id, len(docs), current, longest)
    return StreakResponse(
        current=current,
        longest=longest,
        total_entries=len(docs),
        last_checked_in=last_date,
    )


# -----------------------------------------------------------------------
# GET /api/v1/entries — Last N entries
# -----------------------------------------------------------------------
@router.get("/entries")
async def get_entries(
    user_id: str = Depends(get_current_user),
    limit: int = Query(default=30, le=100),
):
    from db import safe_find
    from pymongo import DESCENDING

    docs = await safe_find(
        "mood_entries",
        query={"user_id": user_id},
        projection={"_id": 0, "user_id": 0},
        sort=[("created_at", DESCENDING)],
        limit=limit,
    )
    # Serialise datetime objects to ISO strings for JSON
    for doc in docs:
        if isinstance(doc.get("created_at"), datetime):
            doc["created_at"] = doc["created_at"].isoformat()

    log.info("GET entries: user=%s count=%d", user_id, len(docs))
    return {"entries": docs, "count": len(docs)}
