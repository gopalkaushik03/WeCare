"""
backend/routes/analyze.py

POST /api/v1/analyze — The main AI analysis endpoint.
- Rate limited: 10 requests/hour per IP
- Async Gemini call
- Contextual safety disclaimer
- Optionally fetches user history for longitudinal context
- Auth is OPTIONAL: guests get AI analysis, logged-in users get longitudinal context
"""

import logging
from fastapi import APIRouter, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List
from slowapi import Limiter
from slowapi.util import get_remote_address
import jwt
import os

from services.gemini_client import analyze_user_input
from utils.safety import get_contextual_disclaimer
from db import MONGODB_DB

log = logging.getLogger("wecare.analyze")
router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

# Optional bearer — does NOT raise 401 if token is missing
_optional_bearer = HTTPBearer(auto_error=False)

async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_optional_bearer),
) -> Optional[str]:
    """Returns user_id if a valid JWT is present, otherwise None (guest)."""
    if not credentials:
        return None
    try:
        secret = os.getenv("JWT_SECRET", "super-secret-key-for-local-dev-only")
        payload = jwt.decode(credentials.credentials, secret, algorithms=["HS256"])
        return payload.get("sub")
    except Exception:
        return None


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
    user_id: Optional[str] = Depends(get_optional_user),
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
            db = get_client()[MONGODB_DB]
            cursor = db["mood_entries"].find(
                {"user_id": user_id},
                {"_id": 0, "date": 1, "mood": 1, "risk_level": 1, "emotional_themes": 1},
            ).sort("created_at", -1).limit(5)
            history = await cursor.to_list(5)
            history.reverse()  # chronological order for the prompt
        except RuntimeError:
            log.warning("[ANALYZE] DB client not initialized.")
        except Exception as e:
            log.warning("[ANALYZE] Could not fetch history: %s", e)

    result = await analyze_user_input(user_data, history=history)

    # Ensure disclaimer is always contextually appropriate
    result["disclaimer"] = get_contextual_disclaimer(result.get("risk_level", "low"))

    return result
