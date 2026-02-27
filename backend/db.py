import os
from datetime import datetime, timezone
from pymongo import MongoClient
import numpy as np

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = "face_recognition_db"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

def get_db():
    return db

class EmbeddingCache:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EmbeddingCache, cls).__new__(cls)
            cls._instance.cache = {} # Format: {member_id: {"name": str, "valid_until": str, "embedding": np.ndarray}}
            cls._instance.is_loaded = False
        return cls._instance

    def load_embeddings(self):
        """Loads all member embeddings from MongoDB into memory."""
        print("Loading embeddings into memory cache...")
        members_collection = db["members"]
        members = members_collection.find({}, {"member_id": 1, "name": 1, "valid_until": 1, "embedding": 1})
        
        count = 0
        self.cache.clear()
        for member in members:
            if "embedding" in member and member["embedding"]:
                self.cache[member["member_id"]] = {
                    "name": member["name"],
                    "valid_until": member.get("valid_until"),
                    "embedding": np.array(member["embedding"], dtype=np.float32)
                }
                count += 1
        self.is_loaded = True
        print(f"Loaded {count} embeddings into cache.")

    def add_to_cache(self, member_id: str, name: str, valid_until: str, embedding: list):
        """Adds a newly registered member to the memory cache dynamically."""
        self.cache[member_id] = {
            "name": name,
            "valid_until": valid_until,
            "embedding": np.array(embedding, dtype=np.float32)
        }
        print(f"Added member {member_id} to embedding cache.")

def log_entry(member_id: str, status: str, confidence: float = None):
    """Logs an entry attempt to the database."""
    log_data = {
        "member_id": member_id,
        "status": status,
        "confidence": confidence,
        "timestamp": datetime.now(timezone.utc)
    }
    db["entry_logs"].insert_one(log_data)
