import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

logger = logging.getLogger("krishisetu.db")

try:
    # Try PostgreSQL first
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        echo=False
    )
    # Quick probe
    with engine.connect() as conn:
        logger.info("Connected to PostgreSQL database successfully.")
except Exception as e:
    if settings.USE_SQLITE_FALLBACK:
        logger.warning(f"PostgreSQL not reachable ({e}). Falling back to SQLite local database.")
        engine = create_engine(
            settings.SQLITE_FALLBACK_URL,
            connect_args={"check_same_thread": False},
            echo=False
        )
    else:
        raise e

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
