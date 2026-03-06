"""
backend/models.py

Pydantic document models for WeCare MongoDB collections.

These models define the shape of data stored in each collection.
They are used for:
  - Input validation (Pydantic's automatic type coercion & error messages)
  - Type safety during insert / query operations
  - Swagger / OpenAPI documentation generation

Collections:
  - users          → UserDocument
  - mood_entries   → MoodEntryCreate (API input) / MoodEntryDocument (stored)
  - analysis_logs  → AnalysisLogDocument
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, field_validator


# ---------------------------------------------------------------------------
# Shared utility
# ---------------------------------------------------------------------------
def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


# ---------------------------------------------------------------------------
# users collection
# ---------------------------------------------------------------------------
class UserDocument(BaseModel):
    """Represents a document stored in the `users` collection."""
    user_id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique user identifier")
    email: str = Field(..., description="User email address — unique index in MongoDB")
    display_name: Optional[str] = Field(None, description="Optional display name")
    created_at: datetime = Field(default_factory=_utcnow)

    @field_validator("email")
    @classmethod
    def email_must_contain_at(cls, v: str) -> str:
        if "@" not in v:
            raise ValueError("Invalid email address — must contain '@'")
        return v.strip().lower()

    model_config = {"populate_by_name": True}


# ---------------------------------------------------------------------------
# mood_entries collection
# ---------------------------------------------------------------------------
class MoodEntryCreate(BaseModel):
    """
    API request model for POST /api/v1/entries.
    Sent by the frontend after a successful AI analysis.
    """
    user_id: str = Field(default="local_user", description="User identifier (Clerk token in Phase 2)")
    mood: str = Field(..., min_length=1, max_length=200, description="The user's mood string")
    notes: Optional[str] = Field("", max_length=2000, description="Optional free-text notes")
    cognitive_load_score: Optional[float] = Field(
        None,
        ge=0.0,
        le=100.0,
        description="Frontend typing-analysis score, 0–100. None if not computed.",
    )
    # AI analysis result fields — persisted alongside the entry
    risk_level: str = Field("low", pattern="^(low|medium|high)$")
    summary: str = Field("", max_length=2000)
    insight: Optional[str] = Field(None, max_length=2000)
    reframe: Optional[str] = Field(None, max_length=2000)
    action: Optional[str] = Field(None, max_length=2000)
    reframe_technique: Optional[str] = None
    emotional_themes: List[str] = Field(default_factory=list)
    suggestions: List[str] = Field(default_factory=list)
    date: Optional[str] = Field(None, description="ISO date string YYYY-MM-DD; auto-inferred if omitted")

    @field_validator("mood")
    @classmethod
    def mood_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("mood must not be blank")
        return v.strip()

    @field_validator("cognitive_load_score")
    @classmethod
    def validate_cognitive_load(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and not (0.0 <= v <= 100.0):
            raise ValueError("cognitive_load_score must be between 0 and 100")
        return v


class MoodEntryDocument(BaseModel):
    """
    Full document written to the `mood_entries` collection.
    Includes server-generated `created_at` timestamp.
    """
    user_id: str
    mood: str
    notes: Optional[str] = ""
    cognitive_load_score: Optional[float] = None
    # AI analysis result nested as a sub-document
    ai_analysis: Dict[str, Any] = Field(default_factory=dict)
    risk_level: str = "low"
    date: str = Field(default_factory=lambda: _utcnow().date().isoformat())
    created_at: datetime = Field(default_factory=_utcnow)

    @classmethod
    def from_create(cls, entry: MoodEntryCreate, date_str: Optional[str] = None) -> "MoodEntryDocument":
        """Convert an API MoodEntryCreate into a storable MoodEntryDocument."""
        now = _utcnow()
        return cls(
            user_id=entry.user_id,
            mood=entry.mood,
            notes=entry.notes or "",
            cognitive_load_score=entry.cognitive_load_score,
            risk_level=entry.risk_level,
            date=date_str or entry.date or now.date().isoformat(),
            created_at=now,
            ai_analysis={
                "summary": entry.summary,
                "insight": entry.insight,
                "reframe": entry.reframe,
                "action": entry.action,
                "reframe_technique": entry.reframe_technique,
                "emotional_themes": entry.emotional_themes,
                "suggestions": entry.suggestions,
            },
        )

    model_config = {"populate_by_name": True}


# ---------------------------------------------------------------------------
# analysis_logs collection
# ---------------------------------------------------------------------------
class AnalysisLogDocument(BaseModel):
    """
    Audit document written to the `analysis_logs` collection for every
    Gemini API call made via POST /api/v1/analyze.

    Security notes:
      - gemini_response_summary stores only a short excerpt, NOT the full raw response.
      - user mood/notes ARE inside the prompt — logs must be treated as PII.
    """
    request_id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique per-request UUID")
    user_id: str = Field(default="local_user")
    risk_level: str = Field("low", pattern="^(low|medium|high|unknown)$")
    # Prompt stored for debugging / auditing AI behaviour
    gemini_prompt_excerpt: str = Field("", max_length=500, description="First 500 chars of the prompt sent")
    # Response summary — NOT the raw JSON to avoid excessive storage
    gemini_response_summary: str = Field("", max_length=500)
    reframe_technique: Optional[str] = None
    emotional_themes: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=_utcnow)

    model_config = {"populate_by_name": True}

# ---------------------------------------------------------------------------
# User & Auth Models (Stage 5)
# ---------------------------------------------------------------------------

class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=200)
    password: str = Field(..., min_length=8)

    @field_validator("email")
    @classmethod
    def email_must_contain_at(cls, v: str) -> str:
        if "@" not in v:
            raise ValueError("Invalid email address — must contain '@'")
        return v.strip().lower()

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    name: str
