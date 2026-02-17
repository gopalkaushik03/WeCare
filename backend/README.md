# WeCare Backend

A FastAPI-based backend for the WeCare mental health platform, integrating interactions with Google Gemini AI.

## Requirements
- Python 3.9+
- A Google Gemini API Key

## Setup

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Environment**
   - Open `.env`
   - Add your API Key: `GEMINI_API_KEY=your_key_here`

3. **Run the Server**
   ```bash
   uvicorn main:app --reload
   ```
   Or simply:
   ```bash
   python main.py
   ```

## endpoints

### `POST /analyze`
Analyzes user mood and feelings.

**Request Body:**
```json
{
  "mood_score": 7,
  "feelings": ["Happy", "Energetic"],
  "notes": "Had a great day!"
}
```

**Response:**
```json
{
  "summary": "...",
  "risk_level": "low",
  "suggestions": [...],
  "resources": [...],
  "disclaimer": "..."
}
```
