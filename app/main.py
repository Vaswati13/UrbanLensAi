from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import get_db
from app.mock_data import MOCK_SETTLEMENTS, MOCK_INFRASTRUCTURE, MOCK_REPORTS, MOCK_RECOMMENDATIONS
import logging

logger = logging.getLogger("urbanlens.main")

app = FastAPI(
    title="UrbanLens AI API",
    description="Geospatial AI & Infrastructure Mapping API for Informal Settlements",
    version="1.0.0"
)

# CORS configuration to allow React frontend (typically running on localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For demo purposes, allow all. In production, lock this down.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup Database Seeding
@app.on_event("startup")
async def startup_db_client():
    logger.info("Starting up UrbanLens AI API...")
    db = get_db()
    
    # Seed Settlements
    settlements_col = db.get_collection("settlements")
    if settlements_col.count_documents() == 0:
        logger.info("Seeding settlements data...")
        for s in MOCK_SETTLEMENTS:
            settlements_col.insert_one(s)
            
    # Seed Infrastructure
    infra_col = db.get_collection("infrastructure")
    if infra_col.count_documents() == 0:
        logger.info("Seeding infrastructure data...")
        for inf in MOCK_INFRASTRUCTURE:
            infra_col.insert_one(inf)
            
    # Seed Citizen Reports
    reports_col = db.get_collection("reports")
    if reports_col.count_documents() == 0:
        logger.info("Seeding citizen reports data...")
        for r in MOCK_REPORTS:
            reports_col.insert_one(r)
            
    # Seed Recommendations
    recs_col = db.get_collection("recommendations")
    if recs_col.count_documents() == 0:
        logger.info("Seeding facility recommendations...")
        for rec in MOCK_RECOMMENDATIONS:
            recs_col.insert_one(rec)
            
    logger.info("Database seeding checked/completed.")

# Root health check endpoint
@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "UrbanLens AI API",
        "version": "1.0.0",
        "environment": "Development/Hackathon-Ready"
    }

# Import and Register Routers (implemented next)
from app.routes.auth import router as auth_router
from app.routes.stats import router as stats_router
from app.routes.analysis import router as analysis_router
from app.routes.gaps import router as gaps_router
from app.routes.predictions import router as predictions_router
from app.routes.recommendations import router as recommendations_router
from app.routes.reports import router as reports_router
from app.routes.admin import router as admin_router

app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(stats_router, prefix="/api/stats", tags=["Dashboard Stats"])
app.include_router(analysis_router, prefix="/api/analysis", tags=["Satellite Analysis"])
app.include_router(gaps_router, prefix="/api/gaps", tags=["Infrastructure Gap Analysis"])
app.include_router(predictions_router, prefix="/api/predictions", tags=["Predictive Analytics"])
app.include_router(recommendations_router, prefix="/api/recommendations", tags=["Recommendation Engine"])
app.include_router(reports_router, prefix="/api/reports", tags=["Citizen Reporting & Exports"])
app.include_router(admin_router, prefix="/api/admin", tags=["Admin Panel Operations"])
