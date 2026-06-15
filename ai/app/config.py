import os

class Config:
    MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    DB_NAME = os.getenv("DB_NAME", "urbanlens")
    JWT_SECRET = os.getenv("JWT_SECRET", "supersecretjwtkeyforurbanlensai2026")
    JWT_ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours
    
    # Fallback storage path
    FALLBACK_DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "db_fallback.json")
    
    # Upload folder
    UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
    os.makedirs(UPLOAD_DIR, exist_ok=True)

config = Config()
