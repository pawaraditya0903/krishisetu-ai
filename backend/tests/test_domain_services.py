import pytest
from app.services.vision.quality_gate import ImageQualityGate
from app.services.vision.grader import TomatoVisualGrader
from app.services.market.net_realization import NetRealizationEngine
from app.services.market.forecaster import MandiPriceForecaster
from app.services.market.sale_advisor import RiskAwareSaleAdvisor
from app.services.logistics.cvrptw import CVRPTWLogisticsOptimizer
from app.services.payment.adapter import SandboxPaymentAdapter
from app.services.traceability.audit import AuditTraceabilityEngine

def test_image_quality_gate_evaluation():
    sample_bytes = b"krishisetu_tomato_sample_image_data_baramati_pilot"
    result = ImageQualityGate.evaluate_image(sample_bytes)
    
    assert "passed" in result
    assert result["passed"] is True
    assert result["blur_score"] >= 100.0
    assert 80.0 <= result["brightness_score"] <= 200.0
    assert result["occupancy_score"] >= 55.0
    assert len(result["phash"]) == 16
    assert isinstance(result["rejection_reasons"], list)

def test_tomato_grader_grade_assignment():
    sample_bytes = b"krishisetu_fresh_firm_tomato_harvest_crate_01"
    q_result = ImageQualityGate.evaluate_image(sample_bytes)
    g_result = TomatoVisualGrader.grade_tomato_harvest(q_result)
    
    assert g_result["grade"] in ["Grade A", "Grade B", "Grade C"]
    assert g_result["score"] >= 80.0
    assert g_result["confidence"] in ["High", "Medium", "Low"]
    assert "parameters" in g_result
    assert "disclaimer" in g_result
    assert "External visual-quality estimate only" in g_result["disclaimer"]
    assert g_result["is_mock_inference"] is True

def test_tomato_grader_rejection_fallback():
    failed_gate = {
        "passed": False,
        "rejection_reasons": ["Image is too blurry. Hold the camera steady with adequate lighting."]
    }
    g_result = TomatoVisualGrader.grade_tomato_harvest(failed_gate)
    assert g_result["score"] == 0.0
    assert g_result["grade"] == "Grade C"
    assert g_result["needs_fpo_review"] is True

def test_net_realization_calculation_and_pooling_savings():
    solo_calc = NetRealizationEngine.calculate_net(
        mandi_name="Pune Gultekdi",
        distance_km=95.0,
        modal_price_per_qtl=2150.0,
        quantity_kg=450.0,
        freight_per_km=15.0,
        handling_fee=180.0,
        packaging_fee=150.0,
        commission_pct=5.0,
        spoilage_pct=2.0,
        is_pooled=False
    )
    
    pooled_calc = NetRealizationEngine.calculate_net(
        mandi_name="Pune Gultekdi",
        distance_km=95.0,
        modal_price_per_qtl=2150.0,
        quantity_kg=450.0,
        freight_per_km=15.0,
        handling_fee=180.0,
        packaging_fee=150.0,
        commission_pct=5.0,
        spoilage_pct=2.0,
        is_pooled=True
    )
    
    # 4.5 quintals * 2150 = 9675.0 gross
    assert solo_calc["gross_revenue_inr"] == 9675.0
    assert pooled_calc["gross_revenue_inr"] == 9675.0
    
    # Solo freight: 95 * 15 = 1425.0
    assert solo_calc["freight_deduction_inr"] == 1425.0
    # Pooled freight: 1425 * 0.715 = 1018.88
    assert pooled_calc["freight_deduction_inr"] < solo_calc["freight_deduction_inr"]
    
    # Take-home net should be higher with pooled freight
    assert pooled_calc["net_realization_inr"] > solo_calc["net_realization_inr"]
    assert pooled_calc["net_per_quintal_inr"] > solo_calc["net_per_quintal_inr"]

def test_price_forecaster_quantiles():
    forecast = MandiPriceForecaster.get_forecast(crop="Tomato", mandi="Baramati APMC")
    
    assert forecast["crop"] == "Tomato"
    assert forecast["mandi"] == "Baramati APMC"
    assert forecast["model_name"] == "LightGBM-Quantile-Regressor"
    assert 4.0 <= forecast["wmape"] <= 6.5
    assert len(forecast["forecast_points"]) > 0
    
    for pt in forecast["forecast_points"]:
        assert pt["p10_price"] <= pt["p50_price"] <= pt["p90_price"]

def test_sale_advisor_risk_strategies():
    conservative = RiskAwareSaleAdvisor.advise(risk_preference="conservative")
    assert conservative["recommended_action"] == "Sell Now"
    assert "ambient monsoon conditions" in " ".join(conservative["why_recommendation"])
    
    growth = RiskAwareSaleAdvisor.advise(risk_preference="growth")
    assert growth["recommended_action"] == "Wait 7 Days"
    
    balanced = RiskAwareSaleAdvisor.advise(risk_preference="balanced")
    assert balanced["recommended_action"] == "Wait 3 Days"
    
    # Check perishability warning is explicitly stated across all
    assert "Tomato is highly perishable" in balanced["perishability_warning"]

def test_cvrptw_logistics_route_solver():
    plan = CVRPTWLogisticsOptimizer.solve_route(
        depot_name="Baramati FPO Hub",
        vehicle_capacity_kg=2500.0
    )
    
    assert plan["route_id"] == "ROUTE-BARAMATI-NORTH-01"
    assert plan["load_utilization_pct"] > 0
    assert plan["farmer_savings_vs_solo_pct"] > 0
    assert len(plan["stops"]) == 4 # 3 farm pickups + 1 consolidation depot

def test_sandbox_payment_adapter_lifecycle():
    adapter = SandboxPaymentAdapter()
    
    # 1. Authorize hold
    auth = adapter.authorize_payment(
        pool_id="POOL-TOM-001",
        buyer_id="B1",
        amount_paise=3250000 # ₹32,500.00
    )
    assert auth["status"] == "PAYMENT_AUTHORIZED"
    assert auth["amount_inr"] == 32500.0
    assert "YESB0000109-NODAL" in auth["nodal_account_ref"]
    
    # 2. Release transparent split to farmers
    contributions = [
        {"farmer_id": "F1", "farmer_name": "Ramesh Patil", "quantity_kg": 450.0},
        {"farmer_id": "F2", "farmer_name": "Suresh Gaikwad", "quantity_kg": 350.0}
    ]
    settlements = adapter.release_to_farmers(
        pool_id="POOL-TOM-001",
        contributions=contributions,
        price_per_qtl=2100.0
    )
    assert len(settlements) == 2
    for s in settlements:
        assert s["status"] == "RELEASED"
        b = s["breakdown"]
        expected_net = b["gross_inr"] - b["freight_inr"] - b["packaging_inr"] - b["handling_inr"] - b["fpo_fee_inr"] - b["quality_adj_inr"]
        assert abs(s["amount_inr"] - expected_net) < 0.05
    
    # 3. Raise dispute
    disp = adapter.raise_dispute(
        pool_id="POOL-TOM-001",
        buyer_id="B1",
        reason="Transit damage: 15% crushed crates on arrival"
    )
    assert disp["status"] == "DISPUTE_RAISED"
    assert disp["funds_status"] == "FROZEN_IN_NODAL_ACCOUNT"

def test_audit_traceability_hash_chain():
    # Genesis event
    AuditTraceabilityEngine.set_latest_hash("0" * 64)
    evt1 = AuditTraceabilityEngine.create_audit_record(
        action="LOT_REGISTERED",
        entity_type="LOT",
        entity_id="LOT-TOM-001",
        details="Farmer Ramesh Patil registered 450kg Tomato",
        actor_name="Ramesh Patil",
        actor_role="FARMER",
        last_hash=None
    )
    assert evt1["prev_hash"] == "0" * 64
    assert len(evt1["hash"]) == 64
    
    # Subsequent event
    evt2 = AuditTraceabilityEngine.create_audit_record(
        action="FPO_WEIGHED_AND_GRADED",
        entity_type="LOT",
        entity_id="LOT-TOM-001",
        details="Verified weight 448kg Grade A at Baramati Hub",
        actor_name="Saksham FPO Manager",
        actor_role="FPO_MANAGER",
        last_hash=evt1["hash"]
    )
    assert evt2["prev_hash"] == evt1["hash"]
    
    # Verify hash reproduces exactly
    recalculated = AuditTraceabilityEngine.calculate_event_hash(
        prev_hash=evt2["prev_hash"],
        timestamp=evt2["timestamp"],
        actor_name=evt2["actor_name"],
        actor_role=evt2["actor_role"],
        action=evt2["action"],
        entity_type=evt2["entity_type"],
        entity_id=evt2["entity_id"],
        details=evt2["details"]
    )
    assert recalculated == evt2["hash"]
    
    # Tampering with details changes hash (tamper evident)
    tampered = AuditTraceabilityEngine.calculate_event_hash(
        prev_hash=evt2["prev_hash"],
        timestamp=evt2["timestamp"],
        actor_name=evt2["actor_name"],
        actor_role=evt2["actor_role"],
        action=evt2["action"],
        entity_type=evt2["entity_type"],
        entity_id=evt2["entity_id"],
        details="TAMPERED DETAILS"
    )
    assert tampered != evt2["hash"]
