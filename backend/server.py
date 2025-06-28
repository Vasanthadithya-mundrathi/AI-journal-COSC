import os
import uuid
import asyncio
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

# Environment variables
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')

# Initialize FastAPI
app = FastAPI(title="AI-Powered Journal API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory database
db = {
    "journal_entries": [
        {
            "id": "1",
            "title": "A Great Day",
            "content": "Today was a great day. I went to the park and had a picnic with my friends. The weather was perfect.",
            "mood": "happy",
            "summary": "A happy day spent with friends at the park.",
            "created_at": datetime.now(timezone.utc)
        },
        {
            "id": "2",
            "title": "A Tough Day",
            "content": "Today was a tough day. I had a lot of work to do and I felt overwhelmed. I hope tomorrow is better.",
            "mood": "overwhelmed",
            "summary": "A tough day with a lot of work.",
            "created_at": datetime.now(timezone.utc)
        }
    ]
}

# Models
class JournalEntryCreate(BaseModel):
    title: str
    content: str

class JournalEntryResponse(BaseModel):
    id: str
    title: str
    content: str
    mood: Optional[str] = None
    summary: Optional[str] = None
    created_at: datetime
    
class AIAnalysisResponse(BaseModel):
    mood: str
    summary: str

# AI Analysis Function
async def analyze_journal_entry(content: str) -> dict:
    """Analyze journal entry for mood and summary using Gemini AI"""
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""Analyze the following journal entry and provide the mood and a summary.

Journal Entry:
{content}

Instructions:
1.  **Mood**: Choose one of the following moods that best describes the entry: happy, sad, excited, anxious, reflective, grateful, frustrated, content, overwhelmed, hopeful, angry, peaceful.
2.  **Summary**: Provide a brief, one to two-sentence summary of the entry.

Respond in the following format:
MOOD: [mood]
SUMMARY: [summary]"""
        
        response = await model.generate_content_async(prompt)
        
        # Parse response
        lines = response.text.strip().split('\n')
        mood = ""
        summary = ""
        
        for line in lines:
            if line.startswith("MOOD:"):
                mood = line.replace("MOOD:", "").strip()
            elif line.startswith("SUMMARY:"):
                summary = line.replace("SUMMARY:", "").strip()
        
        return {
            "mood": mood or "reflective",
            "summary": summary or "A personal reflection and thoughts."
        }
        
    except Exception as e:
        print(f"AI Analysis error: {e}")
        return {
            "mood": "reflective",
            "summary": "A personal journal entry with thoughts and experiences."
        }

# Routes
@app.get("/")
async def root():
    return {"message": "AI-Powered Journal API"}

@app.post("/api/journal/entries", response_model=JournalEntryResponse)
async def create_journal_entry(entry: JournalEntryCreate):
    """Create a new journal entry with AI analysis"""
    try:
        # Generate unique ID
        entry_id = str(uuid.uuid4())
        
        # Get AI analysis
        ai_analysis = await analyze_journal_entry(entry.content)
        
        # Create journal entry document
        journal_doc = {
            "id": entry_id,
            "title": entry.title,
            "content": entry.content,
            "mood": ai_analysis["mood"],
            "summary": ai_analysis["summary"],
            "created_at": datetime.now(timezone.utc)
        }
        
        # Insert into in-memory db
        db["journal_entries"].append(journal_doc)
        
        return JournalEntryResponse(**journal_doc)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating journal entry: {str(e)}")

@app.get("/api/journal/entries", response_model=List[JournalEntryResponse])
async def get_journal_entries():
    """Get all journal entries sorted by creation date (newest first)"""
    try:
        # Sort entries by creation date (newest first)
        sorted_entries = sorted(db["journal_entries"], key=lambda x: x["created_at"], reverse=True)
        return [JournalEntryResponse(**entry) for entry in sorted_entries]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching journal entries: {str(e)}")

@app.get("/api/journal/entries/{entry_id}", response_model=JournalEntryResponse)
async def get_journal_entry(entry_id: str):
    """Get a specific journal entry by ID"""
    try:
        entry = next((entry for entry in db["journal_entries"] if entry["id"] == entry_id), None)
        if not entry:
            raise HTTPException(status_code=404, detail="Journal entry not found")
            
        return JournalEntryResponse(**entry)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching journal entry: {str(e)}")

@app.delete("/api/journal/entries/{entry_id}")
async def delete_journal_entry(entry_id: str):
    """Delete a journal entry"""
    try:
        initial_len = len(db["journal_entries"])
        db["journal_entries"] = [entry for entry in db["journal_entries"] if entry["id"] != entry_id]
        
        if len(db["journal_entries"]) == initial_len:
            raise HTTPException(status_code=404, detail="Journal entry not found")
        
        return {"message": "Journal entry deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting journal entry: {str(e)}")

@app.post("/api/journal/analyze", response_model=AIAnalysisResponse)
async def analyze_text(content: dict):
    """Analyze text for mood and summary (for real-time preview)"""
    try:
        text = content.get("text", "")
        if not text.strip():
            return AIAnalysisResponse(mood="neutral", summary="No content to analyze")
        
        analysis = await analyze_journal_entry(text)
        return AIAnalysisResponse(**analysis)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing text: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
