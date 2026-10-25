import io
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"
    assert "KrishiSetu" in data["service"]

def test_auth_login_demo():
    # Login as Farmer Ramesh Patil
    res = client.post("/api/v1/auth/login", json={"phone": "9822100011", "password": "demo_password"})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["role"] == "FARMER"
    assert data["name"] == "Ramesh Patil"
    
    # Check /auth/me with Bearer token
    headers = {"Authorization": f"Bearer {data['access_token']}"}
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["name"] == "Ramesh Patil"
    assert me_data["role"] == "FARMER"

def test_vision_quality_and_grading():
    # Create fake image bytes
    fake_img = io.BytesIO(b"fake_tomato_crate_image_data_stream_for_unit_testing")
    fake_img.name = "tomato.jpg"
    
    res = client.post(
        "/api/v1/vision/analyze",
        files={"file": ("tomato.jpg", fake_img, "image/jpeg")}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["blur_passed"] is True
    assert data["estimated_grade"] in ["Grade A", "Grade B", "Grade C"]
    assert "External visual-quality estimate only" in data["disclaimer"]

def test_market_prices_feed():
    res = client.get("/api/v1/market/prices")
    assert res.status_code == 200
    prices = res.json()
    assert len(prices) >= 3 # Baramati, Pune, Solapur
    mandis = [p["mandi"] for p in prices]
    assert "Baramati APMC" in mandis
    assert "Pune Gultekdi Market Yard" in mandis

def test_net_realization_calculator():
    payload = {
        "mandi_id": "M1",
        "quantity_kg": 450.0,
        "freight_rate_per_km": 15.0,
        "handling_fee": 180.0,
        "packaging_fee": 150.0,
        "commission_pct": 5.0,
        "spoilage_pct": 2.0,
        "is_pooled": False
    }
    res = client.post("/api/v1/market/net-realization", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["mandi_name"] == "Baramati APMC"
    assert data["gross_revenue_inr"] == 8325.0
    assert data["net_realization_inr"] > 0
    assert data["net_per_quintal_inr"] < 1850.0 # because of deductions

def test_price_forecast_and_sale_advisor():
    # Forecast
    f_res = client.get("/api/v1/market/forecast?crop=Tomato&mandi=Baramati%20APMC")
    assert f_res.status_code == 200
    f_data = f_res.json()
    assert f_data["model_name"] == "LightGBM-Quantile-Regressor"
    assert len(f_data["forecast_points"]) == 6
    
    # Advise
    a_res = client.get("/api/v1/market/sale-advisor?risk_preference=balanced")
    assert a_res.status_code == 200
    a_data = a_res.json()
    assert a_data["recommended_action"] == "Wait 3 Days"
    assert "perishability_warning" in a_data

def test_pools_listing_and_joining():
    # Login to get token
    login_res = client.post("/api/v1/auth/login", json={"phone": "9822100011", "password": "demo_password"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # List pools
    res = client.get("/api/v1/pools")
    assert res.status_code == 200
    pools = res.json()
    assert len(pools) > 0
    
    target_pool = pools[0]
    pool_id = target_pool["id"]
    
    # Join pool
    join_payload = {
        "lot_id": "LOT-TOM-TEST"
    }
    join_res = client.post(f"/api/v1/pools/{pool_id}/join", json=join_payload, headers=headers)
    assert join_res.status_code == 200
    join_data = join_res.json()
    assert join_data["current_kg"] >= target_pool["current_kg"]

def test_logistics_route_plan():
    res = client.get("/api/v1/logistics/route-plan")
    assert res.status_code == 200
    route = res.json()
    assert route["route_id"] == "ROUTE-BARAMATI-NORTH-01"
    assert route["load_utilization_pct"] > 0
    assert len(route["stops"]) > 0

def test_audit_events_stream():
    res = client.get("/api/v1/audit/events")
    assert res.status_code == 200
    events = res.json()
    assert isinstance(events, list)
    assert len(events) > 0
    for evt in events:
        assert "hash" in evt
        assert len(evt["hash"]) == 64

def test_audit_ledger_cryptographic_verification():
    res = client.get("/api/v1/audit/verify")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "VALID"
    assert data["is_valid"] is True
    assert "SHA-256" in data["cryptographic_algorithm"]

def test_audit_ledger_tamper_detection_simulation():
    res = client.post("/api/v1/audit/test-tamper")
    assert res.status_code == 200
    data = res.json()
    assert data["simulation_mode"] == "SIH_LIVE_JURY_TAMPER_TEST"
    assert data["verification_result"]["status"] == "TAMPER_DETECTED"
    assert data["verification_result"]["is_valid"] is False
    assert "tampered" in data["verification_result"]["error_reason"].lower()
