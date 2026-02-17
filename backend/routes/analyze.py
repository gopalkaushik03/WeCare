from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from services.gemini_client import analyze_user_input
from utils.safety import get_safety_disclaimer

router = APIRouter()

# Define Request Model
class UserCheckIn(BaseModel):
    mood: str
    notes: Optional[str] = ""

# Define Response Model (Optional, for documentation)
class AnalyzeResponse(BaseModel):
    summary: str
    risk_level: str
    suggestions: List[str]
    resources: List[str]
    disclaimer: str

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_mood(check_in: UserCheckIn):
    try:
        # Convert Pydantic model to dict
        user_data = check_in.model_dump()
        
        # Call AI Service
        result = analyze_user_input(user_data)
        
        # Ensure disclaimer is present (double safety)
        if "disclaimer" not in result or not result["disclaimer"]:
            result["disclaimer"] = get_safety_disclaimer()
            
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
