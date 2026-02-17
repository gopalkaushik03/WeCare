from google import genai
import os
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv(override=True)

# SAFETY INTERCEPTION LAYER
CRISIS_KEYWORDS = [
    "suicide", "kill myself", "end my life", "want to die", 
    "hurt myself", "cutting", "overdose"
]

# Initialize Client
api_key = os.getenv("GEMINI_API_KEY")
client = None
if api_key:
    try:
        client = genai.Client(api_key=api_key)
    except Exception as e:
        print(f"Error initializing GenAI client: {e}")
else:
    print("WARNING: GEMINI_API_KEY not found.")

def get_system_prompt():
    """Reads the system prompt from the prompts folder."""
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        prompt_path = os.path.join(current_dir, "..", "prompts", "mental_health.txt")
        with open(prompt_path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        print(f"Error loading prompt: {e}")
        return "You are a helpful mental health assistant."

def analyze_user_input(user_data: dict) -> dict:
    """
    Analyzes user mood and notes using Gemini API (via google-genai SDK).
    Returns a structured JSON response.
    """
    # 1. Check for immediate crisis keywords locally
    notes = user_data.get("notes", "").lower()
    for keyword in CRISIS_KEYWORDS:
        if keyword in notes:
            return {
                "summary": "It sounds like you're going through a very difficult time.",
                "risk_level": "high", 
                "suggestions": ["Please reach out to a professional immediately.", "You are not alone."],
                "resources": ["Suicide Prevention Lifeline", "Emergency Services"],
                "disclaimer": "Safety First: We detected potential crisis language. Please seek help."
            }

    if not client:
        return {
            "summary": "System Configuration Error.",
            "risk_level": "low",
            "suggestions": [],
            "resources": [],
            "disclaimer": "AI Client not initialized."
        }

    system_prompt = get_system_prompt()
    user_message = json.dumps(user_data)
    
    # 2. Call Gemini API
    try:
        # Using the new SDK pattern
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=f"{system_prompt}\n\nUSER INPUT:\n{user_message}"
        )
        
        text = response.text
        
        # Clean potential markdown
        text = text.replace("```json", "").replace("```", "").strip()
        
        return json.loads(text)

    except Exception as e:
        print(f"Gemini Analysis Failed: {e}")
        # import traceback
        # traceback.print_exc()
        
        return {
            "summary": "We're having trouble connecting to our AI service right now.",
            "risk_level": "low",
            "suggestions": ["Breathe deeply", "Drink water"],
            "resources": ["Self-Care Basics"],
            "disclaimer": "System Error: Model not available."
        }
