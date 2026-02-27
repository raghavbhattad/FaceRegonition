import os
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from models import VerifyResponse
from auth import verify_password, create_access_token, get_current_admin
from db import get_db, EmbeddingCache, log_entry
from face_engine import get_embedding, find_best_match
from dotenv import load_dotenv

load_dotenv()

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD_HASH = os.getenv("ADMIN_PASSWORD_HASH", "2bb80d537b1da3e38bd30361aa855686bde0eacd7162fef6a25fe97bf527a25b")

db = get_db()
cache = EmbeddingCache()

@asynccontextmanager
async def lifespan(app: FastAPI):
    cache.load_embeddings()
    yield

app = FastAPI(title="Face Recognition API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok", "db_connected": db is not None, "cache_loaded": cache.is_loaded}

@app.post("/login")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    if form_data.username != ADMIN_USERNAME or not verify_password(form_data.password, ADMIN_PASSWORD_HASH):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": form_data.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/register")
async def register_member(
    name: str = Form(...),
    member_id: str = Form(...),
    membership_type: str = Form(...),
    valid_until: str = Form(...),
    image: UploadFile = File(...),
    current_admin: str = Depends(get_current_admin)
):
    if db["members"].find_one({"member_id": member_id}):
        raise HTTPException(status_code=400, detail="Member already exists")
    
    image_bytes = await image.read()
    try:
        # Check liveness during registration
        embedding = get_embedding(image_bytes, check_liveness=True)
    except Exception as e:
        if "Spoof detected" in str(e):
            raise HTTPException(status_code=400, detail="Anti-spoofing check failed. Please provide a real face image.")
        raise HTTPException(status_code=400, detail=str(e))
    
    member_data = {
        "name": name,
        "member_id": member_id,
        "membership_type": membership_type,
        "valid_until": valid_until,
        "embedding": embedding
    }
    
    db["members"].insert_one(member_data)
    cache.add_to_cache(member_id, name, valid_until, embedding)
    
    return {"status": "success", "message": f"Member {name} registered successfully."}

@app.post("/verify", response_model=VerifyResponse)
async def verify_face(image: UploadFile = File(...)):
    image_bytes = await image.read()
    
    try:
        # Check liveness during verification
        probe_embedding = get_embedding(image_bytes, check_liveness=True)
    except Exception as e:
        if "Spoof detected" in str(e):
            log_entry("unknown", "spoof", None)
            return VerifyResponse(status="spoof", message="Spoofing attempt detected!")
        
        log_entry("unknown", "denied", None)
        return VerifyResponse(status="denied", message="No face detected or processing failed.")
    
    match = find_best_match(probe_embedding, cache.cache, threshold=0.75)
    
    if match:
        member_id, member_name, confidence = match
        
        # Membership expiration check
        member_info = cache.cache.get(member_id)
        if member_info and member_info.get("valid_until"):
            try:
                valid_until_date = datetime.strptime(member_info["valid_until"], "%Y-%m-%d").date()
                current_date = datetime.now().date()
                
                if current_date > valid_until_date:
                    log_entry(member_id, "expired", confidence)
                    return VerifyResponse(status="denied", message="Access denied - Membership expired.")
            except Exception as e:
                print(f"Error parsing date for {member_id}: {e}")

        log_entry(member_id, "granted", confidence)
        return VerifyResponse(status="granted", member_name=member_name, confidence=confidence)
    else:
        log_entry("unknown", "denied", None)
        return VerifyResponse(status="denied", message="Access denied - Face not recognized.")

@app.get("/logs")
async def get_logs(member_id: Optional[str] = None, limit: int = 50, current_admin: str = Depends(get_current_admin)):
    query = {}
    if member_id:
        query["member_id"] = member_id
    
    # Calculate global stats
    total_count = db["entry_logs"].count_documents({})
    granted_count = db["entry_logs"].count_documents({"status": "granted"})
    denied_count = db["entry_logs"].count_documents({"status": "denied"})
    spoof_count = db["entry_logs"].count_documents({"status": "spoof"})
    expired_count = db["entry_logs"].count_documents({"status": "expired"})
    
    logs = db["entry_logs"].find(query).sort("timestamp", -1).limit(limit)
    
    results = []
    for log in logs:
        log["_id"] = str(log["_id"])
        # Ensure timestamp is ISO formatted with timezone for the frontend
        if isinstance(log.get("timestamp"), datetime):
            log["timestamp"] = log["timestamp"].replace(tzinfo=timezone.utc).isoformat()
        results.append(log)
    
    return {
        "logs": results,
        "stats": {
            "total": total_count,
            "granted": granted_count,
            "denied": denied_count,
            "spoof": spoof_count,
            "expired": expired_count
        }
    }
