import sys
import os
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import SessionLocal, Base, engine
from app.models.entities import User, Mandi, MarketPrice, FPO, Buyer, CropLot, Pool, Transporter, AuditEvent
from app.core.security import get_password_hash
from app.services.traceability.audit import AuditTraceabilityEngine

def seed_database():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).filter(User.phone == "9822100011").first():
            print("Database already seeded with demo records. Skipping.")
            return

        print("Seeding demo users...")
        users = [
            User(id="F1", name="Ramesh Patil", phone="9822100011", role="FARMER", password_hash=get_password_hash("demo123"), location="Baramati, Pune"),
            User(id="F2", name="Suresh Gaikwad", phone="9822100022", role="FARMER", password_hash=get_password_hash("demo123"), location="Rui, Baramati"),
            User(id="FPO1", name="Saksham FPO Manager", phone="9422088990", role="FPO_MANAGER", password_hash=get_password_hash("demo123"), location="Baramati APMC Office"),
            User(id="B1", name="FreshMart Foods Pvt. Ltd.", phone="0202687400", role="BUYER", password_hash=get_password_hash("demo123"), location="Hadapsar, Pune"),
            User(id="A1", name="KrishiSetu Admin", phone="0202555123", role="ADMIN", password_hash=get_password_hash("demo123"), location="Pune Headquarters"),
        ]
        db.add_all(users)

        print("Seeding FPO and Buyer organizations...")
        fpo = FPO(id="FPO1", name="Baramati Krushi Farmer Producer Company Ltd.", registration_number="FPO-MH-PUN-2021-0891", district="Pune", tehsil="Baramati", collection_center_address="Baramati APMC Hub #1")
        buyer = Buyer(id="BUY1", user_id="B1", company_name="FreshMart Foods Pvt. Ltd.", gstin="27AABCF1234F1Z8", warehouse_address="Hadapsar Warehouse, Pune", reliability_score=98.4)
        db.add(fpo)
        db.add(buyer)

        print("Seeding Mandis...")
        mandis = [
            Mandi(id="M1", name="Baramati APMC", district="Pune", state="Maharashtra", distance_km=12.0),
            Mandi(id="M2", name="Pune Gultekdi Market Yard", district="Pune", state="Maharashtra", distance_km=92.0),
            Mandi(id="M3", name="Solapur APMC", district="Solapur", state="Maharashtra", distance_km=190.0),
        ]
        db.add_all(mandis)

        print("Seeding Daily Mandi Prices for Tomato...")
        prices = [
            MarketPrice(mandi_id="M1", crop="Tomato", variety="Hybrid", date=datetime.utcnow(), min_price_paise=165000, modal_price_paise=185000, max_price_paise=200000, arrivals_quintal=420.0, source="Baramati Daily Bulletin", freshness_status="Fresh (Today)"),
            MarketPrice(mandi_id="M2", crop="Tomato", variety="Hybrid", date=datetime.utcnow(), min_price_paise=180000, modal_price_paise=215000, max_price_paise=235000, arrivals_quintal=1450.0, source="MSAMB Daily Bulletin", freshness_status="Fresh (Today)"),
            MarketPrice(mandi_id="M3", crop="Tomato", variety="Hybrid", date=datetime.utcnow(), min_price_paise=170000, modal_price_paise=202000, max_price_paise=218000, arrivals_quintal=880.0, source="Solapur Committee", freshness_status="Fresh (Today)"),
        ]
        db.add_all(prices)

        print("Seeding FPO Pool and Transporters...")
        transporter = Transporter(id="TR1", name="Patil Agro Logistics", vehicle_number="MH-12-RN-5821", capacity_kg=2500.0, contact="+91 98220 12345")
        db.add(transporter)

        pool = Pool(
            id="POOL-PUNE-0908",
            fpo_id="FPO1",
            crop="Tomato",
            variety="Abhinav (Hybrid)",
            target_kg=1000.0,
            current_kg=650.0,
            allowed_grades=["Grade A"],
            price_per_qtl_paise=215000,
            status="Open",
            closes_at=datetime.utcnow() + timedelta(hours=6),
            destination_mandi="Pune Market Yard",
            collection_hub="Baramati APMC Yard Hub",
            shared_freight_savings_pct=28.5
        )
        db.add(pool)

        print("Seeding Verified Crop Lot for Ramesh Patil...")
        lot = CropLot(
            id="LOT-TOM-8491",
            farmer_id="F1",
            fpo_id="FPO1",
            crop_name="Tomato",
            variety="Abhinav (Hybrid)",
            quantity_kg=450.0,
            verified_weight_kg=450.0,
            grade="Grade A",
            verified_grade="Grade A",
            confidence_score=91.0,
            status="Verified",
            qr_code="KS-LOT-TOM-8491-VERIFIED-BARAMATI",
            fpo_notes="Verified at Baramati Collection Center. Excellent firmness and uniform breaker-to-pink color."
        )
        db.add(lot)

        print("Seeding Hash-Chained Audit Trail...")
        audit_event = AuditTraceabilityEngine.create_audit_record(
            action="LOT_VERIFIED",
            entity_type="CROP_LOT",
            entity_id="LOT-TOM-8491",
            details="Grade A verified at Baramati Collection Center #2. Net weight 450 kg net net net.",
            actor_name="Saksham FPO Manager",
            actor_role="FPO_MANAGER"
        )
        db_audit = AuditEvent(
            id=audit_event["id"],
            actor_name=audit_event["actor_name"],
            actor_role=audit_event["actor_role"],
            action=audit_event["action"],
            entity_type=audit_event["entity_type"],
            entity_id=audit_event["entity_id"],
            details=audit_event["details"],
            prev_hash=audit_event["prev_hash"],
            hash=audit_event["hash"]
        )
        db.add(db_audit)

        db.commit()
        print("Database successfully seeded with Baramati Tomato Pilot records!")
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
