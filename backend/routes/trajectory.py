"""
backend/routes/trajectory.py

GET /api/v1/me/trajectory — 7-day emotional trajectory analysis.

Uses the rule-based predict_trajectory() function from gemini_client.
No ML model required — leverages risk_level ordinals from stored entries.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

TRAJECTORY_META = {
    "improving": {
        "label": "Improving",
        "direction": "up",
        "color": "green",
        "message": "Your emotional wellbeing has been trending upward. Keep going! 💚",
    },
    "stable": {
        "label": "Stable",
        "direction": "flat",
        "color": "gray",
        "message": "You've been maintaining a steady emotional baseline. Consistency is strength.",
    },
    "declining": {
        "label": "Needs Attention",
        "direction": "down",
        "color": "amber",
        "message": "Your entries suggest a challenging stretch. Be gentle with yourself. 🤍",
    },
    "insufficient_data": {
        "label": "Getting Started",
        "direction": "flat",
        "color": "blue",
        "message": "Log a few more check-ins to see your emotional trajectory.",
    },
}


class TrajectoryResponse(BaseModel):
    trajectory: str
    label: str
    direction: str
    color: str
    message: str
    score_history: list[int]  # risk ordinals over last 7 entries (1=low, 2=med, 3=high)
    entry_count: int


@router.get("/me/trajectory", response_model=TrajectoryResponse)
async def get_trajectory(
    user_id: str = Query(default="local_user"),
    days: int = Query(default=7, le=30),
):
    from services.gemini_client import predict_trajectory

    try:
        from db import get_client
        db = get_client()["wecare"]
        cursor = db["mood_entries"].find(
            {"user_id": user_id},
            {"risk_level": 1, "date": 1, "_id": 0},
        ).sort("created_at", -1).limit(days)
        docs = await cursor.to_list(days)
        docs.reverse()  # chronological order
    except RuntimeError:
        docs = []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    risk_map = {"low": 1, "medium": 2, "high": 3}
    score_history = [risk_map.get(d.get("risk_level", "low"), 1) for d in docs]
    trajectory = predict_trajectory(docs)
    meta = TRAJECTORY_META.get(trajectory, TRAJECTORY_META["insufficient_data"])

    return TrajectoryResponse(
        trajectory=trajectory,
        label=meta["label"],
        direction=meta["direction"],
        color=meta["color"],
        message=meta["message"],
        score_history=score_history,
        entry_count=len(docs),
    )
