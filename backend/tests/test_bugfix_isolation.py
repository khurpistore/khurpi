"""Backend regression tests for the 3 bug fixes:
1) Users list AND Dashboard data must be project-scoped.
3) Categories endpoint must return list for default project + supports CRUD.
"""
import os
import time
import pytest
import requests

BASE_URL = ""
try:
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
except FileNotFoundError:
    pass
if not BASE_URL:
    BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def temp_project(session):
    name = f"TEST_ISO_{int(time.time())}"
    r = session.post(f"{API}/admin/projects", json={"name": name, "description": "iso test"}, timeout=30)
    assert r.status_code in (200, 201), r.text
    proj = r.json()
    pid = proj.get("id")
    assert pid and pid != "default"
    yield pid
    try:
        session.delete(f"{API}/admin/projects/{pid}", timeout=15)
    except Exception:
        pass


# -------- BUG 1a: /admin/users project-scoping --------
class TestUsersIsolation:
    def test_default_project_has_users(self, session):
        r = session.get(f"{API}/admin/users", headers={"X-Project-Id": "default"}, timeout=30)
        assert r.status_code == 200, r.text
        users = r.json()
        assert isinstance(users, list)
        assert len(users) >= 1, f"default project users empty (got {len(users)})"

    def test_new_project_has_no_users(self, session, temp_project):
        r = session.get(f"{API}/admin/users", headers={"X-Project-Id": temp_project}, timeout=30)
        assert r.status_code == 200, r.text
        users = r.json()
        assert isinstance(users, list)
        assert len(users) == 0, f"new project should be empty, got {len(users)} users"


# -------- BUG 1b: /admin/dashboard project-scoping --------
class TestDashboardIsolation:
    def test_default_dashboard_has_numbers(self, session):
        r = session.get(f"{API}/admin/dashboard", headers={"X-Project-Id": "default"}, timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        assert isinstance(d, dict)
        total_rev = d.get("total_revenue", 0) or d.get("revenue", 0)
        total_subs = d.get("total_subscriptions", 0) or d.get("total_subs", 0)
        assert (total_rev or 0) > 0 or (total_subs or 0) > 0, f"default dashboard empty: {d}"

    def test_new_project_dashboard_all_zero(self, session, temp_project):
        r = session.get(f"{API}/admin/dashboard", headers={"X-Project-Id": temp_project}, timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        for k, v in d.items():
            if isinstance(v, (int, float)):
                assert v == 0, f"new project dashboard field {k}={v} should be 0. Full: {d}"


# -------- BUG 3: /admin/categories works --------
class TestCategoriesEndpoint:
    def test_default_categories_listed(self, session):
        r = session.get(f"{API}/admin/categories", headers={"X-Project-Id": "default"}, timeout=30)
        if r.status_code == 404:
            r = session.get(f"{API}/categories", headers={"X-Project-Id": "default"}, timeout=30)
        assert r.status_code == 200, r.text
        cats = r.json()
        assert isinstance(cats, list)
        assert len(cats) >= 1, "default project should have at least 1 category"

    def test_new_project_categories_empty(self, session, temp_project):
        r = session.get(f"{API}/admin/categories", headers={"X-Project-Id": temp_project}, timeout=30)
        if r.status_code == 404:
            r = session.get(f"{API}/categories", headers={"X-Project-Id": temp_project}, timeout=30)
        assert r.status_code == 200, r.text
        cats = r.json()
        assert isinstance(cats, list)
        assert len(cats) == 0, f"new project should have 0 categories, got {len(cats)}"

    def test_category_crud_in_temp_project(self, session, temp_project):
        h = {"X-Project-Id": temp_project}
        payload = {"name": "TEST_CategoryA", "display_order": 1}
        r = session.post(f"{API}/admin/categories", json=payload, headers=h, timeout=30)
        assert r.status_code in (200, 201), r.text
        cat = r.json()
        cid = cat.get("id")
        assert cid
        r = session.get(f"{API}/admin/categories", headers=h, timeout=30)
        assert r.status_code == 200
        names = [c.get("name") for c in r.json()]
        assert "TEST_CategoryA" in names
        r = session.delete(f"{API}/admin/categories/{cid}", headers=h, timeout=30)
        assert r.status_code in (200, 204), r.text
