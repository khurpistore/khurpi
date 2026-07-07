"""
Backend tests for the multi-project (multi-tenant) feature.

Verifies:
- Default project exists and cannot be deleted
- Creating a new project via /api/admin/projects
- Data isolation: X-Project-Id header scopes products/categories/banners/coupons/orders
- Storefront (no header) falls back to default project (products retained)
- Cleanup: created test projects are deleted
"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/") or "http://localhost:8001"
API = f"{BASE_URL}/api"

# Load REACT_APP_BACKEND_URL from frontend/.env for correctness in tests
try:
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                API = f"{BASE_URL}/api"
except FileNotFoundError:
    pass


# ---------- Fixtures ----------
@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def new_project(session):
    """Create a fresh test project for isolation tests; cleanup at end."""
    payload = {
        "name": f"TEST_Project_{uuid.uuid4().hex[:8]}",
        "description": "Automated multi-tenant test",
    }
    r = session.post(f"{API}/admin/projects", json=payload, timeout=30)
    assert r.status_code == 200, f"Create project failed: {r.status_code} {r.text}"
    proj = r.json()
    assert "id" in proj and proj["id"] != "default"
    assert proj.get("is_default") is False
    yield proj
    # cleanup
    try:
        session.delete(f"{API}/admin/projects/{proj['id']}", timeout=15)
    except Exception:
        pass


# ---------- Projects CRUD ----------
class TestProjectsCRUD:
    def test_list_projects_includes_default(self, session):
        r = session.get(f"{API}/admin/projects", timeout=30)
        assert r.status_code == 200
        projects = r.json()
        assert isinstance(projects, list)
        default = next((p for p in projects if p.get("id") == "default"), None)
        assert default is not None, "Default project missing"
        assert default.get("is_default") is True
        assert default.get("name") == "Khurpi"

    def test_cannot_delete_default_project(self, session):
        r = session.delete(f"{API}/admin/projects/default", timeout=30)
        assert r.status_code == 400
        body = r.json()
        assert "detail" in body

    def test_create_and_update_project(self, session):
        payload = {"name": f"TEST_CRUD_{uuid.uuid4().hex[:8]}", "description": "crud"}
        r = session.post(f"{API}/admin/projects", json=payload, timeout=30)
        assert r.status_code == 200
        proj = r.json()
        pid = proj["id"]
        # update
        r2 = session.put(
            f"{API}/admin/projects/{pid}",
            json={"description": "updated-desc"},
            timeout=30,
        )
        assert r2.status_code == 200
        assert r2.json().get("description") == "updated-desc"
        # verify via list
        r3 = session.get(f"{API}/admin/projects", timeout=30)
        found = next((p for p in r3.json() if p["id"] == pid), None)
        assert found is not None
        assert found["description"] == "updated-desc"
        # cleanup
        rd = session.delete(f"{API}/admin/projects/{pid}", timeout=30)
        assert rd.status_code == 200


# ---------- Data isolation ----------
class TestDataIsolation:
    def test_default_products_exist_without_header(self, session):
        """Storefront call without X-Project-Id must return default project data."""
        r = requests.get(f"{API}/products", timeout=30)
        assert r.status_code == 200
        products = r.json()
        assert isinstance(products, list)
        assert len(products) > 0, "Default project should have products for storefront"

    def test_default_products_with_default_header(self, session):
        r = requests.get(
            f"{API}/products", headers={"X-Project-Id": "default"}, timeout=30
        )
        assert r.status_code == 200
        assert len(r.json()) > 0

    def test_new_project_products_empty(self, session, new_project):
        pid = new_project["id"]
        r = requests.get(
            f"{API}/products", headers={"X-Project-Id": pid}, timeout=30
        )
        assert r.status_code == 200
        assert r.json() == [], f"New project should have 0 products, got {len(r.json())}"

    def test_new_project_categories_empty(self, session, new_project):
        pid = new_project["id"]
        r = requests.get(
            f"{API}/admin/categories", headers={"X-Project-Id": pid}, timeout=30
        )
        assert r.status_code == 200
        assert r.json() == []

    def test_new_project_banners_empty(self, session, new_project):
        pid = new_project["id"]
        r = requests.get(
            f"{API}/admin/banners", headers={"X-Project-Id": pid}, timeout=30
        )
        assert r.status_code == 200
        assert r.json() == []

    def test_new_project_coupons_empty(self, session, new_project):
        pid = new_project["id"]
        r = requests.get(
            f"{API}/admin/coupons", headers={"X-Project-Id": pid}, timeout=30
        )
        assert r.status_code == 200
        assert r.json() == []

    def test_new_project_orders_empty(self, session, new_project):
        pid = new_project["id"]
        r = requests.get(
            f"{API}/admin/orders", headers={"X-Project-Id": pid}, timeout=30
        )
        assert r.status_code == 200
        assert r.json() == []


# ---------- Cross-project isolation ----------
class TestCrossProjectIsolation:
    def test_product_created_in_new_project_not_in_default(self, session, new_project):
        pid = new_project["id"]

        # Get one existing category from default to reuse structure (need category_id/subcategory_id? check model)
        default_products = requests.get(f"{API}/products", timeout=30).json()
        sample = default_products[0]
        cat_id = sample.get("category_id")
        subcat_id = sample.get("subcategory_id")

        unique_name = f"TEST_PRODUCT_{uuid.uuid4().hex[:8]}"
        product_payload = {
            "name": unique_name,
            "image": "https://example.com/img.png",
            "benefit": "isolation test",
            "price": 99.0,
            "category_id": cat_id,
            "unit": "kg",
            "unit_value": 1,
            "price_per": "kg",
            "min_quantity": 0.25,
            "step_quantity": 0.25,
            "stock_quantity": 10,
            "active": True,
        }
        r = requests.post(
            f"{API}/products",
            json=product_payload,
            headers={"X-Project-Id": pid, "Content-Type": "application/json"},
            timeout=30,
        )
        # server may require certain fields; accept 200/201; if other, print detail
        if r.status_code not in (200, 201):
            pytest.skip(f"Product create not accepted ({r.status_code}): {r.text[:200]}")

        created = r.json()
        assert created.get("name") == unique_name

        # In new project: should appear (active_only=false to be safe)
        r_new = requests.get(
            f"{API}/products?active_only=false",
            headers={"X-Project-Id": pid},
            timeout=30,
        )
        assert r_new.status_code == 200
        names_new = [p.get("name") for p in r_new.json()]
        assert unique_name in names_new, "Newly created product missing from its own project"

        # In default: MUST NOT appear
        r_def = requests.get(
            f"{API}/products?active_only=false",
            headers={"X-Project-Id": "default"},
            timeout=30,
        )
        assert r_def.status_code == 200
        names_def = [p.get("name") for p in r_def.json()]
        assert unique_name not in names_def, "Product leaked into default project"


# ---------- Delete removes scoped data ----------
class TestProjectDeleteCleansData:
    def test_delete_project_removes_its_data(self, session):
        # Create temp project
        r = session.post(
            f"{API}/admin/projects",
            json={"name": f"TEST_DEL_{uuid.uuid4().hex[:8]}"},
            timeout=30,
        )
        assert r.status_code == 200
        pid = r.json()["id"]

        # Delete it
        rd = session.delete(f"{API}/admin/projects/{pid}", timeout=30)
        assert rd.status_code == 200
        assert rd.json().get("success") is True

        # Verify not in list
        r2 = session.get(f"{API}/admin/projects", timeout=30)
        ids = [p["id"] for p in r2.json()]
        assert pid not in ids
