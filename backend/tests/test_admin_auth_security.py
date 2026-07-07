"""Security hardening tests (Phase 1): JWT-based admin authentication.

Verifies:
- POST /api/admin/login accepts JSON creds and returns a JWT token; wrong creds -> 401.
- /api/admin/* (except /login) requires Bearer token.
- POST /api/products, PUT/DELETE /api/products/{id} require Bearer token.
- Public reads (GET /api/products, GET /api/categories) remain open without token.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://july-branch.preview.emergentagent.com").rstrip("/")
ADMIN_USER = "admin"
ADMIN_PASS = "Khurpi2026Secure"


@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def admin_token(api):
    r = api.post(f"{BASE_URL}/api/admin/login", json={"username": ADMIN_USER, "password": ADMIN_PASS})
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "token" in data and isinstance(data["token"], str) and len(data["token"]) > 20
    assert data.get("role") == "admin"
    return data["token"]


# ---------- Admin login ----------
class TestAdminLogin:
    def test_login_success_returns_jwt(self, api):
        r = api.post(f"{BASE_URL}/api/admin/login", json={"username": ADMIN_USER, "password": ADMIN_PASS})
        assert r.status_code == 200
        body = r.json()
        assert body["success"] is True
        assert body["role"] == "admin"
        assert isinstance(body["token"], str) and body["token"].count(".") == 2  # looks like JWT

    def test_login_wrong_password(self, api):
        r = api.post(f"{BASE_URL}/api/admin/login", json={"username": ADMIN_USER, "password": "WRONG"})
        assert r.status_code == 401

    def test_login_wrong_username(self, api):
        r = api.post(f"{BASE_URL}/api/admin/login", json={"username": "nope", "password": ADMIN_PASS})
        assert r.status_code == 401

    def test_login_missing_body(self, api):
        r = api.post(f"{BASE_URL}/api/admin/login", json={})
        assert r.status_code in (400, 422)


# ---------- Middleware enforcement on /api/admin/* ----------
class TestAdminRoutesProtected:
    def test_dashboard_without_token(self, api):
        r = requests.get(f"{BASE_URL}/api/admin/dashboard")
        assert r.status_code == 401

    def test_dashboard_with_token(self, api, admin_token):
        r = requests.get(f"{BASE_URL}/api/admin/dashboard", headers={"Authorization": f"Bearer {admin_token}"})
        assert r.status_code == 200
        # Should have dashboard-ish payload
        data = r.json()
        assert isinstance(data, dict)

    def test_dashboard_with_malformed_token(self, api):
        r = requests.get(f"{BASE_URL}/api/admin/dashboard", headers={"Authorization": "Bearer not.a.jwt"})
        assert r.status_code == 401

    def test_dashboard_with_customer_role_token(self, api):
        # A customer-role token (if we can obtain one) must not pass admin middleware.
        # We simulate by sending a random string - should still 401.
        r = requests.get(f"{BASE_URL}/api/admin/dashboard", headers={"Authorization": "Bearer abcdef"})
        assert r.status_code == 401

    def test_clear_database_without_token(self, api):
        r = requests.post(f"{BASE_URL}/api/admin/clear-database")
        assert r.status_code == 401

    def test_random_admin_route_without_token(self, api):
        # Any admin route should be protected
        for path in ["/api/admin/orders", "/api/admin/users", "/api/admin/products",
                     "/api/admin/expenses", "/api/admin/analytics"]:
            r = requests.get(f"{BASE_URL}{path}")
            assert r.status_code == 401, f"{path} did NOT require auth, got {r.status_code}"


# ---------- Product write protection ----------
class TestProductWriteProtection:
    def test_post_product_without_token(self, api):
        r = requests.post(
            f"{BASE_URL}/api/products",
            json={"name": "TEST_unauth", "price": 10, "unit": 1, "unit_type": "kg", "quantity_gm": 1000},
            headers={"X-Project-Id": "default"},
        )
        assert r.status_code == 401

    def test_put_product_without_token(self, api):
        r = requests.put(
            f"{BASE_URL}/api/products/nonexistent-id",
            json={"price": 20},
            headers={"X-Project-Id": "default"},
        )
        assert r.status_code == 401

    def test_delete_product_without_token(self, api):
        r = requests.delete(f"{BASE_URL}/api/products/nonexistent-id", headers={"X-Project-Id": "default"})
        assert r.status_code == 401


# ---------- Public reads open ----------
class TestPublicEndpointsOpen:
    def test_get_products_open(self, api):
        r = requests.get(f"{BASE_URL}/api/products", headers={"X-Project-Id": "default"})
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_get_categories_open(self, api):
        r = requests.get(f"{BASE_URL}/api/categories", headers={"X-Project-Id": "default"})
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ---------- CRUD end-to-end with token ----------
class TestAdminCRUDWithToken:
    def test_create_and_delete_category_authenticated(self, admin_token):
        headers = {"Authorization": f"Bearer {admin_token}", "X-Project-Id": "default",
                   "Content-Type": "application/json"}
        payload = {"name": "TEST_AuthCat_SEC", "icon": "🧪"}
        r = requests.post(f"{BASE_URL}/api/admin/categories", json=payload, headers=headers)
        assert r.status_code in (200, 201), f"create failed: {r.status_code} {r.text}"
        cid = r.json().get("id")
        assert cid
        # Cleanup
        d = requests.delete(f"{BASE_URL}/api/admin/categories/{cid}", headers=headers)
        assert d.status_code in (200, 204)

    def test_update_product_price_authenticated(self, admin_token):
        headers = {"Authorization": f"Bearer {admin_token}", "X-Project-Id": "default",
                   "Content-Type": "application/json"}
        # Create a product to update
        create = {"name": "TEST_AuthProd_SEC", "price": 12.5, "unit": "1kg", "unit_type": "kg",
                  "quantity_gm": 1000, "image": "https://example.com/x.png", "benefit": "test"}
        r = requests.post(f"{BASE_URL}/api/products", json=create, headers=headers)
        assert r.status_code in (200, 201), f"create failed: {r.status_code} {r.text}"
        pid = r.json().get("id")
        assert pid
        try:
            # Update price with token -> 200
            u = requests.put(f"{BASE_URL}/api/products/{pid}", json={"price": 99.99}, headers=headers)
            assert u.status_code == 200
            # Update without token -> 401
            u2 = requests.put(f"{BASE_URL}/api/products/{pid}", json={"price": 55}, headers={"X-Project-Id": "default"})
            assert u2.status_code == 401
            # Verify persisted new price (99.99), not 55
            g = requests.get(f"{BASE_URL}/api/products/{pid}", headers={"X-Project-Id": "default"})
            assert g.status_code == 200
            assert float(g.json()["price"]) == 99.99
        finally:
            requests.delete(f"{BASE_URL}/api/products/{pid}", headers=headers)
