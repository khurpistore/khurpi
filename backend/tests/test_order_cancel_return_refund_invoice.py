"""
Phase 2 & 3 tests: cancel / return / admin refund / invoice
Uses REACT_APP_BACKEND_URL from frontend/.env as the public base URL.
Admin JWT protected: /api/admin/*.
"""
import os
import uuid
import pytest
import requests
from datetime import datetime, timezone

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://july-branch.preview.emergentagent.com").rstrip("/")
ADMIN_USER = "admin"
ADMIN_PASS = "Khurpi2026Secure"


# ---------- Fixtures ----------

@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def admin_token(api):
    r = api.post(f"{BASE_URL}/api/admin/login", json={"username": ADMIN_USER, "password": ADMIN_PASS})
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="module")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "X-Project-Id": "default"}


@pytest.fixture(scope="module")
def sample_order_ids(api, admin_headers):
    """Pick a few real orders from the admin list to run scenarios on."""
    r = api.get(f"{BASE_URL}/api/admin/orders", headers=admin_headers)
    assert r.status_code == 200, r.text
    orders = r.json()
    return orders


# ---------- Admin auth on returns list ----------

class TestAdminReturnsAuth:
    def test_returns_requires_admin_token(self, api):
        r = api.get(f"{BASE_URL}/api/admin/returns")
        assert r.status_code == 401

    def test_returns_with_token_ok(self, api, admin_headers):
        r = api.get(f"{BASE_URL}/api/admin/returns", headers=admin_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ---------- Invoice endpoint (PUBLIC) ----------

class TestInvoicePublic:
    def test_invoice_returns_html(self, api, sample_order_ids):
        assert sample_order_ids, "No orders available to test invoice"
        order = sample_order_ids[0]
        oid = order["id"]
        r = api.get(f"{BASE_URL}/api/orders/{oid}/invoice")
        assert r.status_code == 200
        ctype = r.headers.get("content-type", "")
        assert "text/html" in ctype
        body = r.text
        assert "TAX INVOICE" in body
        assert "Total" in body
        # Should include some kind of Bill To line
        assert "Bill To" in body

    def test_invoice_no_token_needed(self, sample_order_ids):
        oid = sample_order_ids[0]["id"]
        r = requests.get(f"{BASE_URL}/api/orders/{oid}/invoice")
        assert r.status_code == 200


# ---------- Cancel flow ----------

class TestCancelOrder:
    def _find_cancellable(self, orders):
        for o in orders:
            if o.get("status") in ("pending", "confirmed", "preparing") and not o.get("cancel_reason"):
                return o
        return None

    def _find_non_cancellable(self, orders):
        for o in orders:
            if o.get("status") in ("delivered", "out_for_delivery", "cancelled"):
                return o
        return None

    def test_cancel_non_cancellable_returns_400(self, api, sample_order_ids):
        order = self._find_non_cancellable(sample_order_ids)
        if not order:
            pytest.skip("No delivered/out_for_delivery/cancelled order available")
        r = api.post(f"{BASE_URL}/api/orders/{order['id']}/cancel", json={"reason": "test"})
        assert r.status_code == 400

    def test_cancel_cancellable_sets_status(self, api, admin_headers, sample_order_ids):
        order = self._find_cancellable(sample_order_ids)
        if not order:
            pytest.skip("No cancellable order available")
        r = api.post(f"{BASE_URL}/api/orders/{order['id']}/cancel", json={"reason": "TEST_cancel"})
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("status") == "cancelled"
        # Verify persisted
        v = api.get(f"{BASE_URL}/api/admin/orders", headers=admin_headers).json()
        found = next((o for o in v if o["id"] == order["id"]), None)
        assert found and found["status"] == "cancelled"


# ---------- Return flow ----------

class TestReturnOrder:
    def _find_delivered_no_return(self, orders):
        for o in orders:
            if o.get("status") == "delivered" and not o.get("return_status"):
                return o
        return None

    def test_return_non_delivered_400(self, api, sample_order_ids):
        # any non-delivered
        target = next((o for o in sample_order_ids if o.get("status") != "delivered"), None)
        if not target:
            pytest.skip("No non-delivered order to test")
        r = api.post(f"{BASE_URL}/api/orders/{target['id']}/return", json={"reason": "test"})
        assert r.status_code == 400

    def test_return_delivered_ok(self, api, admin_headers, sample_order_ids):
        target = self._find_delivered_no_return(sample_order_ids)
        if not target:
            pytest.skip("No delivered order without existing return")
        r = api.post(f"{BASE_URL}/api/orders/{target['id']}/return", json={"reason": "TEST_return"})
        assert r.status_code == 200, r.text
        assert r.json().get("return_status") == "requested"


# ---------- Admin refund flow ----------

class TestAdminRefund:
    def test_refund_requires_admin_token(self, api, sample_order_ids):
        oid = sample_order_ids[0]["id"]
        r = api.post(f"{BASE_URL}/api/admin/orders/{oid}/refund", json={})
        assert r.status_code == 401

    def test_refund_with_token(self, api, admin_headers, sample_order_ids):
        # Pick a cancelled or paid order to refund
        candidate = next((o for o in sample_order_ids if o.get("status") == "cancelled" or o.get("payment_status") == "paid" or o.get("return_status") == "requested"), None)
        if not candidate:
            pytest.skip("No refundable candidate found")
        r = api.post(f"{BASE_URL}/api/admin/orders/{candidate['id']}/refund", json={}, headers=admin_headers)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("refund_status") == "refunded"
        assert "refund_amount" in data
