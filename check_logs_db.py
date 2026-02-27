from db import get_db
from datetime import datetime

db = get_db()
logs = list(db["entry_logs"].find().sort("timestamp", -1).limit(5))

print(f"Current UTC time: {datetime.utcnow()}")
for log in logs:
    print(f"Log ID: {log['_id']}, Member: {log['member_id']}, Status: {log['status']}, Timestamp: {log['timestamp']}")
