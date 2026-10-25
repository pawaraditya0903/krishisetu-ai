import pytest
from app.core.database import SessionLocal
from app.models.entities import Pool, CropLot, AuditEvent
from app.services.traceability.audit import AuditTraceabilityEngine
from app.api.v1.router import ALLOCATED_LOTS

@pytest.fixture(autouse=True)
def reset_test_state():
    """
    Ensure 100% test isolation and idempotency across test executions.
    Resets the in-memory ALLOCATED_LOTS set, restores POOL-PUNE-0908's
    current_kg baseline, and ensures AuditEvent ledger continuity.
    """
    ALLOCATED_LOTS.clear()
    db = SessionLocal()
    clean_event_ids = set()
    try:
        clean_event_ids = {e.id for e in db.query(AuditEvent.id).all()}
        last_evt = db.query(AuditEvent).order_by(AuditEvent.timestamp.desc()).first()
        if last_evt:
            AuditTraceabilityEngine.set_latest_hash(last_evt.hash)
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
        if clean_event_ids:
            db.query(AuditEvent).filter(AuditEvent.id.notin(clean_event_ids)).delete(synchronize_session=False)
            db.commit()
        last_evt = db.query(AuditEvent).order_by(AuditEvent.timestamp.desc()).first()
        if last_evt:
            AuditTraceabilityEngine.set_latest_hash(last_evt.hash)
    except Exception:
        db.rollback()
    finally:
        db.close()
