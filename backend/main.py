from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv(override=True)

# Initialize FastAPI app
app = FastAPI()

# Enable CORS (Allows your frontend to talk to this backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# SAFETY INTERCEPTION LAYER
CRISIS_KEYWORDS = [
    "suicide", "kill myself", "end my life", "want to die", 
    "hurt myself", "cutting", "overdose"
]

# Configure Gemini API
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

# Initialize Model (using stable alias without strict JSON enforcement)
try:
    model = genai.GenerativeModel('gemini-flash-latest')
except Exception as e:
    print(f"Error initializing model: {e}")
    model = None

# Define Data Model for the Request
class MoodRequest(BaseModel):
    mood: str
    notes: str

# Helper to load system prompt
def get_system_prompt():
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        prompt_path = os.path.join(current_dir, "..", "prompts", "mental_health.txt")
        if os.path.exists(prompt_path):
            with open(prompt_path, "r", encoding="utf-8") as f:
                return f.read()
    except Exception:
        pass
    return "You are a helpful mental health assistant. Please return your response in JSON format."

# --- THE API ENDPOINT ---
@app.post("/analyze")
async def analyze_mood(request: MoodRequest):
    # 1. Check for immediate crisis keywords locally
    notes_lower = request.notes.lower()
    for keyword in CRISIS_KEYWORDS:
        if keyword in notes_lower:
            return {
                "summary": "It sounds like you're going through a very difficult time.",
                "risk_level": "high",
                "suggestions": ["Please reach out to a professional immediately.", "You are not alone."],
                "resources": ["Suicide Prevention Lifeline", "Emergency Services"],
                "disclaimer": "Safety First: We detected potential crisis language. Please seek help."
            }

    if not model:
        raise HTTPException(status_code=503, detail="AI Model not initialized.")

    system_prompt = get_system_prompt()
    user_data = {"mood": request.mood, "notes": request.notes}
    user_message = json.dumps(user_data)
    
    full_prompt = f"{system_prompt}\n\nUSER INPUT:\n{user_message}\n\nIMPORTANT: Return ONLY valid JSON with all required fields."

    try:
        response = model.generate_content(full_prompt)
        raw_text = response.text
        print(f"[DEBUG] Raw Gemini response:\n{raw_text}\n")
        
        # Clean up the response
        text = raw_text.replace("```json", "").replace("```", "").strip()
        
        # Try to find JSON object if there's extra text
        if not text.startswith("{"):
            # Find the first { and last }
            start = text.find("{")
            end = text.rfind("}") + 1
            if start != -1 and end > start:
                text = text[start:end]
        
        parsed = json.loads(text)
        print(f"[DEBUG] Parsed JSON successfully: {list(parsed.keys())}")
        
        # Ensure all required fields exist with defaults
        result = {
            "summary": parsed.get("summary", "Unable to generate summary."),
            "insight": parsed.get("insight"),
            "reframe": parsed.get("reframe"),
            "action": parsed.get("action"),
            "risk_level": parsed.get("risk_level", "low"),
            "suggestions": parsed.get("suggestions", ["Take a deep breath", "Drink water", "Take a short walk"]),
            "resources": parsed.get("resources", [])
        }
        print(f"[DEBUG] Returning validated response")
        return result

    except json.JSONDecodeError as e:
        print(f"[ERROR] JSON parsing failed: {e}")
        if 'raw_text' in locals():
            print(f"[ERROR] Failed to parse: {raw_text[:500]}")
        return {
            "summary": "We're having trouble connecting to our AI service right now.",
            "risk_level": "low",
            "suggestions": ["Breathe deeply", "Drink water"],
            "resources": [],
            "disclaimer": "System Error: JSON parsing failed."
        }
    except Exception as e:
        print(f"[ERROR] Gemini Analysis Failed: {e}")
        if 'response' in locals():
            print(f"[ERROR] Raw response: {response.text[:500]}")
        return {
            "summary": "We're having trouble connecting to our AI service right now.",
            "risk_level": "low",
            "suggestions": ["Breathe deeply", "Drink water"],
            "resources": [],
            "disclaimer": "System Error: Model not available."
        }

@app.get("/")
def home():
    return {"message": "WeCare Backend is Running"}