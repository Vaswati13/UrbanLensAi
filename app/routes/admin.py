from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.database import get_db
from app.auth import require_role

router = APIRouter()

class ModerateReportRequest(BaseModel):
    report_id: str
    status: str  # "pending", "investigating", "resolved"

@router.get("/users")
def get_users(current_user = Depends(require_role(["admin"]))):
    """Retrieve all users in the system. Admin only."""
    db = get_db()
    users_col = db.get_collection("users")
    users = users_col.find()
    
    # Hide password hashes before returning
    for u in users:
        u.pop("password_hash", None)
    return users

@router.post("/reports/moderate")
def moderate_report(req: ModerateReportRequest, current_user = Depends(require_role(["admin", "government"]))):
    """Moderate a citizen report. Admin/Gov only."""
    db = get_db()
    reports_col = db.get_collection("reports")
    
    status_val = req.status.lower()
    if status_val not in ["pending", "investigating", "resolved"]:
        raise HTTPException(status_code=400, detail="Invalid status. Must be pending, investigating, or resolved")
        
    res = reports_col.update_one(
        {"_id": req.report_id},
        {"$set": {"status": status_val}}
    )
    
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Report not found")
        
    return {
        "message": f"Report status updated to '{status_val}'",
        "report_id": req.report_id,
        "status": status_val
    }
