from fastapi import APIRouter, HTTPException
from app.database import get_db
import math

router = APIRouter()

@router.get("/settlements")
def list_settlements():
    db = get_db()
    return db.get_collection("settlements").find()

@router.get("/infrastructure")
def list_infrastructure(settlement_id: str = None):
    db = get_db()
    col = db.get_collection("infrastructure")
    if settlement_id:
        return col.find({"settlement_id": settlement_id})
    return col.find()

def haversine_distance(coord1, coord2):
    """Calculate Great Circle distance between two points in meters"""
    lon1, lat1 = coord1
    lon2, lat2 = coord2
    
    R = 6371000  # Radius of earth in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = math.sin(delta_phi/2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

@router.get("/gap-analysis")
def gap_analysis(settlement_id: str = "kibera_001"):
    db = get_db()
    
    settlements_col = db.get_collection("settlements")
    settlement = settlements_col.find_one({"_id": settlement_id})
    if not settlement:
        raise HTTPException(status_code=404, detail="Settlement not found")
        
    infra_col = db.get_collection("infrastructure")
    facilities = infra_col.find({"settlement_id": settlement_id})
    
    # Group infrastructure by type
    water_points = [f["coordinates"]["coordinates"] for f in facilities if f["type"] == "water_point" and f["status"] == "functional"]
    health_points = [f["coordinates"]["coordinates"] for f in facilities if f["type"] == "healthcare" and f["status"] == "functional"]
    school_points = [f["coordinates"]["coordinates"] for f in facilities if f["type"] == "school" and f["status"] == "functional"]
    drains = [f for f in facilities if f["type"] == "drainage"]
    street_lights = [f["coordinates"]["coordinates"] for f in facilities if f["type"] == "street_light" and f["status"] == "functional"]
    
    # 1. Generate Heatmap Grid points (representing sub-sectors of the settlement)
    # We will interpolate points inside the boundary of the settlement
    center_lon, center_lat = settlement.get("center", [36.788, -1.313])
    
    heatmap_points = []
    # Grid offset around center: generate a grid
    grid_size = 9 # 9x9 grid
    min_dist_water_total = 0
    min_dist_health_total = 0
    
    critical_spots = 0
    medium_spots = 0
    good_spots = 0
    
    for idx_x in range(grid_size):
        for idx_y in range(grid_size):
            # Calculate grid coordinate offset (roughly 600m radius total)
            offset_lon = (idx_x - (grid_size // 2)) * 0.003
            offset_lat = (idx_y - (grid_size // 2)) * 0.002
            
            pt = [center_lon + offset_lon, center_lat + offset_lat]
            
            # Distance to nearest water, health, light
            dist_w = min([haversine_distance(pt, w) for w in water_points]) if water_points else 1000
            dist_h = min([haversine_distance(pt, h) for h in health_points]) if health_points else 2000
            dist_l = min([haversine_distance(pt, l) for l in street_lights]) if street_lights else 800
            
            min_dist_water_total += dist_w
            min_dist_health_total += dist_h
            
            # Severity mapping: Red (2) = Critical, Yellow (1) = Medium, Green (0) = Good
            # Water gap > 200m or Healthcare gap > 800m or lights > 300m
            if dist_w > 300 or dist_h > 1000 or dist_l > 400:
                severity = 2  # Red
                intensity = round(max(0.6, min(1.0, (dist_w / 600.0))), 2)
                critical_spots += 1
            elif dist_w > 150 or dist_h > 500 or dist_l > 200:
                severity = 1  # Yellow
                intensity = round(max(0.3, min(0.6, (dist_w / 350.0))), 2)
                medium_spots += 1
            else:
                severity = 0  # Green
                intensity = 0.2
                good_spots += 1
                
            heatmap_points.append({
                "coordinates": pt,
                "severity": severity,  # 0, 1, 2
                "intensity": intensity,
                "distance_to_water_meters": int(dist_w),
                "distance_to_health_meters": int(dist_h)
            })
            
    num_spots = len(heatmap_points)
    avg_water_dist = int(min_dist_water_total / num_spots) if num_spots > 0 else 0
    avg_health_dist = int(min_dist_health_total / num_spots) if num_spots > 0 else 0
    
    # Calculate Gaps
    sanitation_critical_count = sum(1 for d in drains if d["status"] == "critical")
    damaged_roads_count = sum(1 for f in facilities if f["type"] == "road" and f["status"] == "damaged")
    
    return {
        "settlement_name": settlement["name"],
        "total_analyzed_sectors": num_spots,
        "critical_sectors_count": critical_spots,
        "medium_sectors_count": medium_spots,
        "good_sectors_count": good_spots,
        "averages": {
            "water_access_distance_meters": avg_water_dist,
            "healthcare_access_distance_meters": avg_health_dist
        },
        "gaps_summary": {
            "water_deficit_level": "High" if avg_water_dist > 150 else "Medium",
            "healthcare_deficit_level": "Severe" if avg_health_dist > 1000 else "Moderate",
            "sanitation_gaps": f"{sanitation_critical_count} open drainage channels clogged",
            "road_gaps": f"{damaged_roads_count} primary access roads require paving"
        },
        "heatmap": heatmap_points
    }
