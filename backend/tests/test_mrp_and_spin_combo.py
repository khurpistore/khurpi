"""Batch A backend tests: Product MRP + Spin Wheel combo products.

Tests targeted at:
  - Product create/update/list preserving `mrp` alongside selling `price`
  - Legacy products without `mrp` returning mrp=null
  - Spin-wheel prizes persisting a `products` combo array + linked product_id
"""
import os
import uuid

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://july-branch.preview.emergentagent.com").rstrip("/")
ADMIN_USER = os.environ.get("ADMIN_USERNAME", "admin")
ADMIN_PASS = os.environ.get("ADMIN_PASSWORD", "Khurpi2026Secure")
PROJECT_ID = "default"


# ---------- shared fixtures ----------
@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json", "X-Project-Id": PROJECT_ID})
    return s


@pytest.fixture(scope="module")
def admin_token(api):
    r = api.post(f"{BASE_URL}/api/admin/login", json={"username": ADMIN_USER, "password": ADMIN_PASS})
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text}"
    body = r.json()
    tok = body.get("token") or body.get("access_token")
    assert tok, f"no token in login response: {body}"
    return tok


@pytest.fixture(scope="module")
def admin(api, admin_token):
    api.headers.update({"Authorization": f"Bearer {admin_token}"})
    return api


# ---------- module-scoped cleanup registry ----------
CREATED_PRODUCT_IDS = []


@pytest.fixture(scope="module", autouse=True)
def _cleanup(admin):
    yield
    for pid in CREATED_PRODUCT_IDS:
        try:
            admin.delete(f"{BASE_URL}/api/products/{pid}", timeout=15)
        except Exception:
            pass
    # Reset spin prizes to empty at end (tests will be self-contained)
    try:
        admin.post(f"{BASE_URL}/api/admin/spin-wheel/prizes", json=[], timeout=15)
    except Exception:
        pass


# ==========================================================
# Product MRP
# ==========================================================
class TestProductMRP:
    def _payload(self, name, price=99.0, mrp=120.0):
        return {
            "name": name,
            "image": "https://example.com/img.png",
            "benefit": "TEST product benefit",
            "price": price,
            "mrp": mrp,
            "wholesale_price": 80,
            "unit": "kg",
            "unit_value": 1,
            "price_per": "kg",
            "min_quantity": 0.25,
            "step_quantity": 0.25,
            "stock_quantity": 10,
            "active": True,
        }

    def test_create_product_with_mrp_persists(self, admin):
        name = f"TEST_MRP_PROD_{uuid.uuid4().hex[:8]}"
        payload = self._payload(name, price=99.0, mrp=120.0)
        r = admin.post(f"{BASE_URL}/api/products", json=payload)
        assert r.status_code == 200, f"create failed: {r.status_code} {r.text}"
        data = r.json()
        assert "id" in data and isinstance(data["id"], str)
        assert data["name"] == name
        assert data["price"] == 99.0
        assert data["mrp"] == 120.0, f"expected mrp=120, got {data.get('mrp')}"
        CREATED_PRODUCT_IDS.append(data["id"])

        # Round-trip: GET /api/products/{id}
        g = admin.get(f"{BASE_URL}/api/products/{data['id']}")
        assert g.status_code == 200
        gp = g.json()
        assert gp["price"] == 99.0
        assert gp["mrp"] == 120.0

    def test_list_products_returns_mrp(self, admin):
        # Create a marker product then verify listing surfaces its mrp
        name = f"TEST_MRP_LIST_{uuid.uuid4().hex[:8]}"
        payload = self._payload(name, price=49.0, mrp=79.0)
        r = admin.post(f"{BASE_URL}/api/products", json=payload)
        assert r.status_code == 200, r.text
        pid = r.json()["id"]
        CREATED_PRODUCT_IDS.append(pid)

        lr = admin.get(f"{BASE_URL}/api/products", params={"active_only": "false"})
        assert lr.status_code == 200
        items = lr.json()
        assert isinstance(items, list)
        found = next((p for p in items if p.get("id") == pid), None)
        assert found is not None, "created product not in listing"
        assert found.get("mrp") == 79.0
        assert found.get("price") == 49.0

    def test_update_product_mrp(self, admin):
        # Create then PUT to change mrp
        name = f"TEST_MRP_UPD_{uuid.uuid4().hex[:8]}"
        r = admin.post(f"{BASE_URL}/api/products", json=self._payload(name, price=100.0, mrp=150.0))
        assert r.status_code == 200, r.text
        pid = r.json()["id"]
        CREATED_PRODUCT_IDS.append(pid)

        u = admin.put(f"{BASE_URL}/api/products/{pid}", json={"mrp": 199.5, "price": 129.0})
        assert u.status_code == 200, u.text
        ub = u.json()
        assert ub["mrp"] == 199.5
        assert ub["price"] == 129.0

        # Persistence check
        g = admin.get(f"{BASE_URL}/api/products/{pid}")
        assert g.status_code == 200
        gb = g.json()
        assert gb["mrp"] == 199.5
        assert gb["price"] == 129.0

    def test_create_product_without_mrp_returns_null(self, admin):
        # Legacy behaviour: create with mrp field omitted → response mrp must be None/null
        name = f"TEST_MRP_NONE_{uuid.uuid4().hex[:8]}"
        payload = self._payload(name)
        payload.pop("mrp", None)
        r = admin.post(f"{BASE_URL}/api/products", json=payload)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body.get("mrp") is None, f"expected mrp=None for legacy product, got {body.get('mrp')}"
        assert body.get("price") == 99.0
        CREATED_PRODUCT_IDS.append(body["id"])

        # GET single also mrp:null
        g = admin.get(f"{BASE_URL}/api/products/{body['id']}")
        assert g.status_code == 200
        assert g.json().get("mrp") is None

    def test_products_endpoint_public_get_returns_mrp(self, api):
        # Unauthenticated (no admin token) GET /api/products must still surface mrp
        # Use a plain client so we don't leak the admin auth header
        plain = requests.Session()
        plain.headers.update({"Content-Type": "application/json", "X-Project-Id": PROJECT_ID})
        lr = plain.get(f"{BASE_URL}/api/products", params={"active_only": "false"})
        assert lr.status_code == 200
        # Any product created earlier in the module should be listed & carry mrp key
        items = lr.json()
        assert isinstance(items, list) and len(items) > 0
        # mrp key must be present on every returned Product (even if None)
        for p in items[:20]:
            assert "mrp" in p, f"mrp missing on product {p.get('id')}"


# ==========================================================
# Spin Wheel Combo
# ==========================================================
class TestSpinWheelCombo:
    def _seed_products(self, admin, n=3):
        ids = []
        for i in range(n):
            name = f"TEST_SPIN_PROD_{i}_{uuid.uuid4().hex[:6]}"
            payload = {
                "name": name,
                "image": "https://example.com/x.png",
                "benefit": "test",
                "price": 10 + i,
                "mrp": 20 + i,
                "unit": "g",
                "unit_value": 250,
                "price_per": "kg",
                "min_quantity": 250,
                "step_quantity": 250,
                "stock_quantity": 100,
                "active": True,
            }
            r = admin.post(f"{BASE_URL}/api/products", json=payload)
            assert r.status_code == 200, r.text
            pid = r.json()["id"]
            CREATED_PRODUCT_IDS.append(pid)
            ids.append((pid, name))
        return ids

    def test_save_and_get_spin_prizes_with_combo(self, admin):
        seeded = self._seed_products(admin, n=3)
        p1, n1 = seeded[0]
        p2, n2 = seeded[1]
        p3, n3 = seeded[2]

        prizes = [
            {
                "name": "Combo Delight",
                "product_id": p1,  # linked primary product
                "quantity": 250,
                "unit": "g",
                "color": "#4CAF50",
                "is_empty": False,
                "products": [
                    {"product_id": p1, "name": n1, "quantity": 250, "unit": "g"},
                    {"product_id": p2, "name": n2, "quantity": 100, "unit": "g"},
                ],
            },
            {
                "name": "Better Luck!",
                "product_id": None,
                "quantity": 0,
                "unit": "g",
                "color": "#9E9E9E",
                "is_empty": True,
                "products": [],
            },
            {
                "name": "Single",
                "product_id": p3,
                "quantity": 500,
                "unit": "g",
                "color": "#FF9800",
                "is_empty": False,
                "products": [],
            },
        ]
        r = admin.post(f"{BASE_URL}/api/admin/spin-wheel/prizes", json=prizes)
        assert r.status_code == 200, f"save prizes failed: {r.status_code} {r.text}"
        body = r.json()
        assert body.get("count") == 3

        # Now GET (unauthenticated allowed)
        plain = requests.Session()
        plain.headers.update({"X-Project-Id": PROJECT_ID})
        g = plain.get(f"{BASE_URL}/api/spin-wheel/prizes")
        assert g.status_code == 200
        got = g.json()
        assert isinstance(got, list)
        assert len(got) == 3, f"expected 3 saved prizes, got {len(got)}"

        # Order preservation (server assigns order = index)
        by_name = {p["name"]: p for p in got}
        assert "Combo Delight" in by_name
        combo = by_name["Combo Delight"]
        assert combo["product_id"] == p1
        assert isinstance(combo.get("products"), list)
        assert len(combo["products"]) == 2
        combo_ids = [it["product_id"] for it in combo["products"]]
        assert p1 in combo_ids and p2 in combo_ids

        # Empty combo prize
        assert by_name["Better Luck!"]["is_empty"] is True
        assert by_name["Better Luck!"].get("products") == []

        # Single (no combo) product still has products key = []
        single = by_name["Single"]
        assert single["product_id"] == p3
        assert single.get("products") == []

    def test_save_empty_prizes_returns_defaults_on_get(self, admin):
        r = admin.post(f"{BASE_URL}/api/admin/spin-wheel/prizes", json=[])
        assert r.status_code == 200
        # When collection empty for the project, backend returns defaults list
        g = requests.get(f"{BASE_URL}/api/spin-wheel/prizes", headers={"X-Project-Id": PROJECT_ID})
        assert g.status_code == 200
        got = g.json()
        assert isinstance(got, list) and len(got) > 0

    def test_admin_endpoints_require_auth(self):
        # No Authorization header → 401
        r = requests.post(
            f"{BASE_URL}/api/admin/spin-wheel/prizes",
            json=[],
            headers={"X-Project-Id": PROJECT_ID, "Content-Type": "application/json"},
        )
        assert r.status_code == 401

        r2 = requests.post(
            f"{BASE_URL}/api/products",
            json={"name": "x", "image": "x", "benefit": "x", "price": 1},
            headers={"X-Project-Id": PROJECT_ID, "Content-Type": "application/json"},
        )
        assert r2.status_code == 401
