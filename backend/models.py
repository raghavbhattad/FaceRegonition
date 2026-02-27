from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class AdminLoginRequest(BaseModel):
    username: str
    password: str

class VerifyResponse(BaseModel):
    status: str = Field(..., description="'granted' or 'denied'")
    member_name: Optional[str] = None
    confidence: Optional[float] = None
    message: Optional[str] = None

class LogEntry(BaseModel):
    member_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: str
    confidence: Optional[float] = None
