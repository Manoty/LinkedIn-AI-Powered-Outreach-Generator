from pydantic import BaseModel
from typing import List, Optional

class OutreachRequest(BaseModel):
    linkedin_text: str
    your_profile: str
    goal: str  # job | internship | networking | consulting
    tone: Optional[str] = "professional"  # professional | founder | friendly

class OutreachResponse(BaseModel):
    subject: str
    email: str
    linkedin_message: str
    key_insights: List[str]