from fastapi import APIRouter
from app.database import get_db

router = APIRouter()

@router.get("/dashboard-stats")
def get_dashboard_stats():
    db = get_db()
    
    # 1. Total Settlements
    settlements_col = db.get_collection("settlements")
    settlements = settlements_col.find()
    total_settlements = len(settlements)
    
    # 2. Population Covered
    population_covered = sum(s.get("population", 0) for s in settlements)
    
    # 3. High Risk Zones
    # Define high risk as flood risk or scarcity index > 70
    high_risk_zones = sum(
        1 for s in settlements 
        if s.get("risk_indices", {}).get("flood", 0) > 70 
        or s.get("risk_indices", {}).get("water_scarcity", 0) > 70
    )
    
    # 4. Active Citizen Reports
    reports_col = db.get_collection("reports")
    active_reports = reports_col.count_documents({"status": {"$in": ["pending", "investigating"]}})
    
    # 5. Infrastructure Gaps
    # Count of damaged or critical infrastructure items in our mock database
    infra_col = db.get_collection("infrastructure")
    gaps_count = infra_col.count_documents({"status": {"$in": ["damaged", "critical"]}})
    
    return {
        "total_settlements": total_settlements,
        "population_covered": population_covered,
        "high_risk_zones": high_risk_zones,
        "active_citizen_reports": active_reports,
        "infrastructure_gaps": gaps_count,
        "recent_activity": [
            {"id": 1, "type": "report", "text": "New citizen report: Water leakage in Soweto East", "time": "10 mins ago"},
            {"id": 2, "type": "detection", "text": "Satellite analysis detected 42 new structures in Mathare", "time": "2 hours ago"},
            {"id": 3, "type": "recommendation", "text": "AI proposed new water tank placement in Kibera", "time": "5 hours ago"}
        ]
    }
