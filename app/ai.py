import random
import time
from typing import Dict, Any, List

# Try imports, fallback to math-based modeling if missing
try:
    import cv2
    import numpy as np
    OPENCV_AVAILABLE = True
except ImportError:
    OPENCV_AVAILABLE = False

try:
    from sklearn.linear_model import LinearRegression
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

def run_satellite_detection(image_bytes: bytes) -> Dict[str, Any]:
    """
    Simulates a YOLOv8 satellite object detection model.
    It returns list of detected features (buildings, roads, open drains) with confidence scores,
    and coordinates (relative x, y, width, height) to render bounding box overlays.
    """
    # Simulate processing delay
    time.sleep(1.5)
    
    # Simple simulated detections
    detections = []
    categories = [
        {"name": "Building (Settlement)", "color": "#0EA5E9", "prefix": "bldg"},
        {"name": "Road Path", "color": "#22C55E", "prefix": "road"},
        {"name": "Open Drain", "color": "#EF4444", "prefix": "drain"},
        {"name": "Water Body", "color": "#3B82F6", "prefix": "water"}
    ]
    
    # Generate 15-25 random realistic bounding boxes
    random.seed(len(image_bytes))  # Seed with file size for deterministic dummy output per image
    num_detections = random.randint(15, 25)
    
    for i in range(num_detections):
        cat = random.choice(categories)
        confidence = round(random.uniform(0.65, 0.98), 2)
        
        # Bounding box coordinates in percentage of image width/height (0-100)
        w = random.randint(8, 20)
        h = random.randint(8, 20)
        x = random.randint(5, 95 - w)
        y = random.randint(5, 95 - h)
        
        # Adjust aspect ratios for roads/drains (longer and thinner)
        if "Road" in cat["name"] or "Drain" in cat["name"]:
            if random.choice([True, False]):
                w = random.randint(25, 45)
                h = random.randint(3, 7)
            else:
                w = random.randint(3, 7)
                h = random.randint(25, 45)
        
        detections.append({
            "id": f"{cat['prefix']}_{i}",
            "label": cat["name"],
            "confidence": confidence,
            "color": cat["color"],
            "bbox": {
                "x": x,
                "y": y,
                "w": w,
                "h": h
            }
        })
        
    # Summaries
    bldg_count = sum(1 for d in detections if "Building" in d["label"])
    road_count = sum(1 for d in detections if "Road" in d["label"])
    drain_count = sum(1 for d in detections if "Drain" in d["label"])
    water_count = sum(1 for d in detections if "Water" in d["label"])
    
    return {
        "success": True,
        "metrics": {
            "buildings_detected": bldg_count,
            "road_segments_detected": road_count,
            "open_drains_detected": drain_count,
            "water_bodies_detected": water_count,
            "estimated_density": "High (Informal Grid)",
            "risk_index": int(bldg_count * 3.5 + drain_count * 10)
        },
        "detections": detections
    }

def fit_least_squares(x: List[float], y: List[float]) -> tuple:
    """Fallback standard mathematical linear regression (least squares)"""
    n = len(x)
    if n == 0:
        return 0, 0
    mean_x = sum(x) / n
    mean_y = sum(y) / n
    
    num = sum((x[i] - mean_x) * (y[i] - mean_y) for i in range(n))
    den = sum((x[i] - mean_x) ** 2 for i in range(n))
    
    slope = num / den if den != 0 else 0
    intercept = mean_y - slope * mean_x
    return slope, intercept

def predict_future_trends(historical_data: Dict[str, Any], target_year: int = 2030) -> Dict[str, Any]:
    """
    Predicts environmental risks and population using scikit-learn or custom least squares.
    """
    years = [int(y) for y in historical_data.get("years", [])]
    flood_risk = historical_data.get("flood_risk", [])
    water_scarcity = historical_data.get("water_scarcity", [])
    population = historical_data.get("population", [])
    
    future_years = list(range(years[-1] + 1, target_year + 1))
    all_years = years + future_years
    
    # Predict Flooding Risk
    if SKLEARN_AVAILABLE and len(years) > 1:
        # Sklearn implementation
        X = np.array(years).reshape(-1, 1)
        
        # Flooding
        model_flood = LinearRegression().fit(X, np.array(flood_risk))
        future_flood = model_flood.predict(np.array(future_years).reshape(-1, 1)).tolist()
        
        # Scarcity
        model_water = LinearRegression().fit(X, np.array(water_scarcity))
        future_water = model_water.predict(np.array(future_years).reshape(-1, 1)).tolist()
        
        # Population
        model_pop = LinearRegression().fit(X, np.array(population))
        future_pop = model_pop.predict(np.array(future_years).reshape(-1, 1)).tolist()
    else:
        # Fallback implementation
        slope_f, int_f = fit_least_squares(years, flood_risk)
        future_flood = [slope_f * y + int_f for y in future_years]
        
        slope_w, int_w = fit_least_squares(years, water_scarcity)
        future_water = [slope_w * y + int_w for y in future_years]
        
        slope_p, int_p = fit_least_squares(years, population)
        future_pop = [slope_p * y + int_p for y in future_years]
        
    # Clamp scores to 0-100, pop to > 0
    future_flood = [min(100, max(0, int(val))) for val in future_flood]
    future_water = [min(100, max(0, int(val))) for val in future_water]
    future_pop = [max(1000, int(val)) for val in future_pop]
    
    return {
        "timeline": [str(y) for y in all_years],
        "flood_risk": flood_risk + future_flood,
        "water_scarcity": water_scarcity + future_water,
        "population": population + future_pop,
        "forecast": {
            "year": target_year,
            "flood_risk": future_flood[-1],
            "water_scarcity": future_water[-1],
            "population": future_pop[-1],
            "risk_level": "High" if future_flood[-1] > 75 or future_water[-1] > 75 else "Medium"
        }
    }
