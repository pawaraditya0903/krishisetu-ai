from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "KrishiSetu AI Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = "krishisetu_sec_jwt_vault_sih2026_pilot_prod"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours (hardened from 7 days)
    MAX_UPLOAD_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB limit
    TEST_MODE: bool = False

    # Databases
    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/krishisetu"
    SQLITE_FALLBACK_URL: str = "sqlite:///./krishisetu_local.db"
    USE_SQLITE_FALLBACK: bool = True
    
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # CORS - Explicit origins only (RFC 6454 compliant when allow_credentials=True)
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "https://krishisetu-ai-mu.vercel.app"
    ]
    
    # Pilot Defaults
    PILOT_CROP: str = "Tomato"
    PILOT_DISTRICT: str = "Pune"
    PILOT_TEHSIL: str = "Baramati"
    PILOT_STATE: str = "Maharashtra"
    
    # Model Quality Thresholds
    MIN_LAPLACIAN_VARIANCE: float = 100.0
    MIN_BRIGHTNESS: float = 80.0
    MAX_BRIGHTNESS: float = 200.0
    MIN_OCCUPANCY_PCT: float = 55.0
    GRADE_A_THRESHOLD: float = 80.0
    GRADE_B_THRESHOLD: float = 60.0

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
