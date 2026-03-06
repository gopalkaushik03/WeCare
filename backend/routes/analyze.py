"""
backend/routes/analyze.py

POST /api/v1/analyze — The main AI analysis endpoint.
- Rate limited: 10 requests/hour per IP
- Async Gemini call
- Contextual safety disclaimer
- Optionally fetches user history for longitudinal context
"""

import logging
from fastapi import APIRouter, Request, Depends, Query
from pydantic import BaseModel
from typing import Optional, List
from slowapi import Limiter
from slowapi.util import get_remote_address

from services.gemini_client import analyze_user_input
from utils.safety import get_contextual_disclaimer
from db import MONGODB_DB
from services.auth_service import get_current_user

log = logging.getLogger("wecare.analyze")
router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


# -----------------------------------------------------------------
# Request / Response Models
# -----------------------------------------------------------------
from pydantic import BaseModel, Field

class AnalyzeRequest(BaseModel):
    mood: str = Field(..., min_length=1, max_length=100)
    notes: Optional[str] = Field(default="", max_length=2000)
    cognitive_load_score: Optional[float] = None  # 0–100, from frontend typing analysis


class AnalyzeResponse(BaseModel):
    summary: str
    insight: Optional[str] = None
    reframe: Optional[str] = None
    action: Optional[str] = None
    risk_level: str
    reframe_technique: Optional[str] = None
    emotional_themes: List[str] = []
    suggestions: List[str] = []
    resources: List[str] = []
    disclaimer: str


# -----------------------------------------------------------------
# Endpoint
# -----------------------------------------------------------------
@router.post("/analyze", response_model=AnalyzeResponse)
@limiter.limit("10/hour")
async def analyze_mood(
    request: Request,
    body: AnalyzeRequest,
    user_id: str = Depends(get_current_user),
):
    """
    Analyzes mood and notes using Gemini AI with longitudinal context.

    Optionally pass ?user_id= to load the user's last 5 entries for
    continuity-aware analysis. If DB is unavailable, degrades gracefully.
    """
    user_data = {
        "mood": body.mood,
        "notes": body.notes or "",
        "cognitive_load_score": body.cognitive_load_score,
    }

    # Fetch history for longitudinal context (graceful degradation if DB unavailable)
    history: list[dict] = []
    if user_id:
        try:
            from db import get_client
            from main import MONGODB_URI
            if MONGODB_URI:
                db = get_client()[MONGODB_DB]
                cursor = db["mood_entries"].find(
                    {"user_id": user_id},
                    {"_id": 0, "date": 1, "mood": 1, "risk_level": 1, "emotional_themes": 1},
                ).sort("created_at", -1).limit(5)
                history = await cursor.to_list(5)
                history.reverse()  # chronological order for the prompt
        except Exception as e:
            log.warning("[ANALYZE] Could not fetch history: %s", e)

    result = await analyze_user_input(user_data, history=history)

    # Ensure disclaimer is always contextually appropriate
    result["disclaimer"] = get_contextual_disclaimer(result.get("risk_level", "low"))

    return result
