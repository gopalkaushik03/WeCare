"""
backend/services/gemini_client.py

Production-grade Gemini AI client for WeCare.

Improvements over v1:
  - Async Gemini calls (non-blocking)
  - response_schema for guaranteed JSON structure
  - Regex + negation-aware crisis detection (no false positives)
  - Longitudinal context injection (last-N entries)
  - Emotion trajectory helper
  - CBT technique selector in prompt
"""

import os
import re
import json
import asyncio
import logging
from typing import Optional
from dotenv import load_dotenv
from google import genai
from google.genai import types

log = logging.getLogger("wecare.gemini")

load_dotenv(override=True)

# -----------------------------------------------------------------------
# SAFETY LAYER — regex patterns with negation awareness
# -----------------------------------------------------------------------
# Patterns match active intent, not passive mentions (education, awareness, etc.)
_CRISIS_PATTERNS = [
    # Active intent with first-person framing
    r"\b(i\s+)?(want|going|plan|thinking about|decided)\s+to\s+(die|kill\s+myself|end\s+(my|it\s+all))\b",
    r"\b(i\s+)?(don'?t\s+want\s+to\s+(live|be\s+alive|exist))\b",
    r"\b(hurt|harm|cut|injure)\s+myself\b",
    r"\bsuicide\b(?!\s+(awareness|prevention|hotline|research|note\s+for\s+class|statistics))",
    r"\boverdose\s+(on|myself)\b",
    # Indirect / passive crisis language
    r"\b(everyone\s+would\s+be\s+better\s+without\s+me)\b",
    r"\b(i\s+)?(don'?t\s+see\s+the\s+point|no\s+reason\s+to\s+(go\s+on|live|continue))\b",
    r"\b(i\s+)?(can'?t\s+do\s+this\s+anymore|want\s+to\s+disappear|thinking\s+about\s+ending\s+it)\b",
    r"\b(i\s+)?(feel\s+like\s+a\s+burden|wish\s+i\s+(was|were|wasn'?t)\s+(never\s+)?born)\b",
]

_CRISIS_COMPILED = [re.compile(p, re.IGNORECASE) for p in _CRISIS_PATTERNS]


def is_crisis(text: str) -> bool:
    """Returns True only for genuine crisis language. Negation-aware."""
    return any(pat.search(text) for pat in _CRISIS_COMPILED)


CRISIS_RESPONSE = {
    "summary": "It sounds like you're going through a very difficult time. You are not alone.",
    "insight": "Your feelings are valid. Please reach out to someone who can help right now.",
    "reframe": "Crisis support is available 24/7 — you deserve care and support.",
    "action": "Please call or text a crisis helpline immediately.",
    "risk_level": "high",
    "reframe_technique": "self_compassion_break",
    "emotional_themes": ["crisis", "distress"],
    "suggestions": [
        "Call iCall: 9152987821 (India)",
        "Text a trusted friend or family member right now",
        "Go to your nearest emergency room if you feel unsafe",
    ],
    "resources": [
        "iCall India: 9152987821",
        "Vandrevala Foundation: 1860-2662-345",
        "Emergency: 112",
    ],
    "disclaimer": "⚠️ Safety First: Crisis signals detected. Please seek immediate help.",
}

# -----------------------------------------------------------------------
# Gemini Client Init
# -----------------------------------------------------------------------
api_key = os.getenv("GEMINI_API_KEY")
client: Optional[genai.Client] = None

if api_key:
    try:
        client = genai.Client(api_key=api_key)
        log.info("Gemini client initialized.")
    except Exception as e:
        log.error("Gemini init error: %s", e)
else:
    log.warning("GEMINI_API_KEY not set — AI analysis will use fallback responses.")

# -----------------------------------------------------------------------
# Response Schema — guaranteed JSON structure, eliminates manual parsing
# -----------------------------------------------------------------------
_RESPONSE_SCHEMA = types.Schema(
    type=types.Type.OBJECT,
    required=["summary", "insight", "reframe", "action", "risk_level",
              "reframe_technique", "emotional_themes", "suggestions", "resources"],
    properties={
        "summary":            types.Schema(type=types.Type.STRING),
        "insight":            types.Schema(type=types.Type.STRING),
        "reframe":            types.Schema(type=types.Type.STRING),
        "action":             types.Schema(type=types.Type.STRING),
        "risk_level":         types.Schema(type=types.Type.STRING,
                                           enum=["low", "medium", "high"]),
        "reframe_technique":  types.Schema(type=types.Type.STRING,
                                           enum=["socratic_questioning",
                                                 "behavioral_activation",
                                                 "thought_defusion",
                                                 "gratitude_pivot",
                                                 "self_compassion_break"]),
        "emotional_themes":   types.Schema(type=types.Type.ARRAY,
                                           items=types.Schema(type=types.Type.STRING),
                                           ),
        "suggestions":        types.Schema(type=types.Type.ARRAY,
                                           items=types.Schema(type=types.Type.STRING),
                                           ),
        "resources":          types.Schema(type=types.Type.ARRAY,
                                           items=types.Schema(type=types.Type.STRING),
                                           ),
    },
)

_GENERATE_CONFIG = types.GenerateContentConfig(
    response_mime_type="application/json",
    response_schema=_RESPONSE_SCHEMA,
    temperature=0.7,
)

MODEL_NAME = "gemini-2.5-flash"

# -----------------------------------------------------------------------
# System Prompt Loader
# -----------------------------------------------------------------------
def _get_system_prompt() -> str:
    try:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        prompt_path = os.path.join(base_dir, "..", "prompts", "mental_health.txt")
        with open(prompt_path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        log.warning("Could not load system prompt file: %s", e)
        return (
            "You are WeCare, a compassionate AI mental health companion. "
            "Analyze the user's mood and notes. Select the most appropriate CBT technique "
            "from: socratic_questioning, behavioral_activation, thought_defusion, "
            "gratitude_pivot, self_compassion_break. Return structured JSON exactly matching the schema."
        )


# -----------------------------------------------------------------------
# Longitudinal Context Builder
# -----------------------------------------------------------------------
def _build_history_block(history: list[dict]) -> str:
    if not history:
        return ""
    lines = [
        f"[{e.get('date', 'unknown')}] Mood: {e.get('mood', '?')} | "
        f"Risk: {e.get('risk_level', '?')} | "
        f"Themes: {', '.join(e.get('emotional_themes', []))}"
        for e in history[-5:]  # last 5 entries max
    ]
    block = "\n".join(lines)
    return (
        f"\n\nLONGITUDINAL CONTEXT (user's last {len(lines)} check-ins — use this to detect patterns):\n"
        f"{block}\n"
        "If today's mood represents a significant shift from the pattern above, acknowledge it gently.\n"
    )

# -----------------------------------------------------------------------
# Trajectory Forecaster (rule-based, no ML required)
# -----------------------------------------------------------------------
def predict_trajectory(entries: list[dict]) -> str:
    """
    Lightweight trend detection using risk_level ordinals.
    Returns: 'improving' | 'stable' | 'declining' | 'insufficient_data'
    """
    risk_map = {"low": 1, "medium": 2, "high": 3}
    scores = [risk_map.get(e.get("risk_level", "low"), 1) for e in entries]

    if len(scores) < 3:
        return "insufficient_data"

    avg_early = sum(scores[:max(1, len(scores) // 2)]) / max(1, len(scores) // 2)
    avg_late  = sum(scores[len(scores) // 2:]) / max(1, len(scores) - len(scores) // 2)
    delta = avg_late - avg_early

    if delta > 0.4:
        return "declining"
    if delta < -0.4:
        return "improving"
    return "stable"


# -----------------------------------------------------------------------
# Core Async Analysis Function
# -----------------------------------------------------------------------
async def analyze_user_input(user_data: dict, history: list[dict] | None = None) -> dict:
    """
    Async Gemini analysis with:
    - Instant crisis interception (regex, no API call)
    - Longitudinal context injection
    - Schema-validated JSON response
    """
    notes = user_data.get("notes", "")
    mood = user_data.get("mood", "")

    # 1. Crisis Check — instant, no API call. Check both mood and notes!
    combined_text = f"{mood} {notes}"
    if is_crisis(combined_text):
        log.warning("Crisis pattern detected in user input — returning crisis response.")
        return CRISIS_RESPONSE

    # 2. Fallback if client not ready
    if not client:
        log.error("Gemini client not initialized — returning fallback.")
        return _fallback_response("AI service not configured. Check GEMINI_API_KEY.")

    # 3. Build prompt
    system_prompt = _get_system_prompt()
    history_block = _build_history_block(history or [])
    cognitive_load = user_data.get("cognitive_load_score")
    cl_note = f"\nCognitive Load Score: {cognitive_load}/100 (high = more mental effort while typing)\n" if cognitive_load is not None else ""

    full_prompt = (
        f"{system_prompt}"
        f"{history_block}"
        f"{cl_note}"
        f"\nUSER CHECK-IN:\n{json.dumps({'mood': user_data.get('mood'), 'notes': notes})}"
    )

    # 4. Async Gemini call
    try:
        log.info("Calling %s (async)...", MODEL_NAME)
        response = await client.aio.models.generate_content(
            model=MODEL_NAME,
            contents=full_prompt,
            config=_GENERATE_CONFIG,
        )
        parsed = json.loads(response.text)
        log.info("Gemini response OK. risk_level=%s technique=%s",
                 parsed.get('risk_level'), parsed.get('reframe_technique'))
        return {
            "summary":           parsed.get("summary", ""),
            "insight":           parsed.get("insight"),
            "reframe":           parsed.get("reframe"),
            "action":            parsed.get("action"),
            "risk_level":        parsed.get("risk_level", "low"),
            "reframe_technique": parsed.get("reframe_technique", "thought_defusion"),
            "emotional_themes":  parsed.get("emotional_themes", []),
            "suggestions":       parsed.get("suggestions", ["Take a deep breath", "Drink water", "Take a short walk"]),
            "resources":         parsed.get("resources", []),
        }
    except Exception as e:
        log.error("Gemini API call failed: %s", e)
        return _fallback_response(str(e))


def _fallback_response(reason: str) -> dict:
    return {
        "summary": "We're having trouble connecting to the AI service right now.",
        "insight": None,
        "reframe": None,
        "action": None,
        "risk_level": "low",
        "reframe_technique": "thought_defusion",
        "emotional_themes": [],
        "suggestions": ["Breathe deeply", "Drink water", "Try again in a moment"],
        "resources": [],
        "disclaimer": f"System Error: {reason}",
    }
