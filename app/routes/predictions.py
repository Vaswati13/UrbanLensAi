from fastapi import APIRouter, HTTPException
from app.database import get_db
from app.ai import predict_future_trends
from app.mock_data import MOCK_ANALYTICS

router = APIRouter()

@router.get("/predict-risk")
def predict_risk(settlement_id: str = "kibera_001", target_year: int = 2030):
    db = get_db()
    settlements_col = db.get_collection("settlements")
    settlement = settlements_col.find_one({"_id": settlement_id})
    if not settlement:
        raise HTTPException(status_code=404, detail="Settlement not found")
        
    # Find historical trends (stored in analytics collection or fallback defaults)
    # Default fallback data if not found in db
    historical = MOCK_ANALYTICS.get(settlement_id, {
        "flood_trend": {
            "years": ["2021", "2022", "2023", "2024", "2025", "2026"],
            "risk_scores": [50, 55, 58, 62, 69, 75]
        },
        "water_trend": {
            "years": ["2021", "2022", "2023", "2024", "2025", "2026"],
            "scarcity_scores": [85, 82, 80, 78, 77, 72]
        },
        "population_trend": {
            "years": ["2021", "2022", "2023", "2024", "2025", "2026"],
            "growth": [210000, 218000, 225000, 233000, 242000, 250000]
        }
    })
    
    # Structure input for predictive model
    input_data = {
        "years": [int(y) for y in historical["flood_trend"]["years"]],
        "flood_risk": historical["flood_trend"]["risk_scores"],
        "water_scarcity": historical["water_trend"]["scarcity_scores"],
        "population": historical["population_trend"]["growth"]
    }
    
    # Run predictions
    try:
        prediction_result = predict_future_trends(input_data, target_year=target_year)
        prediction_result["settlement_name"] = settlement["name"]
        return prediction_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk forecasting failed: {str(e)}")
