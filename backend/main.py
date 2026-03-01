from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import json

# Load environment variables from backend/.env first, then fallback to root .env
load_dotenv(override=True)

# Import the Gemini client service
from services.gemini_client import analyze_user_input, client as gemini_client

# Initialize FastAPI app
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define Data Model for the Request
class MoodRequest(BaseModel):
    mood: str
    notes: str

# --- THE API ENDPOINT ---
@app.post("/analyze")
async def analyze_mood(request: MoodRequest):
    """
    Analyzes mood and notes using Gemini AI.
    Crisis keywords are intercepted in gemini_client.py before hitting the API.
    """
    user_data = {"mood": request.mood, "notes": request.notes}

    print(f"[INFO] Received analysis request: mood={request.mood}")

    result = analyze_user_input(user_data)

    print(f"[INFO] Returning result with risk_level={result.get('risk_level', 'unknown')}")
    return result

@app.get("/")
def home():
    api_status = "✅ Connected" if gemini_client else "❌ Not initialized (check GEMINI_API_KEY)"
    return {
        "message": "WeCare Backend is Running",
        "gemini_status": api_status
    }

@app.get("/health")
def health():
    return {
        "status": "ok",
        "gemini_client": gemini_client is not None,
        "api_key_set": bool(os.getenv("GEMINI_API_KEY"))
    }