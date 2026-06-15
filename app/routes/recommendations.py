from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.database import get_db
from app.auth import require_role

router = APIRouter()

class ApproveRequest(BaseModel):
    recommendation_id: str
    approved: bool

@router.get("/list")
def list_recommendations(settlement_id: str = "kibera_001"):
    db = get_db()
    recs_col = db.get_collection("recommendations")
    recs = recs_col.find({"settlement_id": settlement_id})
    return recs

@router.post("/approve")
def approve_recommendation(req: ApproveRequest, current_user = Depends(require_role(["admin", "government"]))):
    db = get_db()
    recs_col = db.get_collection("recommendations")
    
    # Update recommendation
    res = recs_col.update_one(
        {"_id": req.recommendation_id},
        {"$set": {"approved": req.approved}}
    )
    
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Recommendation not found")
        
    return {
        "message": f"Recommendation successfully {'approved' if req.approved else 'declined'}",
        "recommendation_id": req.recommendation_id,
        "approved": req.approved
    }
