from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    name: str
    user_id: str

class LoginRequest(BaseModel):
    phone: str
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    phone: str
    role: str
    location: Optional[str] = None
    kyc_status: str

# Vision & Quality Analysis
class QualityAnalysisResponse(BaseModel):
    blur_score: float
    blur_passed: bool
    brightness_score: float
    brightness_passed: bool
    occupancy_score: float
    occupancy_passed: bool
    phash: str
    external_quality_score: float
    estimated_grade: str
    confidence_level: str
    confidence_pct: float
    detected_issues: List[str]
    parameters: Dict[str, Any]
    disclaimer: str
    needs_fpo_review: bool = False
    is_mock_inference: bool

# Crop Lot
class CropLotCreate(BaseModel):
    crop_name: str = Field(default="Tomato", min_length=2, max_length=100)
    variety: str = Field(default="Abhinav", min_length=2, max_length=100)
    quantity_kg: float = Field(gt=0, description="Quantity in kg must be greater than 0")
    status: Literal["Draft", "Submitted"] = "Draft"

class CropLotVerify(BaseModel):
    verified_weight_kg: float
    verified_grade: str
    fpo_notes: Optional[str] = None

class CropLotResponse(BaseModel):
    id: str
    farmer_id: str
    crop_name: str
    variety: str
    quantity_kg: float
    verified_weight_kg: Optional[float] = None
    grade: str
    status: str
    qr_code: Optional[str] = None
    pool_id: Optional[str] = None
    created_at: datetime

# Mandi & Net Realization
class MandiPriceResponse(BaseModel):
    id: str
    mandi: str
    crop: str
    variety: str
    min_price: float
    modal_price: float
    max_price: float
    arrivals_qtl: float
    distance_km: float
    freshness: str
    source: str

class NetRealizationRequest(BaseModel):
    mandi_id: str
    quantity_kg: float = Field(gt=0, description="Quantity in kg must be greater than 0")
    freight_rate_per_km: float = 15.0
    handling_fee: float = 180.0
    packaging_fee: float = 150.0
    commission_pct: float = 5.0
    spoilage_pct: float = 2.0
    is_pooled: bool = False

class NetRealizationResponse(BaseModel):
    mandi_name: str
    distance_km: float
    gross_revenue_inr: float
    freight_deduction_inr: float
    handling_deduction_inr: float
    packaging_deduction_inr: float
    commission_deduction_inr: float
    spoilage_deduction_inr: float
    fpo_fee_inr: float
    net_realization_inr: float
    net_per_quintal_inr: float
    assumptions: List[str]
    scenarios: Optional[Dict[str, Any]] = None
    waterfall_breakdown: Optional[List[Dict[str, Any]]] = None

# Forecasting & Sale Advisor
class ForecastDayPoint(BaseModel):
    day: str
    p10_price: float
    p50_price: float
    p90_price: float

class ForecastResponse(BaseModel):
    crop: str
    mandi: str
    forecast_points: List[ForecastDayPoint]
    model_name: str
    model_version: str
    wmape: float
    feature_contributions: Dict[str, str]
    data_freshness: str = "Live APMC Bulletin - Fresh (Updated 2h ago)"
    source_bulletin: str = "Baramati APMC Yard Bulletin"
    non_guarantee_disclaimer: str = "Price forecasts are statistical quantile estimates (P10-P90) and do NOT guarantee actual mandi clearing rates."

class SaleAdvisorResponse(BaseModel):
    recommended_action: str # "Wait 3 Days", "Sell Now", "Store"
    expected_net_price_per_qtl: float
    downside_price_per_qtl: float
    confidence_level: str
    perishability_warning: str
    key_risks: List[str]
    why_recommendation: List[str]
    non_guarantee_disclaimer: str = "Recommendations are probabilistic decision-support estimates. Realized prices depend on arrival volumes at the time of sale."

# Pooling
class PoolCreate(BaseModel):
    crop: str = "Tomato"
    variety: str = "Abhinav"
    target_kg: float = Field(gt=0, description="Target weight in kg must be greater than 0")
    price_per_qtl: float = Field(gt=0, description="Price per quintal must be greater than 0")
    destination_mandi: str
    collection_hub: str
    cutoff_hours: int = 8

class PoolJoinRequest(BaseModel):
    lot_id: str

class PoolResponse(BaseModel):
    id: str
    crop: str
    variety: str
    target_kg: float
    current_kg: float
    price_per_qtl: float
    status: str
    destination_mandi: str
    collection_hub: str
    shared_freight_savings_pct: float
    closes_at: datetime

# Logistics
class RouteStop(BaseModel):
    location_name: str
    lat: float
    lng: float
    pickup_kg: float
    window: str

class RoutePlanResponse(BaseModel):
    route_id: str
    vehicle: str
    driver: str
    stops: List[RouteStop]
    total_distance_km: float
    load_utilization_pct: float
    estimated_cost_inr: float
    farmer_savings_vs_solo_pct: float

# Settlements & Audits
class SettlementResponse(BaseModel):
    id: str
    transaction_id: str
    farmer_id: str
    amount_inr: float
    status: str
    date: datetime
    nodal_account_ref: str
    breakdown: Dict[str, float]

class AuditEventResponse(BaseModel):
    id: str
    timestamp: datetime
    actor_name: str
    actor_role: str
    action: str
    entity_type: str
    entity_id: str
    details: str
    prev_hash: str
    hash: str

# ==================== CROPS CATALOG & REQUESTS ====================

class CropItemResponse(BaseModel):
    id: str
    name: str
    marathi_name: Optional[str] = None
    hindi_name: Optional[str] = None
    category: str
    icon: str
    unit: str
    perishability: str
    storage_recommendation: Optional[str] = None
    default_batch_size_kg: float
    supported_quality_params: Optional[List[str]] = None
    varieties: List[str]
    status: str

class CropRequestCreate(BaseModel):
    requested_crop_name: str = Field(min_length=2, max_length=100)
    variety: Optional[str] = None
    category: Optional[str] = None
    reason: Optional[str] = None

class CropRequestResponse(BaseModel):
    id: str
    farmer_id: str
    farmer_name: Optional[str] = None
    requested_crop_name: str
    variety: Optional[str] = None
    category: Optional[str] = None
    reason: Optional[str] = None
    status: str
    created_at: datetime

# ==================== PRODUCT IMAGES & PRODUCTS ====================

class ProductImageResponse(BaseModel):
    id: str
    product_id: Optional[str] = None
    farmer_id: str
    crop_id: Optional[str] = None
    image_url: str
    storage_key: str
    category: str # TOP_VIEW, SIDE_VIEW, LOT_VIEW, OTHER
    display_order: int
    uploaded_at: datetime
    file_type: str
    file_size: int

class ProductCreate(BaseModel):
    crop_id: Optional[str] = None
    crop_name: str = Field(default="Tomato", min_length=2, max_length=100)
    variety: str = Field(default="Abhinav", min_length=2, max_length=100)
    quantity: Optional[float] = None
    quantity_kg: Optional[float] = None
    unit: str = "kg"
    harvest_date: Optional[str] = None
    packaging_type: Optional[str] = None
    location_id: Optional[str] = None
    location_name: Optional[str] = None
    notes: Optional[str] = None
    product_status: str = "DRAFT" # DRAFT, PHOTOS_UPLOADED, UNDER_ANALYSIS, AWAITING_FPO_VERIFICATION
    image_ids: Optional[List[str]] = None
    cover_image_id: Optional[str] = None
    cover_image_url: Optional[str] = None
    asking_price_per_qtl: Optional[float] = None
    asking_price_paise: Optional[int] = None

class ProductUpdate(BaseModel):
    crop_name: Optional[str] = None
    variety: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    harvest_date: Optional[str] = None
    packaging_type: Optional[str] = None
    location_name: Optional[str] = None
    notes: Optional[str] = None
    asking_price_per_qtl: Optional[float] = None
    cover_image_id: Optional[str] = None

class ProductStatusHistoryItem(BaseModel):
    id: str
    old_status: Optional[str] = None
    new_status: str
    changed_by: Optional[str] = None
    changed_at: datetime
    reason: Optional[str] = None

class ProductResponse(BaseModel):
    id: str
    farmer_id: str
    farmer_name: Optional[str] = None
    crop_id: Optional[str] = None
    crop_name: str
    variety: str
    quantity: float
    unit: str
    harvest_date: Optional[str] = None
    packaging_type: Optional[str] = None
    location_id: Optional[str] = None
    location_name: Optional[str] = None
    notes: Optional[str] = None
    product_status: str
    marketplace_visibility: str
    cover_image_id: Optional[str] = None
    cover_image_url: Optional[str] = None
    images: List[ProductImageResponse] = []
    ai_grade: Optional[str] = None
    ai_quality_score: Optional[float] = None
    ai_confidence: Optional[str] = None
    fpo_verified_grade: Optional[str] = None
    verified_weight_kg: Optional[float] = None
    asking_price_per_qtl: Optional[float] = None
    qr_code: Optional[str] = None
    pool_id: Optional[str] = None
    buyer_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    archived_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    status_history: List[ProductStatusHistoryItem] = []

class BuyerProductResponse(BaseModel):
    id: str
    crop_id: Optional[str] = None
    crop_name: str
    variety: str
    quantity: float
    unit: str
    grade: Optional[str] = None
    ai_grade: Optional[str] = None
    ai_quality_score: Optional[float] = None
    fpo_verified_grade: Optional[str] = None
    is_fpo_verified: bool = False
    location_name: Optional[str] = None
    collection_hub: Optional[str] = None
    asking_price_per_qtl: Optional[float] = None
    cover_image_url: Optional[str] = None
    images: List[ProductImageResponse] = []
    quality_findings: Optional[List[str]] = None
    created_at: datetime
    disclaimer: str = "AI quality result is an external visual estimate. Final acceptance follows FPO/buyer verification terms."

