import io
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.vision.quality_gate import ImageQualityGate
from app.services.vision.grader import TomatoVisualGrader
from app.services.market.net_realization import NetRealizationEngine
from app.services.logistics.cvrptw import CVRPTWLogisticsOptimizer
from app.services.payment.adapter import SandboxPaymentAdapter

client = TestClient(app)

def get_auth_token(phone: str) -> str:
    res = client.post("/api/v1/auth/login", json={"phone": phone, "password": "demo_password"})
    assert res.status_code == 200
    return res.json()["access_token"]

# ==================== TEST 1 & 2: IMAGE VALIDATION & REJECTIONS ====================

def test_image_quality_gate_rejections():
    # 1. Empty image
    empty_res = client.post("/api/v1/vision/analyze", files={"file": ("empty.jpg", io.BytesIO(b""), "image/jpeg")})
    assert empty_res.status_code == 400
    assert "Empty image" in empty_res.json()["detail"]

    # 2. Corrupt/random non-image bytes
    corrupt_bytes = b"\x00\x01\x02\x03\x04\x05this_is_not_an_image_at_all"
    gate_corrupt = ImageQualityGate.evaluate_image(corrupt_bytes)
    assert gate_corrupt["passed"] is False
    assert any("Corrupt or unreadable" in r for r in gate_corrupt["rejection_reasons"])

    # 3. Blurry image
    blurry_mock = b"fake_tomato_blurry_sample_crate"
    gate_blurry = ImageQualityGate.evaluate_image(blurry_mock)
    assert gate_blurry["blur_passed"] is False
    assert any("too blurry" in r for r in gate_blurry["rejection_reasons"])

    # 4. Dark underexposed image
    dark_mock = b"fake_tomato_dark_sample_crate"
    gate_dark = ImageQualityGate.evaluate_image(dark_mock)
    assert gate_dark["brightness_passed"] is False
    assert any("Exposure out of range" in r for r in gate_dark["rejection_reasons"])

# ==================== TEST 3 & 4: DETERMINISTIC GRADING & FPO REVIEW ====================

def test_grading_determinism_and_fpo_review_flag():
    valid_mock = b"fake_tomato_high_quality_fresh_crate_01"
    q_result = ImageQualityGate.evaluate_image(valid_mock)
    g_result1 = TomatoVisualGrader.grade_tomato_harvest(q_result)
    g_result2 = TomatoVisualGrader.grade_tomato_harvest(q_result)

    # Identical inputs yield identical outputs (deterministic)
    assert g_result1["score"] == g_result2["score"]
    assert g_result1["grade"] == g_result2["grade"]
    assert g_result1["confidence_pct"] == g_result2["confidence_pct"]

    # Borderline image with blur_score < 105 triggers FPO review
    borderline_gate = {
        "passed": True,
        "blur_score": 102.5,
        "brightness_score": 125.0,
        "occupancy_score": 75.0,
        "phash": "3a8f1b9c4d2e7a0f",
        "rejection_reasons": []
    }
    g_borderline = TomatoVisualGrader.grade_tomato_harvest(borderline_gate)
    assert g_borderline["needs_fpo_review"] is True
    assert g_borderline["confidence"] == "Low"
    assert g_borderline["confidence_pct"] < 75.0

# ==================== TEST 5: MULTI-SCENARIO NET REALIZATION ====================

def test_net_realization_scenarios():
    calc = NetRealizationEngine.calculate_net(
        mandi_name="Baramati APMC",
        distance_km=12.0,
        modal_price_per_qtl=1850.0,
        quantity_kg=450.0,
        min_price_per_qtl=1650.0,
        max_price_per_qtl=2000.0,
        is_pooled=True
    )
    assert "scenarios" in calc
    s = calc["scenarios"]
    assert s["min_worst_case"]["net_realization_inr"] < s["modal_expected"]["net_realization_inr"]
    assert s["modal_expected"]["net_realization_inr"] < s["max_best_case"]["net_realization_inr"]
    assert s["min_worst_case"]["price_per_qtl"] == 1650.0
    assert s["max_best_case"]["price_per_qtl"] == 2000.0

# ==================== TEST 6 & 7: FORECAST & NON-GUARANTEE DISCLAIMERS ====================

def test_forecast_and_sale_advisor_disclaimers():
    f_res = client.get("/api/v1/market/forecast?crop=Tomato&mandi=Baramati%20APMC")
    assert f_res.status_code == 200
    f_data = f_res.json()
    assert "data_freshness" in f_data
    assert "non_guarantee_disclaimer" in f_data
    assert "do NOT guarantee" in f_data["non_guarantee_disclaimer"]

    a_res = client.get("/api/v1/market/sale-advisor?risk_preference=balanced")
    assert a_res.status_code == 200
    a_data = a_res.json()
    assert "non_guarantee_disclaimer" in a_data
    assert "do not constitute financial guarantees" in a_data["non_guarantee_disclaimer"]

# ==================== TEST 8: POOL CONSTRAINTS & DUPLICATE PREVENTION ====================

def test_pool_constraints_and_duplicate_rejection():
    farmer_token = get_auth_token("9822100011") # Farmer Ramesh Patil
    headers = {"Authorization": f"Bearer {farmer_token}"}

    # 1. Reject incompatible crop
    res_crop = client.post(
        "/api/v1/pools/POOL-PUNE-0908/join",
        json={"lot_id": "LOT-INCOMPATIBLE-CROP"},
        headers=headers
    )
    assert res_crop.status_code == 400
    assert "Crop mismatch" in res_crop.json()["detail"]

    # 2. Reject incompatible grade
    res_grade = client.post(
        "/api/v1/pools/POOL-PUNE-0908/join",
        json={"lot_id": "LOT-INCOMPATIBLE-GRADE"},
        headers=headers
    )
    assert res_grade.status_code == 400
    assert "Grade mismatch" in res_grade.json()["detail"]

    # 3. Reject duplicate lot allocation
    lot_id = "LOT-TOM-UNIQUE-001"
    res1 = client.post(
        "/api/v1/pools/POOL-PUNE-0908/join",
        json={"lot_id": lot_id},
        headers=headers
    )
    assert res1.status_code == 200

    # Attempting to allocate same lot again must fail
    res2 = client.post(
        "/api/v1/pools/POOL-PUNE-0908/join",
        json={"lot_id": lot_id},
        headers=headers
    )
    assert res2.status_code == 400
    assert "already committed" in res2.json()["detail"]

# ==================== TEST 9: FPO GRADE OVERRIDE REASON ENFORCEMENT ====================

def test_fpo_grade_override_requires_reason():
    fpo_token = get_auth_token("9422088990") # FPO Manager
    headers = {"Authorization": f"Bearer {fpo_token}"}

    # Override grade without reason -> 400 Bad Request
    fail_res = client.put(
        "/api/v1/crops/lots/LOT-TOM-01/verify",
        json={"verified_weight_kg": 445.0, "verified_grade": "Grade B", "fpo_notes": None},
        headers=headers
    )
    assert fail_res.status_code == 400
    assert "requires mandatory justification" in fail_res.json()["detail"]

    # Override grade with clear reason -> 200 OK
    ok_res = client.put(
        "/api/v1/crops/lots/LOT-TOM-01/verify",
        json={
            "verified_weight_kg": 445.0,
            "verified_grade": "Grade B",
            "fpo_notes": "Physical inspection detected 6.2% blotchy ripening exceeding Grade A threshold."
        },
        headers=headers
    )
    assert ok_res.status_code == 200
    assert ok_res.json()["grade"] == "Grade B"

# ==================== TEST 10: CVRPTW VEHICLE CAPACITY ENFORCEMENT ====================

def test_cvrptw_vehicle_capacity_overflow():
    # Pickups totaling 3,200 kg exceed 2,500 kg capacity
    overload_pickups = [
        {"name": "Farm A", "lat": 18.15, "lng": 74.58, "kg": 1800, "window": "07:00-08:00"},
        {"name": "Farm B", "lat": 18.16, "lng": 74.59, "kg": 1400, "window": "08:00-09:00"}
    ]
    with pytest.raises(ValueError) as exc:
        CVRPTWLogisticsOptimizer.solve_route(vehicle_capacity_kg=2500.0, pickups=overload_pickups)
    assert "exceeds maximum vehicle payload" in str(exc.value)

# ==================== TEST 11: ATOMIC BUYER RESERVATION (NO DOUBLE BOOKING) ====================

def test_buyer_reservation_atomic_prevent_double_booking():
    buyer_token = get_auth_token("0202687400") # Buyer FreshMart Foods
    headers = {"Authorization": f"Bearer {buyer_token}"}

    pool_id = "POOL-ATOMIC-TEST-01"

    # First reservation succeeds
    res1 = client.post(f"/api/v1/payments/reserve/{pool_id}", headers=headers)
    assert res1.status_code == 200
    assert res1.json()["status"] == "SUCCESS"

    # Second reservation on same pool must be rejected with 409 Conflict
    res2 = client.post(f"/api/v1/payments/reserve/{pool_id}", headers=headers)
    assert res2.status_code == 409
    assert "already reserved" in res2.json()["detail"]

# ==================== TEST 12 & 13: PARTIAL ACCEPTANCE & DISPUTE RECALCULATION ====================

def test_partial_acceptance_and_settlement_recalculation():
    buyer_token = get_auth_token("0202687400") # Buyer
    headers = {"Authorization": f"Bearer {buyer_token}"}

    pool_id = "POOL-DISPUTE-TEST-01"

    # Accept only 85% due to 15% transit crush damage
    res = client.post(
        f"/api/v1/payments/accept/{pool_id}?accepted_ratio=0.85&dispute_reason=15%25%20crushed%20crates%20in%20transit",
        headers=headers
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "PARTIALLY_ACCEPTED"
    assert data["accepted_ratio"] == 0.85
    assert data["dispute"]["funds_status"] == "FROZEN_IN_NODAL_ACCOUNT"
    assert data["dispute"]["sla_deadline_hours"] == 24

    # Verify farmer payout is recalculated
    settlement = data["settlements"][0]
    assert settlement["status"] == "PARTIALLY_RELEASED"
    assert settlement["disputed_hold_inr"] > 0
    b = settlement["breakdown"]
    # 450 kg * 21.50 = 9675 total gross; 85% accepted = 8223.75
    assert b["gross_inr"] == 8223.75
    assert b["disputed_held_inr"] == 1451.25

# ==================== TEST 14 & 16: RBAC PERMISSIONS ENFORCEMENT ====================

def test_rbac_unauthorized_access_prevention():
    farmer_token = get_auth_token("9822100011")
    buyer_token = get_auth_token("0202687400")

    farmer_headers = {"Authorization": f"Bearer {farmer_token}"}
    buyer_headers = {"Authorization": f"Bearer {buyer_token}"}

    # 1. Farmer attempting to verify a crop lot (FPO only) -> 403 Forbidden
    res_fpo_action = client.put(
        "/api/v1/crops/lots/LOT-TOM-01/verify",
        json={"verified_weight_kg": 450.0, "verified_grade": "Grade A"},
        headers=farmer_headers
    )
    assert res_fpo_action.status_code == 403

    # 2. Buyer attempting to create an FPO pool -> 403 Forbidden
    res_buyer_create_pool = client.post(
        "/api/v1/pools",
        json={"crop": "Tomato", "variety": "Abhinav", "target_kg": 1000.0, "price_per_qtl": 2150.0, "destination_mandi": "Pune", "collection_hub": "Baramati"},
        headers=buyer_headers
    )
    assert res_buyer_create_pool.status_code == 403

    # 3. Anonymous request without token calling protected endpoint -> 401 Unauthorized
    res_anon = client.post(
        "/api/v1/crops/lots",
        json={"crop_name": "Tomato", "variety": "Abhinav", "quantity_kg": 450.0}
    )
    assert res_anon.status_code == 401

    # 4. Invalid token -> 401 Unauthorized
    res_bad_token = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalid_tampered_jwt_token"}
    )
    assert res_bad_token.status_code == 401

# ==================== TEST 9: REMEDIATED LOOPHOLES COMPREHENSIVE SUITE ====================

def test_loopholes_remediation():
    # C1: Password validation (Wrong password must be 401 Unauthorized)
    res_wrong = client.post("/api/v1/auth/login", json={"phone": "9822100011", "password": "incorrect_password_xyz"})
    assert res_wrong.status_code == 401
    assert "Invalid credentials" in res_wrong.json()["detail"]

    # C1: Correct password succeeds
    res_correct = client.post("/api/v1/auth/login", json={"phone": "9822100011", "password": "demo_password"})
    assert res_correct.status_code == 200
    farmer_token = res_correct.json()["access_token"]
    farmer_hdr = {"Authorization": f"Bearer {farmer_token}"}

    # H3: /auth/me returns accurate phone and name
    res_me = client.get("/api/v1/auth/me", headers=farmer_hdr)
    assert res_me.status_code == 200
    assert res_me.json()["name"] == "Ramesh Patil"
    assert res_me.json()["phone"] == "+91 98221 00011"

    # FPO user gets their own profile
    res_fpo_login = client.post("/api/v1/auth/login", json={"phone": "9422088990", "password": "demo_password"})
    fpo_token = res_fpo_login.json()["access_token"]
    res_fpo_me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {fpo_token}"})
    assert res_fpo_me.json()["name"] == "Saksham FPO Manager"
    assert res_fpo_me.json()["phone"] == "+91 94220 88990"

    # H9: Net realization rejects quantity_kg <= 0
    res_zero_net = client.post("/api/v1/market/net-realization", json={"mandi_id": "M1", "quantity_kg": 0})
    assert res_zero_net.status_code == 422

    # Zero quantity lot creation rejected by Pydantic gt=0
    res_zero_lot = client.post(
        "/api/v1/crops/lots",
        json={"crop_name": "Tomato", "variety": "Abhinav", "quantity_kg": 0},
        headers=farmer_hdr
    )
    assert res_zero_lot.status_code == 422

    # H6: Real database ping in health check
    res_health = client.get("/api/v1/health")
    assert res_health.status_code == 200
    assert res_health.json()["status"] == "HEALTHY"
    assert res_health.json()["database"] == "CONNECTED"

    # H10: Dynamic forecast varies by crop and mandi
    res_tomato = client.get("/api/v1/market/forecast?crop=Tomato&mandi=Baramati%20APMC")
    res_onion = client.get("/api/v1/market/forecast?crop=Onion&mandi=Nashik%20APMC")
    assert res_tomato.json()["forecast_points"][0]["p50_price"] != res_onion.json()["forecast_points"][0]["p50_price"]
    assert "Export Policy" in str(res_onion.json()["feature_contributions"])

    # L5: Cold storage option in sale advisor
    res_cold = client.get("/api/v1/market/sale-advisor?risk_preference=growth&has_cold_storage=true")
    assert "Cold Chain" in res_cold.json()["recommended_action"]
