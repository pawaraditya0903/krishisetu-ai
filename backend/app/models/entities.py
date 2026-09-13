import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def gen_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

# ==================== USERS & ACTORS ====================

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    role = Column(String(20), nullable=False, default="FARMER") # FARMER, FPO_MANAGER, BUYER, ADMIN, FIELD_VERIFIER
    password_hash = Column(String(128), nullable=False)
    location = Column(String(255))
    is_active = Column(Boolean, default=True)
    kyc_status = Column(String(20), default="VERIFIED")
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

class FPO(Base):
    __tablename__ = "fpos"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(150), nullable=False)
    registration_number = Column(String(100), unique=True)
    district = Column(String(100), default="Pune")
    tehsil = Column(String(100), default="Baramati")
    collection_center_address = Column(Text)
    created_at = Column(DateTime, default=utc_now)

class Buyer(Base):
    __tablename__ = "buyers"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id"))
    company_name = Column(String(150), nullable=False)
    gstin = Column(String(20), unique=True)
    warehouse_address = Column(Text)
    reliability_score = Column(Float, default=98.0)
    created_at = Column(DateTime, default=utc_now)

# ==================== CROPS & CATALOG ====================

class Crop(Base):
    __tablename__ = "crops"

    id = Column(String(36), primary_key=True, default=gen_uuid) # e.g. CROP-TOM
    name = Column(String(100), nullable=False, unique=True, index=True)
    marathi_name = Column(String(100))
    hindi_name = Column(String(100))
    category = Column(String(50), default="Vegetable") # Vegetable, Fruit, Grain, Pulse, Cash Crop, Spice
    icon = Column(String(20), default="🌱")
    unit = Column(String(20), default="kg")
    perishability = Column(String(50), default="Medium (1-3 weeks)")
    storage_recommendation = Column(Text)
    default_batch_size_kg = Column(Float, default=500.0)
    supported_quality_params = Column(JSON) # e.g. ["Size Uniformity", "Ripeness Index", "Surface Defects", "Color Uniformity"]
    status = Column(String(20), default="Active")
    created_at = Column(DateTime, default=utc_now)

    varieties = relationship("CropVariety", back_populates="crop", cascade="all, delete-orphan")

class CropVariety(Base):
    __tablename__ = "crop_varieties"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    crop_id = Column(String(36), ForeignKey("crops.id"), index=True)
    name = Column(String(100), nullable=False)

    crop = relationship("Crop", back_populates="varieties")

class CropRequest(Base):
    __tablename__ = "crop_requests"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    farmer_id = Column(String(36), ForeignKey("users.id"), index=True)
    farmer_name = Column(String(100))
    requested_crop_name = Column(String(100), nullable=False)
    variety = Column(String(100), nullable=True)
    category = Column(String(50), nullable=True)
    reason = Column(Text, nullable=True)
    status = Column(String(30), default="PENDING_REVIEW") # PENDING_REVIEW, APPROVED, REJECTED
    created_at = Column(DateTime, default=utc_now)

# ==================== CROPS & LOTS / FARMER PRODUCTS ====================

class CropLot(Base):
    __tablename__ = "crop_lots"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    farmer_id = Column(String(36), ForeignKey("users.id"), index=True)
    fpo_id = Column(String(36), ForeignKey("fpos.id"), nullable=True)
    crop_id = Column(String(36), ForeignKey("crops.id"), nullable=True, index=True)
    crop_name = Column(String(100), default="Tomato", index=True)
    variety = Column(String(100), default="Abhinav")
    quantity_kg = Column(Float, nullable=False)
    unit = Column(String(20), default="kg")
    harvest_date = Column(String(30), nullable=True)
    packaging_type = Column(String(100), nullable=True)
    location_id = Column(String(100), nullable=True)
    location_name = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)

    # Product status and marketplace visibility
    product_status = Column(String(50), default="DRAFT", index=True)
    # Statuses: DRAFT, PHOTOS_UPLOADED, UNDER_ANALYSIS, NEEDS_REUPLOAD, ANALYSIS_COMPLETE,
    # AWAITING_FPO_VERIFICATION, FPO_VERIFIED, REJECTED, PUBLISHED, UNPUBLISHED,
    # POOL_REQUESTED, IN_POOL, BUYER_RESERVED, DISPATCHED, DELIVERED, SOLD, WITHDRAWN, ARCHIVED, DELETED
    status = Column(String(30), default="Draft", index=True) # Legacy status sync: Draft, Submitted, Verified, Pooled, Reserved, Dispatched, Delivered, Accepted, Paid
    marketplace_visibility = Column(String(30), default="PRIVATE", index=True) # PRIVATE, PUBLIC, UNLISTED
    cover_image_id = Column(String(36), nullable=True)
    cover_image_url = Column(String(255), nullable=True)

    # AI Quality and FPO Verification
    ai_grade = Column(String(20), nullable=True)
    ai_quality_score = Column(Float, nullable=True)
    ai_confidence = Column(String(20), nullable=True)
    fpo_verified_grade = Column(String(20), nullable=True)
    verified_weight_kg = Column(Float, nullable=True)
    grade = Column(String(20), default="Pending")
    verified_grade = Column(String(20), nullable=True)
    confidence_score = Column(Float, default=0.0)

    # Financial & Commerce Linkages
    asking_price_paise = Column(Integer, nullable=True) # Asking rate per quintal in paise
    qr_code = Column(String(100), unique=True, index=True)
    pool_id = Column(String(36), nullable=True, index=True)
    buyer_id = Column(String(36), nullable=True, index=True)
    fpo_notes = Column(Text, nullable=True)

    # Timestamps & Lifecycle
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)
    archived_at = Column(DateTime, nullable=True)
    deleted_at = Column(DateTime, nullable=True)

    # Relationships
    analyses = relationship("ImageAnalysisResult", back_populates="lot", cascade="all, delete-orphan")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    status_history = relationship("ProductStatusHistory", back_populates="product", cascade="all, delete-orphan")

class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    product_id = Column(String(36), ForeignKey("crop_lots.id"), index=True)
    farmer_id = Column(String(36), ForeignKey("users.id"), index=True)
    crop_id = Column(String(36), nullable=True)
    image_url = Column(String(255), nullable=False)
    storage_key = Column(String(255), nullable=False)
    category = Column(String(30), nullable=False) # TOP_VIEW, SIDE_VIEW, LOT_VIEW, OTHER
    display_order = Column(Integer, default=0)
    uploaded_at = Column(DateTime, default=utc_now)
    uploaded_by = Column(String(36), nullable=True)
    file_type = Column(String(50), default="image/jpeg")
    file_size = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)

    product = relationship("CropLot", back_populates="images")

class ProductStatusHistory(Base):
    __tablename__ = "product_status_history"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    product_id = Column(String(36), ForeignKey("crop_lots.id"), index=True)
    old_status = Column(String(50), nullable=True)
    new_status = Column(String(50), nullable=False)
    changed_by = Column(String(36), nullable=True)
    changed_at = Column(DateTime, default=utc_now)
    reason = Column(Text, nullable=True)

    product = relationship("CropLot", back_populates="status_history")

class MarketplaceListing(Base):
    __tablename__ = "marketplace_listings"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    product_id = Column(String(36), ForeignKey("crop_lots.id"), unique=True, index=True)
    asking_price_paise = Column(Integer, nullable=False)
    min_order_kg = Column(Float, default=100.0)
    listed_at = Column(DateTime, default=utc_now)
    expires_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)

class ImageAnalysisResult(Base):
    __tablename__ = "image_analysis_results"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    lot_id = Column(String(36), ForeignKey("crop_lots.id"), index=True)
    blur_score = Column(Float)
    blur_passed = Column(Boolean)
    brightness_score = Column(Float)
    brightness_passed = Column(Boolean)
    occupancy_score = Column(Float)
    occupancy_passed = Column(Boolean)
    phash = Column(String(64))
    external_quality_score = Column(Float)
    estimated_grade = Column(String(20))
    confidence_level = Column(String(20))
    confidence_pct = Column(Float)
    detected_issues = Column(JSON) # List of strings
    visual_parameters = Column(JSON) # Size, ripeness, defects, color
    disclaimer = Column(Text)
    created_at = Column(DateTime, default=utc_now)

    lot = relationship("CropLot", back_populates="analyses")

# ==================== MANDIS & PRICES ====================

class Mandi(Base):
    __tablename__ = "mandis"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(100), nullable=False, unique=True)
    district = Column(String(100))
    state = Column(String(100), default="Maharashtra")
    distance_km = Column(Float, default=0.0) # from pilot hub Baramati

class MarketPrice(Base):
    __tablename__ = "market_prices"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    mandi_id = Column(String(36), ForeignKey("mandis.id"), index=True)
    crop = Column(String(100), default="Tomato")
    variety = Column(String(100), default="Hybrid")
    date = Column(DateTime, index=True)
    min_price_paise = Column(Integer, nullable=False) # In paise
    modal_price_paise = Column(Integer, nullable=False)
    max_price_paise = Column(Integer, nullable=False)
    arrivals_quintal = Column(Float, default=0.0)
    source = Column(String(150))
    freshness_status = Column(String(30), default="Fresh")
    ingested_at = Column(DateTime, default=utc_now)

# ==================== POOLING & LOGISTICS ====================

class Pool(Base):
    __tablename__ = "pools"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    fpo_id = Column(String(36), ForeignKey("fpos.id"))
    crop = Column(String(100), default="Tomato")
    variety = Column(String(100), default="Abhinav")
    target_kg = Column(Float, nullable=False)
    current_kg = Column(Float, default=0.0)
    allowed_grades = Column(JSON) # ["Grade A", "Grade B"]
    price_per_qtl_paise = Column(Integer, nullable=False)
    status = Column(String(30), default="Open", index=True) # Open, Reserved, Dispatched, Delivered, Accepted, Disputed
    closes_at = Column(DateTime)
    buyer_id = Column(String(36), nullable=True)
    destination_mandi = Column(String(150), default="Pune Market Yard")
    collection_hub = Column(String(150), default="Baramati APMC Hub")
    shared_freight_savings_pct = Column(Float, default=28.5)
    created_at = Column(DateTime, default=utc_now)

class Transporter(Base):
    __tablename__ = "transporters"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(100), nullable=False)
    vehicle_number = Column(String(50), nullable=False)
    capacity_kg = Column(Float, default=2500.0)
    contact = Column(String(30))

class Dispatch(Base):
    __tablename__ = "dispatches"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    pool_id = Column(String(36), ForeignKey("pools.id"))
    transporter_id = Column(String(36), ForeignKey("transporters.id"))
    weigh_slip_number = Column(String(100), unique=True)
    dispatched_at = Column(DateTime, default=utc_now)
    status = Column(String(30), default="IN_TRANSIT")

# ==================== COMMERCE & PAYMENTS ====================

class PaymentTransaction(Base):
    __tablename__ = "payment_transactions"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    transaction_id = Column(String(64), unique=True, index=True)
    pool_id = Column(String(36), ForeignKey("pools.id"))
    buyer_id = Column(String(36))
    amount_paise = Column(Integer, nullable=False)
    status = Column(String(30), default="PAYMENT_AUTHORIZED") # AUTHORIZED, IN_TRANSIT, ACCEPTED, RELEASED, DISPUTED, REFUNDED
    nodal_account_ref = Column(String(100))
    authorized_at = Column(DateTime, default=utc_now)
    released_at = Column(DateTime, nullable=True)

class Settlement(Base):
    __tablename__ = "settlements"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    transaction_id = Column(String(64), index=True)
    farmer_id = Column(String(36), ForeignKey("users.id"), index=True)
    pool_id = Column(String(36), ForeignKey("pools.id"))
    lot_id = Column(String(36), ForeignKey("crop_lots.id"))
    gross_paise = Column(Integer, nullable=False)
    freight_paise = Column(Integer, default=0)
    packaging_paise = Column(Integer, default=0)
    handling_paise = Column(Integer, default=0)
    fpo_fee_paise = Column(Integer, default=0)
    quality_adj_paise = Column(Integer, default=0)
    net_payout_paise = Column(Integer, nullable=False)
    status = Column(String(20), default="Released")
    date = Column(DateTime, default=utc_now)

class Dispute(Base):
    __tablename__ = "disputes"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    pool_id = Column(String(36), ForeignKey("pools.id"))
    buyer_id = Column(String(36))
    reason = Column(Text, nullable=False)
    evidence_url = Column(String(255), nullable=True)
    status = Column(String(30), default="RAISED") # RAISED, UNDER_REVIEW, RESOLVED, REJECTED
    created_at = Column(DateTime, default=utc_now)
    resolved_at = Column(DateTime, nullable=True)

# ==================== AUDIT & TRACEABILITY ====================

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    timestamp = Column(DateTime, default=utc_now, index=True)
    actor_id = Column(String(36))
    actor_name = Column(String(100))
    actor_role = Column(String(30))
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50))
    entity_id = Column(String(50))
    details = Column(Text)
    prev_hash = Column(String(64), nullable=False)
    hash = Column(String(64), nullable=False, unique=True)
