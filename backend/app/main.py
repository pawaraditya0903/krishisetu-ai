import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.models.entities import Crop, CropVariety
from sqlalchemy import text
from app.api.v1.router import api_router

# Create database tables automatically on startup
Base.metadata.create_all(bind=engine)

def auto_migrate_schema():
    with engine.connect() as conn:
        try:
            res = conn.execute(text("PRAGMA table_info(crop_lots)"))
            existing_cols = {row[1] for row in res.fetchall()}
            needed_cols = [
                ("crop_id", "VARCHAR(36)"),
                ("unit", "VARCHAR(20) DEFAULT 'kg'"),
                ("harvest_date", "VARCHAR(30)"),
                ("packaging_type", "VARCHAR(100)"),
                ("location_id", "VARCHAR(100)"),
                ("location_name", "VARCHAR(255)"),
                ("notes", "TEXT"),
                ("product_status", "VARCHAR(50) DEFAULT 'DRAFT'"),
                ("marketplace_visibility", "VARCHAR(30) DEFAULT 'PRIVATE'"),
                ("cover_image_id", "VARCHAR(36)"),
                ("cover_image_url", "VARCHAR(255)"),
                ("ai_grade", "VARCHAR(20)"),
                ("ai_quality_score", "FLOAT"),
                ("ai_confidence", "VARCHAR(20)"),
                ("fpo_verified_grade", "VARCHAR(20)"),
                ("asking_price_paise", "INTEGER"),
                ("buyer_id", "VARCHAR(36)"),
                ("archived_at", "DATETIME"),
                ("deleted_at", "DATETIME"),
            ]
            for col_name, col_type in needed_cols:
                if col_name not in existing_cols:
                    conn.execute(text(f"ALTER TABLE crop_lots ADD COLUMN {col_name} {col_type}"))
            conn.commit()
        except Exception:
            pass

auto_migrate_schema()

# Ensure upload directory exists
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
PRODUCTS_UPLOAD_DIR = os.path.join(UPLOAD_DIR, "products")
os.makedirs(PRODUCTS_UPLOAD_DIR, exist_ok=True)

# Also ensure frontend public/uploads directory exists if accessible
FRONTEND_UPLOADS_DIR = os.path.join(BASE_DIR, "..", "krishisetu-ai", "public", "uploads", "products")
try:
    os.makedirs(FRONTEND_UPLOADS_DIR, exist_ok=True)
except Exception:
    pass

DEFAULT_CROPS = [
    {
        "id": "CROP-TOM",
        "name": "Tomato",
        "marathi_name": "टोमॅटो",
        "hindi_name": "टमाटर",
        "category": "Vegetable",
        "icon": "🍅",
        "unit": "kg",
        "perishability": "High (4-7 days)",
        "storage_recommendation": "Ventilated crates at 12-15°C; avoid direct sunlight during transport.",
        "default_batch_size_kg": 500.0,
        "supported_quality_params": ["Size Uniformity (55-65mm)", "Ripeness Index (Breaker/Pink)", "Surface Defects < 5%", "Color Uniformity > 90%"],
        "varieties": ["Abhinav (Hybrid)", "Vaibhav", "Saaho", "Rupali", "Local Desi"]
    },
    {
        "id": "CROP-ONI",
        "name": "Onion",
        "marathi_name": "कांदा",
        "hindi_name": "प्याज़",
        "category": "Vegetable",
        "icon": "🧅",
        "unit": "kg",
        "perishability": "Medium (1-3 weeks)",
        "storage_recommendation": "Dry aerated chawl; moisture level < 65%. Avoid damp heaps.",
        "default_batch_size_kg": 1000.0,
        "supported_quality_params": ["Bulb Diameter (45-60mm)", "Neck Dryness", "Skin Tunic Retention", "Sprouting Absence"],
        "varieties": ["Unhali Red Garva", "Pol (Kharif Red)", "Rangada", "White Onion"]
    },
    {
        "id": "CROP-POT",
        "name": "Potato",
        "marathi_name": "बटाटा",
        "hindi_name": "आलू",
        "category": "Vegetable",
        "icon": "🥔",
        "unit": "kg",
        "perishability": "Medium (1-3 weeks)",
        "storage_recommendation": "Cool dark storage at 8-10°C; shield from light to prevent solanine greening.",
        "default_batch_size_kg": 1000.0,
        "supported_quality_params": ["Tuber Size (40-55mm)", "Skin Maturity", "Absence of Greening", "Surface Soil < 2%"],
        "varieties": ["Kufri Jyoti", "Kufri Pukhraj", "Kufri Bahar", "Kufri Lauvkar"]
    },
    {
        "id": "CROP-MAN",
        "name": "Mango",
        "marathi_name": "आंबा",
        "hindi_name": "आम",
        "category": "Fruit",
        "icon": "🥭",
        "unit": "crates",
        "perishability": "Very High (1-3 days)",
        "storage_recommendation": "CFB corrugated boxes with hay/cushioning; ethylene ripening room at 18-22°C.",
        "default_batch_size_kg": 300.0,
        "supported_quality_params": ["Fruit Weight (200-300g)", "Brix Sugar > 16%", "Skin Blemish < 3%", "Shoulder Roundness"],
        "varieties": ["Alphonso (Hapus)", "Kesar", "Dasheri", "Langra", "Banganapalli"]
    },
    {
        "id": "CROP-GRP",
        "name": "Grapes",
        "marathi_name": "द्राक्षे",
        "hindi_name": "अंगूर",
        "category": "Fruit",
        "icon": "🍇",
        "unit": "kg",
        "perishability": "Very High (1-3 days)",
        "storage_recommendation": "Pre-cool within 4 hours to 0-1°C with SO2 dual-release sheets.",
        "default_batch_size_kg": 1000.0,
        "supported_quality_params": ["Berry Caliber (18-20mm)", "Brix TSS > 17.5%", "Bloom Retention", "Zero Berry Crack"],
        "varieties": ["Thompson Seedless Export", "Sonaka", "Manik Chaman", "Sharad Seedless Black"]
    },
    {
        "id": "CROP-SOY",
        "name": "Soybean",
        "marathi_name": "सोयाबीन",
        "hindi_name": "सोयाबीन",
        "category": "Grain",
        "icon": "🌱",
        "unit": "quintal",
        "perishability": "Low (Months)",
        "storage_recommendation": "Fumigated dry godown on wooden pallets; grain moisture <= 10%.",
        "default_batch_size_kg": 2000.0,
        "supported_quality_params": ["Seed Moisture < 11%", "Oil Content > 18.5%", "Split Seed < 2%", "Foreign Matter < 1%"],
        "varieties": ["JS 335", "JS 9305", "MACS 1407", "Phule Kalyani (DS-228)"]
    },
    {
        "id": "CROP-COT",
        "name": "Cotton",
        "marathi_name": "कापूस",
        "hindi_name": "कपास",
        "category": "Cash Crop",
        "icon": "☁️",
        "unit": "quintal",
        "perishability": "Low (Months)",
        "storage_recommendation": "Clean covered bale shed; fire protection systems mandatory; moisture < 8%.",
        "default_batch_size_kg": 2000.0,
        "supported_quality_params": ["Staple Length (29-31mm)", "Trash Content < 3%", "Micronaire (3.8-4.2)", "Lint Whiteness"],
        "varieties": ["Bt Cotton Hybrid", "DCH-32", "Bunny Bt", "Ajeet 155"]
    },
    {
        "id": "CROP-WHE",
        "name": "Wheat",
        "marathi_name": "गहू",
        "hindi_name": "गेहूं",
        "category": "Grain",
        "icon": "🌾",
        "unit": "quintal",
        "perishability": "Low (Months)",
        "storage_recommendation": "Silo or aerated godown at < 12% moisture; hermetic bag storage recommended.",
        "default_batch_size_kg": 2000.0,
        "supported_quality_params": ["Grain Boldness", "Moisture < 11.5%", "Gluten Strength", "Foreign Matter < 0.5%"],
        "varieties": ["Lokwan 148", "Sharbati", "Kalyan Sona", "GW 496"]
    },
    {
        "id": "CROP-RIC",
        "name": "Rice",
        "marathi_name": "तांदूळ",
        "hindi_name": "चावल",
        "category": "Grain",
        "icon": "🍚",
        "unit": "quintal",
        "perishability": "Low (Months)",
        "storage_recommendation": "Paddy or milled grain storage; maintain < 13% moisture with rodent barriers.",
        "default_batch_size_kg": 2000.0,
        "supported_quality_params": ["Grain Length > 6.5mm", "Broken Grain < 5%", "Moisture < 12.5%", "Chalkiness < 3%"],
        "varieties": ["Basmati 1121", "Indrayani", "Wada Kolam", "Sona Masoori", "Ambemohar"]
    },
    {
        "id": "CROP-POM",
        "name": "Pomegranate",
        "marathi_name": "डाळिंब",
        "hindi_name": "अनार",
        "category": "Fruit",
        "icon": "🍎",
        "unit": "kg",
        "perishability": "Medium (1-3 weeks)",
        "storage_recommendation": "Cold room at 5-7°C and 90-95% RH; individual fruit foam sleeves.",
        "default_batch_size_kg": 800.0,
        "supported_quality_params": ["Fruit Caliber (75-85mm)", "Ruby Red Aril Density", "Thrips Blemish < 1%", "Crown Intactness"],
        "varieties": ["Bhagwa Export Grade", "Arakta", "Ganesh Super"]
    },
    {
        "id": "CROP-BAN",
        "name": "Banana",
        "marathi_name": "केळी",
        "hindi_name": "केला",
        "category": "Fruit",
        "icon": "🍌",
        "unit": "crates",
        "perishability": "High (4-7 days)",
        "storage_recommendation": "Controlled ripening chamber at 14-16°C; avoid temperatures below 12°C (chilling injury).",
        "default_batch_size_kg": 2500.0,
        "supported_quality_params": ["Finger Caliber (38-42 grade)", "Finger Length > 18cm", "Clean Green Stage 2", "Zero Latex Stains"],
        "varieties": ["Grand Naine (G-9)", "Robusta", "Basrai", "Shrimanti"]
    }
]

def seed_default_crops():
    db = SessionLocal()
    try:
        if db.query(Crop).count() == 0:
            for c_data in DEFAULT_CROPS:
                crop = Crop(
                    id=c_data["id"],
                    name=c_data["name"],
                    marathi_name=c_data["marathi_name"],
                    hindi_name=c_data["hindi_name"],
                    category=c_data["category"],
                    icon=c_data["icon"],
                    unit=c_data["unit"],
                    perishability=c_data["perishability"],
                    storage_recommendation=c_data["storage_recommendation"],
                    default_batch_size_kg=c_data["default_batch_size_kg"],
                    supported_quality_params=c_data["supported_quality_params"],
                    status="Active"
                )
                db.add(crop)
                db.flush()
                for v_name in c_data["varieties"]:
                    variety = CropVariety(
                        crop_id=crop.id,
                        name=v_name
                    )
                    db.add(variety)
            db.commit()
    except Exception as e:
        db.rollback()
    finally:
        db.close()

seed_default_crops()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="KrishiSetu AI: Offline-First FPO-Assisted Farmer Market-Linkage & Price-Discovery Platform for India (SIH 2026)",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads static directory
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "message": "Welcome to KrishiSetu AI Backend API",
        "docs_url": "/docs",
        "pilot_crop": settings.PILOT_CROP,
        "pilot_geography": f"{settings.PILOT_TEHSIL}, {settings.PILOT_DISTRICT}, {settings.PILOT_STATE}"
    }

