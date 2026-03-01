"""
backend/services/gemini_client.py

Gemini AI client using the new google-genai SDK.
Called by main.py to analyze mood entries.
"""

from google import genai
import os
import json
from dotenv import load_dotenv

# Load env — looks for backend/.env first, then root .env
load_dotenv(override=True)

# -------------------------------------------------------
# SAFETY INTERCEPTION LAYER (runs before any API call)
# -------------------------------------------------------
CRISIS_KEYWORDS = [
    "suicide", "kill myself", "end my life", "want to die",
    "hurt myself", "cutting", "overdose"
]

CRISIS_RESPONSE = {
    "summary": "It sounds like you're going through a very difficult time. You are not alone.",
    "insight": "Your feelings are valid. Please reach out to someone who can help right now.",
    "reframe": "Crisis support is available 24/7 — you deserve care and support.",
    "action": "Please call or text a crisis helpline immediately.",
    "risk_level": "high",
    "suggestions": [
        "Call iCall: 9152987821 (India)",
        "Text a trusted friend or family member right now",
        "Go to your nearest emergency room if you feel unsafe"
    ],
    "resources": ["iCall India: 9152987821", "Vandrevala Foundation: 1860-2662-345", "Emergency: 112"],
    "disclaimer": "⚠️ Safety First: Crisis language detected. Please seek immediate help."
}

# -------------------------------------------------------
# Initialize Gemini Client
# -------------------------------------------------------
api_key = os.getenv("GEMINI_API_KEY")
client = None

if api_key:
    try:
        client = genai.Client(api_key=api_key)
        print(f"[GEMINI] ✅ Client initialized successfully.")
    except Exception as e:
        print(f"[GEMINI] ❌ Error initializing client: {e}")
else:
    print("[GEMINI] ❌ WARNING: GEMINI_API_KEY not found in environment.")


def get_system_prompt() -> str:
    """Reads the system prompt from the prompts folder."""
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        prompt_path = os.path.join(current_dir, "..", "prompts", "mental_health.txt")
        with open(prompt_path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        print(f"[GEMINI] Warning: Could not load prompt file: {e}")
        return (
            "You are WeCare, a compassionate AI mental health companion. "
            "Analyze the user's mood and notes and return ONLY a valid JSON object with these exact fields: "
            "summary (string), insight (string), reframe (string), action (string), "
            "risk_level (string: 'low'|'medium'|'high'), suggestions (array of 3 strings), "
            "resources (array of strings). No markdown, no extra text — pure JSON only."
        )


def analyze_user_input(user_data: dict) -> dict:
    """
    Analyzes user mood and notes using Gemini API.
    Returns a structured dict with AI insights.
    """
    # 1. Crisis keyword check (local, instant)
    notes = user_data.get("notes", "").lower()
    for keyword in CRISIS_KEYWORDS:
        if keyword in notes:
            print(f"[GEMINI] ⚠️ Crisis keyword detected: '{keyword}'")
            return CRISIS_RESPONSE

    # 2. Check client is ready
    if not client:
        print("[GEMINI] ❌ Client not initialized — returning fallback.")
        return {
            "summary": "AI service is not configured.",
            "insight": None,
            "reframe": None,
            "action": None,
            "risk_level": "low",
            "suggestions": ["Check your GEMINI_API_KEY in backend/.env"],
            "resources": [],
            "disclaimer": "System Error: AI Client not initialized. Check GEMINI_API_KEY."
        }

    # 3. Build prompt
    system_prompt = get_system_prompt()
    user_message = json.dumps(user_data)
    full_prompt = (
        f"{system_prompt}\n\n"
        f"USER INPUT:\n{user_message}\n\n"
        f"IMPORTANT: Return ONLY valid JSON. No markdown code blocks, no extra text."
    )

    # 4. Call Gemini API
    try:
        print(f"[GEMINI] Calling API with model: models/gemini-2.5-flash ...")
        response = client.models.generate_content(
            model="models/gemini-2.5-flash",
            contents=full_prompt
        )

        raw_text = response.text
        print(f"[GEMINI] Raw response (first 300 chars):\n{raw_text[:300]}")

        # Clean markdown wrappers if present
        text = raw_text.replace("```json", "").replace("```", "").strip()

        # Find JSON boundaries if there's extra text
        if not text.startswith("{"):
            start = text.find("{")
            end = text.rfind("}") + 1
            if start != -1 and end > start:
                text = text[start:end]

        parsed = json.loads(text)
        print(f"[GEMINI] ✅ Parsed successfully. Keys: {list(parsed.keys())}")

        return {
            "summary": parsed.get("summary", "Unable to generate summary."),
            "insight": parsed.get("insight"),
            "reframe": parsed.get("reframe"),
            "action": parsed.get("action"),
            "risk_level": parsed.get("risk_level", "low"),
            "suggestions": parsed.get("suggestions", ["Take a deep breath", "Drink water", "Take a short walk"]),
            "resources": parsed.get("resources", [])
        }

    except json.JSONDecodeError as e:
        print(f"[GEMINI] ❌ JSON parse error: {e}")
        print(f"[GEMINI] Raw text was: {raw_text[:500] if 'raw_text' in dir() else 'N/A'}")
        return {
            "summary": "We received a response but couldn't parse it. Please try again.",
            "insight": None, "reframe": None, "action": None,
            "risk_level": "low",
            "suggestions": ["Breathe deeply", "Drink water", "Try again in a moment"],
            "resources": [],
            "disclaimer": "System Error: JSON parsing failed."
        }

    except Exception as e:
        print(f"[GEMINI] ❌ API call failed: {e}")
        return {
            "summary": "We're having trouble connecting to the AI service right now.",
            "insight": None, "reframe": None, "action": None,
            "risk_level": "low",
            "suggestions": ["Breathe deeply", "Drink water", "Try again in a moment"],
            "resources": [],
            "disclaimer": f"System Error: {str(e)}"
        }
