import pytest
from app.core.database import SessionLocal
from app.models.entities import Pool, CropLot
from app.api.v1.router import ALLOCATED_LOTS

@pytest.fixture(autouse=True)
def reset_test_state():
    """
    Ensure 100% test isolation and idempotency across test executions.
    Resets the in-memory ALLOCATED_LOTS set and restores POOL-PUNE-0908's
    current_kg baseline so tests never fail from accumulated state.
    """
    ALLOCATED_LOTS.clear()
    db = SessionLocal()
    try:
        pool = db.query(Pool).filter(Pool.id == "POOL-PUNE-0908").first()
        if pool:
            pool.current_kg = 650.0
            db.commit()
        db.query(CropLot).filter(CropLot.id.like("LOT-TOM-TEST%")).delete(synchronize_session=False)
        db.query(CropLot).filter(CropLot.id.like("LOT-TOM-UNIQUE%")).delete(synchronize_session=False)
        db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()

    yield

    ALLOCATED_LOTS.clear()
    db = SessionLocal()
    try:
        pool = db.query(Pool).filter(Pool.id == "POOL-PUNE-0908").first()
        if pool:
            pool.current_kg = 650.0
            db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()
