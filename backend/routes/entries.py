"""
backend/routes/entries.py

Mood entry persistence endpoints.
- POST /api/v1/entries  — save an entry after analysis
- GET  /api/v1/entries  — retrieve last 30 entries for a user
- GET  /api/v1/entries/streak — compute streak from entry history
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone

router = APIRouter()

# -----------------------------------------------------------------------
# Models
# -----------------------------------------------------------------------
class MoodEntryCreate(BaseModel):
    user_id: str = Field(default="local_user", description="User identifier (auth token in Phase 2)")
    mood: str
    notes: Optional[str] = ""
    risk_level: str = "low"
    summary: str = ""
    insight: Optional[str] = None
    reframe: Optional[str] = None
    action: Optional[str] = None
    reframe_technique: Optional[str] = None
    emotional_themes: List[str] = []
    suggestions: List[str] = []
    date: Optional[str] = None  # "YYYY-MM-DD" — inferred if not provided


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
async def create_entry(entry: MoodEntryCreate):
    now = datetime.now(timezone.utc)
    date_str = entry.date or now.date().isoformat()

    document = {
        "user_id": entry.user_id,
        "mood": entry.mood,
        "notes": entry.notes,
        "risk_level": entry.risk_level,
        "summary": entry.summary,
        "insight": entry.insight,
        "reframe": entry.reframe,
        "action": entry.action,
        "reframe_technique": entry.reframe_technique,
        "emotional_themes": entry.emotional_themes,
        "suggestions": entry.suggestions,
        "date": date_str,
        "created_at": now,
    }

    try:
        from db import get_client
        db = get_client()["wecare"]
        result = await db["mood_entries"].insert_one(document)
        return {"success": True, "id": str(result.inserted_id), "date": date_str}
    except RuntimeError:
        # DB not initialized — return graceful success so frontend flow continues
        print("[ENTRIES] DB unavailable — entry not persisted.")
        return {"success": False, "id": None, "date": date_str, "message": "DB unavailable"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -----------------------------------------------------------------------
# GET /api/v1/entries/streak — Compute streak
# -----------------------------------------------------------------------
@router.get("/entries/streak", response_model=StreakResponse)
async def get_streak(user_id: str = Query(default="local_user")):
    try:
        from db import get_client
        db = get_client()["wecare"]
        cursor = db["mood_entries"].find(
            {"user_id": user_id},
            {"date": 1, "_id": 0}
        ).sort("created_at", 1)
        docs = await cursor.to_list(365)
        dates = [d["date"] for d in docs if "date" in d]

        current, longest = _compute_streak(dates)
        last_date = dates[-1] if dates else None

        return StreakResponse(
            current=current,
            longest=longest,
            total_entries=len(docs),
            last_checked_in=last_date,
        )
    except RuntimeError:
        return StreakResponse(current=0, longest=0, total_entries=0)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -----------------------------------------------------------------------
# GET /api/v1/entries — Last N entries
# -----------------------------------------------------------------------
@router.get("/entries")
async def get_entries(
    user_id: str = Query(default="local_user"),
    limit: int = Query(default=30, le=100),
):
    try:
        from db import get_client
        db = get_client()["wecare"]
        cursor = db["mood_entries"].find(
            {"user_id": user_id},
            {"_id": 0, "user_id": 0}
        ).sort("created_at", -1).limit(limit)
        docs = await cursor.to_list(limit)
        # Convert datetime objects to ISO strings for JSON serialization
        for doc in docs:
            if isinstance(doc.get("created_at"), datetime):
                doc["created_at"] = doc["created_at"].isoformat()
        return {"entries": docs, "count": len(docs)}
    except RuntimeError:
        return {"entries": [], "count": 0, "message": "DB unavailable"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
