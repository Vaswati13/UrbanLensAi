from fastapi import APIRouter, UploadFile, File, HTTPException
from app.config import config
from app.ai import run_satellite_detection
import os
import uuid

router = APIRouter()

@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    """Receives satellite image upload and saves it to a local temporary folder."""
    # Ensure file is an image
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image")
        
    try:
        # Generate unique filename to avoid collision
        ext = os.path.splitext(file.filename)[1]
        filename = f"{uuid.uuid4()}{ext}"
        filepath = os.path.join(config.UPLOAD_DIR, filename)
        
        # Write to disk
        contents = await file.read()
        with open(filepath, "wb") as f:
            f.write(contents)
            
        return {
            "message": "Satellite image uploaded successfully",
            "filename": filename,
            "filepath": f"/uploads/{filename}",
            "size_bytes": len(contents)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")

@router.post("/detect-settlement")
def detect_settlement(filename: str):
    """
    Takes an uploaded image filename and runs the AI detection pipeline (YOLO/OpenCV).
    Returns bounding box coordinates and object counts.
    """
    filepath = os.path.join(config.UPLOAD_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Uploaded image not found")
        
    try:
        with open(filepath, "rb") as f:
            image_bytes = f.read()
            
        # Run detection pipeline
        detection_result = run_satellite_detection(image_bytes)
        detection_result["filename"] = filename
        
        return detection_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Feature detection failed: {str(e)}")
