import io
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_farmer_auth_headers():
    res = client.post("/api/v1/auth/login", json={"phone": "9822100011", "password": "demo_password"})
    assert res.status_code == 200
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def get_buyer_auth_headers():
    res = client.post("/api/v1/auth/login", json={"phone": "0202687400", "password": "demo_password"})
    assert res.status_code == 200
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_crop_catalog_and_search():
    # 1. Full catalog
    res = client.get("/api/v1/crops/catalog")
    assert res.status_code == 200
    crops = res.json()
    assert len(crops) >= 10
    names = [c["name"] for c in crops]
    assert "Tomato" in names
    assert "Onion" in names
    assert "Potato" in names
    assert "Mango" in names
    assert "Grapes" in names
    assert "Soybean" in names
    assert "Cotton" in names
    assert "Wheat" in names
    assert "Rice" in names

    # 2. Search query 'Tom'
    s_res = client.get("/api/v1/crops/catalog/search?q=Tom")
    assert s_res.status_code == 200
    s_crops = s_res.json()
    assert len(s_crops) >= 1
    assert s_crops[0]["name"] == "Tomato"
    assert "Abhinav (Hybrid)" in s_crops[0]["varieties"]

    # 3. Search query 'mango'
    m_res = client.get("/api/v1/crops/catalog/search?q=mango")
    assert m_res.status_code == 200
    m_crops = m_res.json()
    assert len(m_crops) >= 1
    assert m_crops[0]["name"] == "Mango"

def test_crop_request_submission():
    headers = get_farmer_auth_headers()
    req_data = {
        "requested_crop_name": "Dragon Fruit",
        "variety": "Red Ruby",
        "category": "Fruit",
        "reason": "High demand in Pune exotic market"
    }
    res = client.post("/api/v1/crops/requests", json=req_data, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["requested_crop_name"] == "Dragon Fruit"
    assert data["status"] == "PENDING_REVIEW"

def test_product_photo_upload_and_validation():
    headers = get_farmer_auth_headers()

    # Valid JPEG image upload
    fake_img = io.BytesIO(b"\xff\xd8\xff\xe0\x00\x10JFIFfake_sample_image_bytes")
    res = client.post(
        "/api/v1/products/upload-photo",
        files={"file": ("harvest_top.jpg", fake_img, "image/jpeg")},
        data={"category": "TOP_VIEW"},
        headers=headers
    )
    assert res.status_code == 200
    data = res.json()
    assert data["category"] == "TOP_VIEW"
    assert "/uploads/products/" in data["image_url"]

    # Invalid empty upload
    empty_file = io.BytesIO(b"")
    e_res = client.post(
        "/api/v1/products/upload-photo",
        files={"file": ("empty.jpg", empty_file, "image/jpeg")},
        data={"category": "SIDE_VIEW"},
        headers=headers
    )
    assert e_res.status_code == 400

def test_product_full_lifecycle():
    headers = get_farmer_auth_headers()
    buyer_headers = get_buyer_auth_headers()

    # 1. Upload 3 photos (Top, Side, Crate)
    img_ids = []
    for cat in ["TOP_VIEW", "SIDE_VIEW", "LOT_VIEW"]:
        img_bytes = io.BytesIO(f"fake_{cat}_content_for_product".encode())
        up_res = client.post(
            "/api/v1/products/upload-photo",
            files={"file": (f"{cat.lower()}.jpg", img_bytes, "image/jpeg")},
            data={"category": cat},
            headers=headers
        )
        assert up_res.status_code == 200
        img_ids.append(up_res.json()["id"])

    # 2. Create Farmer Product as DRAFT
    create_payload = {
        "crop_name": "Tomato",
        "variety": "Abhinav (Hybrid)",
        "quantity": 600.0,
        "unit": "kg",
        "harvest_date": "2026-09-10",
        "packaging_type": "Plastic Crates (25kg)",
        "location_name": "Baramati Cluster Farm #4",
        "notes": "Optimal firm breaker stage for transport",
        "product_status": "DRAFT",
        "image_ids": img_ids,
        "asking_price_per_qtl": 2100.0
    }
    p_res = client.post("/api/v1/products", json=create_payload, headers=headers)
    assert p_res.status_code == 200
    product = p_res.json()
    prod_id = product["id"]
    assert product["product_status"] == "DRAFT"
    assert product["marketplace_visibility"] == "PRIVATE"
    assert len(product["images"]) == 3

    # 3. Verify product does NOT appear in Buyer Marketplace while DRAFT
    m_res = client.get("/api/v1/marketplace/products", headers=buyer_headers)
    assert m_res.status_code == 200
    buyer_prods = m_res.json()
    assert not any(p["id"] == prod_id for p in buyer_prods)

    # 4. Publish Product
    pub_res = client.post(f"/api/v1/products/{prod_id}/publish", headers=headers)
    assert pub_res.status_code == 200
    assert pub_res.json()["product_status"] == "PUBLISHED"
    assert pub_res.json()["marketplace_visibility"] == "PUBLIC"

    # 5. Buyer now sees published product in marketplace
    m_res2 = client.get("/api/v1/marketplace/products", headers=buyer_headers)
    assert m_res2.status_code == 200
    buyer_prods2 = m_res2.json()
    matched = next((p for p in buyer_prods2 if p["id"] == prod_id), None)
    assert matched is not None
    assert matched["crop_name"] == "Tomato"
    assert matched["quantity"] == 600.0
    assert "disclaimer" in matched
    for img in matched["images"]:
        assert img["farmer_id"] == "REDACTED"

    # 6. Farmer Withdraws Product from Marketplace
    w_res = client.post(f"/api/v1/products/{prod_id}/withdraw", headers=headers)
    assert w_res.status_code == 200
    assert w_res.json()["product_status"] == "WITHDRAWN"
    assert w_res.json()["marketplace_visibility"] == "PRIVATE"

    # 7. Verify product immediately disappears from Buyer Marketplace
    m_res3 = client.get("/api/v1/marketplace/products", headers=buyer_headers)
    assert m_res3.status_code == 200
    assert not any(p["id"] == prod_id for p in m_res3.json())

    # 8. Buyer opening product detail of withdrawn product receives 404
    b_detail = client.get(f"/api/v1/products/{prod_id}", headers=buyer_headers)
    assert b_detail.status_code == 404

    # 9. Farmer deleting a WITHDRAWN/PUBLISHED product is blocked (must archive instead)
    d_res = client.delete(f"/api/v1/products/{prod_id}", headers=headers)
    assert d_res.status_code == 400
    assert "Permanent deletion is allowed only for unpublished drafts" in d_res.json()["detail"]

    # 10. Farmer archives the withdrawn product
    arc_res = client.post(f"/api/v1/products/{prod_id}/archive", headers=headers)
    assert arc_res.status_code == 200
    assert arc_res.json()["product_status"] == "ARCHIVED"

def test_safe_draft_delete():
    headers = get_farmer_auth_headers()

    # Create pure draft product
    create_payload = {
        "crop_name": "Onion",
        "variety": "Unhali Red Garva",
        "quantity": 1000.0,
        "unit": "kg",
        "product_status": "DRAFT"
    }
    p_res = client.post("/api/v1/products", json=create_payload, headers=headers)
    assert p_res.status_code == 200
    draft_id = p_res.json()["id"]

    # Delete draft
    del_res = client.delete(f"/api/v1/products/{draft_id}", headers=headers)
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "SUCCESS"

    # Verify draft is gone from farmer list
    my_res = client.get("/api/v1/products/farmer/me", headers=headers)
    assert my_res.status_code == 200
    assert not any(p["id"] == draft_id for p in my_res.json())
