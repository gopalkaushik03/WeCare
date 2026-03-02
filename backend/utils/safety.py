from typing import Literal

DISCLAIMERS: dict[str, str] = {
    "low": (
        "WeCare is an AI companion, not a licensed therapist. "
        "For persistent distress, consider speaking with a mental health professional."
    ),
    "medium": (
        "These feelings deserve professional attention. "
        "Consider booking a session with a counselor or therapist. "
        "WeCare is a supportive tool, not a replacement for clinical care."
    ),
    "high": (
        "⚠️ Your safety is the priority. "
        "Please reach out to a crisis helpline immediately. "
        "WeCare cannot provide emergency support — call 112 or iCall: 9152987821."
    ),
}


def get_safety_disclaimer() -> str:
    """Legacy fallback — returns the 'low' risk disclaimer."""
    return DISCLAIMERS["low"]


def get_contextual_disclaimer(risk_level: Literal["low", "medium", "high"] = "low") -> str:
    """Returns an adaptive disclaimer based on the AI-assessed risk level."""
    return DISCLAIMERS.get(risk_level, DISCLAIMERS["low"])
