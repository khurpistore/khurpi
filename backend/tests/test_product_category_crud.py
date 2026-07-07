"""
Backend regression tests for Product Category CRUD via admin.

Covers:
- READ:   GET /api/products returns category_name resolved from category_id
- CREATE: POST /api/products with category_id -> GET shows category_name
- UPDATE: PUT /api/products/{id} with category_id (change / unset) -> GET reflects it
- DELETE: cleanup TEST_ products
- Multi-tenant scoping: /admin/categories is scoped by X-Project-Id
"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"


# ---- Fixtures ----
@pytest.fixture(scope="module")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def default_project_id(api_client):
    r = api_client.get(f"{API}/admin/projects")
    assert r.status_code == 200, r.text
    projects = r.json()
    assert isinstance(projects, list) and len(projects) > 0, "No projects found"
    # Default (Khurpi) project card
    default = next((p for p in projects if p.get("is_default")), projects[0])
    return default["id"]


@pytest.fixture(scope="module")
def scoped_client(api_client, default_project_id):
    api_client.headers.update({"X-Project-Id": default_project_id})
    return api_client


@pytest.fixture(scope="module")
def categories(scoped_client):
    r = scoped_client.get(f"{API}/admin/categories")
    assert r.status_code == 200, r.text
    cats = r.json()
    assert isinstance(cats, list) and len(cats) >= 2, "Need at least 2 categories to test change"
    return cats


@pytest.fixture(scope="module")
def created_product_ids():
    """Track products created by tests so we can delete them on teardown."""
    ids = []
    yield ids
    # Best-effort cleanup
    s = requests.Session()
    project_id = None
    try:
        pr = s.get(f"{API}/admin/projects").json()
        default = next((p for p in pr if p.get("is_default")), pr[0])
        project_id = default["id"]
    except Exception:
        pass
    for pid in ids:
        try:
            headers = {"Content-Type": "application/json"}
            if project_id:
                headers["X-Project-Id"] = project_id
            s.delete(f"{API}/products/{pid}", headers=headers)
        except Exception:
            pass


# ---- Health / auth ----
class TestAdminAuth:
    def test_admin_login_ok(self, api_client):
        r = api_client.post(
            f"{API}/admin/login",
            params={"username": "admin", "password": "Khurpi2026Secure"},
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("success") is True
        assert data.get("role") == "admin"

    def test_admin_login_bad(self, api_client):
        r = api_client.post(
            f"{API}/admin/login",
            params={"username": "admin", "password": "wrong"},
        )
        assert r.status_code == 401


# ---- Category read on product list ----
class TestProductCategoryRead:
    def test_products_include_category_name(self, scoped_client, categories):
        r = scoped_client.get(f"{API}/products?active_only=false")
        assert r.status_code == 200, r.text
        products = r.json()
        assert isinstance(products, list)
        cat_map = {c["id"]: c["name"] for c in categories}
        # For any product with category_id, category_name must resolve.
        matched = 0
        for p in products:
            if p.get("category_id"):
                assert (
                    p.get("category_name") == cat_map.get(p["category_id"])
                ), f"category_name mismatch for product {p.get('id')}: got {p.get('category_name')}, expected {cat_map.get(p['category_id'])}"
                matched += 1
        # We don't require any specific number, but if there are any, at least one should be resolved
        # (informational; not a hard fail if no product has category yet)


# ---- Create with category ----
class TestProductCreateWithCategory:
    def test_create_product_with_category(self, scoped_client, categories, created_product_ids):
        cat = categories[0]
        payload = {
            "name": f"TEST_CatProd_{uuid.uuid4().hex[:8]}",
            "benefit": "Test benefit for category CRUD",
            "nutrients": "Vitamins",
            "price": 99.5,
            "unit_value": 100,
            "unit": "gm",
            "weight": 100,
            "growth_days": 7,
            "stock_status": "in_stock",
            "active": True,
            "category_id": cat["id"],
            "image": "https://example.com/x.jpg",
        }
        r = scoped_client.post(f"{API}/products", json=payload)
        assert r.status_code in (200, 201), r.text
        created = r.json()
        assert created.get("category_id") == cat["id"]
        pid = created["id"]
        created_product_ids.append(pid)

        # GET verifies category_name resolved
        r2 = scoped_client.get(f"{API}/products?active_only=false")
        assert r2.status_code == 200
        product = next((p for p in r2.json() if p["id"] == pid), None)
        assert product is not None, "Newly created product missing from list"
        assert product.get("category_id") == cat["id"]
        assert product.get("category_name") == cat["name"]

    def test_create_product_uncategorized(self, scoped_client, created_product_ids):
        payload = {
            "name": f"TEST_UncatProd_{uuid.uuid4().hex[:8]}",
            "benefit": "Uncategorized product",
            "nutrients": "None",
            "price": 10.0,
            "unit_value": 50,
            "unit": "gm",
            "weight": 50,
            "growth_days": 5,
            "stock_status": "in_stock",
            "active": True,
            "image": "https://example.com/y.jpg",
        }
        r = scoped_client.post(f"{API}/products", json=payload)
        assert r.status_code in (200, 201), r.text
        p = r.json()
        assert p.get("category_id") in (None, "", None)
        created_product_ids.append(p["id"])

        # GET reflects no category_name
        r2 = scoped_client.get(f"{API}/products?active_only=false")
        product = next((x for x in r2.json() if x["id"] == p["id"]), None)
        assert product is not None
        assert not product.get("category_name")


# ---- Update / inline change ----
class TestProductCategoryUpdate:
    def test_update_product_category_change(self, scoped_client, categories, created_product_ids):
        assert len(categories) >= 2, "Need >=2 categories"
        cat_a, cat_b = categories[0], categories[1]

        # Create with cat A
        payload = {
            "name": f"TEST_ChangeCat_{uuid.uuid4().hex[:8]}",
            "benefit": "change category",
            "nutrients": "N",
            "price": 25.0,
            "unit_value": 100,
            "unit": "gm",
            "weight": 100,
            "growth_days": 6,
            "stock_status": "in_stock",
            "active": True,
            "category_id": cat_a["id"],
            "image": "https://example.com/z.jpg",
        }
        r = scoped_client.post(f"{API}/products", json=payload)
        assert r.status_code in (200, 201)
        pid = r.json()["id"]
        created_product_ids.append(pid)

        # PUT to change to cat B (mimic inline-save from AdminProducts: full product + category_id)
        update_body = {**payload, "id": pid, "category_id": cat_b["id"]}
        r2 = scoped_client.put(f"{API}/products/{pid}", json=update_body)
        assert r2.status_code == 200, r2.text

        # Refetch and confirm both category_id and category_name changed
        r3 = scoped_client.get(f"{API}/products?active_only=false")
        product = next((x for x in r3.json() if x["id"] == pid), None)
        assert product is not None
        assert product["category_id"] == cat_b["id"]
        assert product["category_name"] == cat_b["name"]

    def test_update_product_to_uncategorized(self, scoped_client, categories, created_product_ids):
        cat = categories[0]
        payload = {
            "name": f"TEST_ToUncat_{uuid.uuid4().hex[:8]}",
            "benefit": "to uncategorized",
            "nutrients": "N",
            "price": 15.0,
            "unit_value": 100,
            "unit": "gm",
            "weight": 100,
            "growth_days": 6,
            "stock_status": "in_stock",
            "active": True,
            "category_id": cat["id"],
            "image": "https://example.com/u.jpg",
        }
        r = scoped_client.post(f"{API}/products", json=payload)
        assert r.status_code in (200, 201)
        pid = r.json()["id"]
        created_product_ids.append(pid)

        # PUT setting category_id to None (frontend sends null)
        update_body = {**payload, "id": pid, "category_id": None}
        r2 = scoped_client.put(f"{API}/products/{pid}", json=update_body)
        assert r2.status_code == 200, r2.text

        r3 = scoped_client.get(f"{API}/products?active_only=false")
        product = next((x for x in r3.json() if x["id"] == pid), None)
        assert product is not None
        assert not product.get("category_id")
        assert not product.get("category_name")


# ---- Multi-tenant scoping ----
class TestCategoryScoping:
    def test_categories_scoped_by_project(self, api_client, default_project_id):
        # Create a temp project
        new_proj = api_client.post(
            f"{API}/admin/projects",
            json={"name": f"TEST_CatScopeProj_{uuid.uuid4().hex[:6]}"},
            headers={"Content-Type": "application/json"},
        )
        assert new_proj.status_code in (200, 201), new_proj.text
        new_pid = new_proj.json()["id"]

        try:
            # Default project categories
            r_default = api_client.get(
                f"{API}/admin/categories",
                headers={"X-Project-Id": default_project_id},
            )
            assert r_default.status_code == 200
            default_cats = r_default.json()

            # New project's categories (should be empty)
            r_new = api_client.get(
                f"{API}/admin/categories", headers={"X-Project-Id": new_pid}
            )
            assert r_new.status_code == 200
            new_cats = r_new.json()

            default_ids = {c["id"] for c in default_cats}
            new_ids = {c["id"] for c in new_cats}
            assert (
                default_ids.isdisjoint(new_ids) or len(new_ids) == 0
            ), "Categories should be project-scoped"
        finally:
            api_client.delete(f"{API}/admin/projects/{new_pid}")
