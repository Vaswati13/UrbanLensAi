from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import Response, StreamingResponse
from pydantic import BaseModel
from app.database import get_db
from app.auth import get_current_user
import json
import io
from datetime import datetime

router = APIRouter()

class ReportRequest(BaseModel):
    reporter_name: str
    category: str  # "Water Problem", "Waste Management", "Drainage", "Healthcare", "Roads", "Street Lights"
    description: str
    latitude: float
    longitude: float
    photo_url: str = ""
    voice_url: str = ""

@router.post("/report-issue")
def report_issue(req: ReportRequest):
    db = get_db()
    reports_col = db.get_collection("reports")
    
    new_report = {
        "reporter_name": req.reporter_name,
        "category": req.category,
        "description": req.description,
        "coordinates": {
            "type": "Point",
            "coordinates": [req.longitude, req.latitude]
        },
        "photo_url": req.photo_url,
        "voice_url": req.voice_url,
        "status": "pending",
        "created_at": datetime.utcnow().isoformat() + "Z"
    }
    
    res = reports_col.insert_one(new_report)
    new_report["_id"] = str(res.inserted_id)
    return {
        "message": "Citizen report submitted successfully",
        "report": new_report
    }

@router.get("/list")
def list_reports():
    db = get_db()
    reports_col = db.get_collection("reports")
    return reports_col.find()

@router.get("/export-geojson")
def export_geojson(settlement_id: str = "kibera_001"):
    db = get_db()
    settlements_col = db.get_collection("settlements")
    settlement = settlements_col.find_one({"_id": settlement_id})
    if not settlement:
        raise HTTPException(status_code=404, detail="Settlement not found")
        
    infra_col = db.get_collection("infrastructure")
    infrastructure = infra_col.find({"settlement_id": settlement_id})
    
    # Pack into standard GeoJSON FeatureCollection
    features = []
    
    # 1. Settlement boundary feature
    features.append({
        "type": "Feature",
        "geometry": settlement["boundary"],
        "properties": {
            "name": settlement["name"],
            "type": "settlement_boundary",
            "population": settlement["population"],
            "area_sqkm": settlement["area_sqkm"],
            "flood_risk": settlement["risk_indices"]["flood"]
        }
    })
    
    # 2. Add infrastructure features
    for inf in infrastructure:
        features.append({
            "type": "Feature",
            "geometry": inf["coordinates"],
            "properties": {
                "name": inf["name"],
                "type": inf["type"],
                "status": inf["status"],
                "id": str(inf["_id"])
            }
        })
        
    geojson_data = {
        "type": "FeatureCollection",
        "features": features
    }
    
    # Return as download response
    headers = {
        "Content-Disposition": f"attachment; filename={settlement_id}_gis_export.geojson"
    }
    return Response(
        content=json.dumps(geojson_data, indent=2),
        media_type="application/json",
        headers=headers
    )

def generate_pure_pdf(title: str, text_lines: list) -> bytes:
    """Generates a standard-compliant minimal binary PDF (1.4) in pure Python."""
    # Escape parentheses for PDF text fields
    def escape_pdf(text):
        return text.replace("(", "\\(").replace(")", "\\)")
        
    # PDF catalog and page nodes
    pdf_objects = []
    
    # Object 1: Catalog
    pdf_objects.append("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n")
    # Object 2: Pages list
    pdf_objects.append("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n")
    # Object 3: Page properties
    pdf_objects.append("3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 595 842] /Contents 5 0 R >>\nendobj\n")
    # Object 4: Font
    pdf_objects.append("4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n")
    
    # Object 5: Content stream (Draw Title and line items)
    stream_content = f"BT\n/F1 20 Tf\n50 780 Td\n({escape_pdf(title)}) Tj\n"
    stream_content += "1.2 TL\n/F1 10 Tf\n0 -40 Td\n(Generated on: " + datetime.now().strftime("%Y-%m-%d %H:%M:%S") + ") Tj\n"
    stream_content += "0 -30 Td\n(==============================================================) Tj\n"
    
    for line in text_lines:
        stream_content += f"0 -20 Td\n({escape_pdf(line)}) Tj\n"
        
    stream_content += "ET\n"
    stream_len = len(stream_content)
    
    pdf_objects.append(f"5 0 obj\n<< /Length {stream_len} >>\nstream\n{stream_content}endstream\nendobj\n")
    
    # Calculate byte offsets for the Cross-Reference table (xref)
    # The header is 9 bytes: '%PDF-1.4\n'
    offsets = [9]
    current_offset = 9
    for i in range(len(pdf_objects) - 1):
        current_offset += len(pdf_objects[i])
        offsets.append(current_offset)
        
    xref_offset = current_offset + len(pdf_objects[-1])
    
    # Build the PDF file structure
    pdf_bytes = bytearray()
    pdf_bytes.extend(b"%PDF-1.4\n")
    for obj in pdf_objects:
        pdf_bytes.extend(obj.encode('latin1'))
        
    # Cross reference table
    xref_table = f"xref\n0 {len(pdf_objects) + 1}\n0000000000 65535 f \n"
    for offset in offsets:
        xref_table += f"{offset:010d} 00000 n \n"
        
    pdf_bytes.extend(xref_table.encode('latin1'))
    
    # Trailer
    trailer = f"trailer\n<< /Size {len(pdf_objects) + 1} /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n"
    pdf_bytes.extend(trailer.encode('latin1'))
    
    return bytes(pdf_bytes)

@router.get("/export-pdf")
def export_pdf(settlement_id: str = "kibera_001"):
    db = get_db()
    settlements_col = db.get_collection("settlements")
    settlement = settlements_col.find_one({"_id": settlement_id})
    if not settlement:
        raise HTTPException(status_code=404, detail="Settlement not found")
        
    infra_col = db.get_collection("infrastructure")
    infrastructure = infra_col.find({"settlement_id": settlement_id})
    
    reports_col = db.get_collection("reports")
    reports_count = reports_col.count_documents({})
    
    recs_col = db.get_collection("recommendations")
    recs = recs_col.find({"settlement_id": settlement_id})
    
    # Prepare lines for PDF
    pdf_lines = [
        f"Settlement Name: {settlement['name']}",
        f"District Location: {settlement['district']}",
        f"Estimated Population: {settlement['population']} residents",
        f"Settlement Area: {settlement['area_sqkm']} sq. km.",
        "",
        "AI ENVIRONMENTAL RISK FORECASTS (INDEX 0-100):",
        f"  - Flooding Vulnerability: {settlement['risk_indices']['flood']}/100",
        f"  - Water Scarcity Index: {settlement['risk_indices']['water_scarcity']}/100",
        f"  - Future Growth Risk: {settlement['risk_indices']['population_growth']}/100",
        "",
        "INFRASTRUCTURE FACILITY ANALYSIS:",
        f"  - Total Mapped Facilities: {len(infrastructure)}",
        f"  - Active Citizen Reports: {reports_count} reports",
        "",
        "AI GEO-OPTIMIZED FACILITY RECOMMENDATIONS:"
    ]
    
    for idx, rec in enumerate(recs):
        status_str = "Approved" if rec.get("approved") else "Pending Approval"
        pdf_lines.append(f"  {idx+1}. Recommended {rec['facility_type'].replace('_', ' ').capitalize()}")
        pdf_lines.append(f"     Confidence: {rec['confidence_score']}% | Status: {status_str}")
        pdf_lines.append(f"     Rationale: {rec['rationale'][:60]}...")
        
    pdf_content = generate_pure_pdf(
        title=f"URBANLENS AI - INFRASTRUCTURE & GAP SUMMARY REPORT",
        text_lines=pdf_lines
    )
    
    headers = {
        "Content-Disposition": f"attachment; filename={settlement_id}_summary_report.pdf"
    }
    return Response(
        content=pdf_content,
        media_type="application/pdf",
        headers=headers
    )
