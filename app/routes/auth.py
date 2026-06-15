from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr
from app.database import get_db
from app.auth import hash_password, verify_password, create_access_token
import logging

logger = logging.getLogger("urbanlens.routes.auth")
router = APIRouter()

# Schemas
class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str  # "admin", "government", "ngo", "citizen"

class LoginRequest(BaseModel):
    username: str
    password: str

# Seed system default users on first load
def seed_default_users():
    db = get_db()
    users_col = db.get_collection("users")
    
    defaults = [
        {"username": "admin", "email": "admin@urbanlens.ai", "password_raw": "admin123", "role": "admin"},
        {"username": "government", "email": "authority@nairobi.go.ke", "password_raw": "govt123", "role": "government"},
        {"username": "ngo", "email": "planners@humanity.org", "password_raw": "ngo123", "role": "ngo"},
        {"username": "citizen", "email": "citizen@gmail.com", "password_raw": "citizen123", "role": "citizen"}
    ]
    
    for u in defaults:
        if not users_col.find_one({"username": u["username"]}):
            users_col.insert_one({
                "username": u["username"],
                "email": u["email"],
                "password_hash": hash_password(u["password_raw"]),
                "role": u["role"]
            })
            logger.info(f"Seeded default user: {u['username']} (role: {u['role']})")

@router.post("/register")
def register(req: RegisterRequest):
    db = get_db()
    users_col = db.get_collection("users")
    
    # Check if username or email exists
    if users_col.find_one({"username": req.username}):
        raise HTTPException(status_code=400, detail="Username already exists")
    if users_col.find_one({"email": req.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
        
    role = req.role.lower()
    if role not in ["admin", "government", "ngo", "citizen"]:
        raise HTTPException(status_code=400, detail="Invalid role. Must be 'admin', 'government', 'ngo', or 'citizen'")
        
    new_user = {
        "username": req.username,
        "email": req.email,
        "password_hash": hash_password(req.password),
        "role": role
    }
    
    users_col.insert_one(new_user)
    
    token = create_access_token({"sub": req.username, "role": role})
    return {
        "message": "User registered successfully",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "username": req.username,
            "email": req.email,
            "role": role
        }
    }

@router.post("/login")
def login(req: LoginRequest):
    seed_default_users()  # Ensure seeded users are ready
    db = get_db()
    users_col = db.get_collection("users")
    
    user = users_col.find_one({"username": req.username})
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
        
    token = create_access_token({"sub": user["username"], "role": user["role"]})
    return {
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "username": user["username"],
            "email": user["email"],
            "role": user["role"]
        }
    }
