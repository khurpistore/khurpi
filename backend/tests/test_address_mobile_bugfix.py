"""
Backend verification for Flutter mobile home-header address bug fix.

Bug context:
    Mobile home header was reading delivery address from the cached user object
    (authLocalDataSource.getUser().address). Fix: home page now reads header
    address ONLY from the address API (GET /users/{user_id}/addresses) and
    picks the address with is_default=true, else the first item.

These tests verify ONLY the backend contract the mobile client's new
loadDefaultAddress() logic depends on:
    1. GET /api/users/{user_id}/addresses returns a JSON list, each with
       an is_default boolean field.
    2. Full lifecycle: create -> add second -> set-default(second) -> GET
       returns EXACTLY ONE address with is_default=true and it's the one
       just set.
    3. When no address has is_default=true explicitly, GET still returns
       the list so the client can fall back to the first entry (list order
       must be stable/non-empty).
    4. DELETE removes the address from the subsequent GET list.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

# From /app/memory/test_credentials.md
TEST_PHONE = "9971818259"
TEST_PASSWORD = "test1234"


@pytest.fixture(scope="module")
def api():
    """Logged-in session + user_id for the mobile-parity test user."""
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    r = s.post(
        f"{BASE_URL}/api/auth/login",
        json={"phone": TEST_PHONE, "password": TEST_PASSWORD},
    )
    if r.status_code != 200:
        pytest.skip(f"Login failed: {r.status_code} {r.text}")
    payload = r.json()
    user = payload.get("user", payload)
    uid = user.get("id")
    assert uid, f"No user id in login response: {payload}"
    return s, uid


@pytest.fixture(scope="module", autouse=True)
def wipe_test_addresses(api):
    """Ensure a clean slate: delete all TEST_MOBILE_* addresses before + after."""
    s, uid = api

    def _wipe():
        r = s.get(f"{BASE_URL}/api/users/{uid}/addresses")
        if r.status_code == 200:
            for a in r.json():
                if (a.get("address_line") or "").startswith("TEST_MOBILE_"):
                    s.delete(f"{BASE_URL}/api/users/{uid}/addresses/{a['id']}")

    _wipe()
    yield
    _wipe()


def _make_payload(tag: str, is_default: bool = False) -> dict:
    return {
        "address_line": f"TEST_MOBILE_{tag}, Sector 62, NOIDA, 201301",
        "name": f"TEST_MOBILE_{tag}",
        "area": "Sector 62",
        "city": "NOIDA",
        "pincode": "201301",
        "latitude": 28.6139,
        "longitude": 77.3726,
        "is_default": is_default,
    }


# 1) Contract: GET returns list of Address, each has is_default boolean
def test_get_addresses_returns_list_with_is_default_field(api):
    s, uid = api
    r = s.get(f"{BASE_URL}/api/users/{uid}/addresses")
    assert r.status_code == 200, r.text
    data = r.json()
    assert isinstance(data, list), f"Expected list, got {type(data).__name__}"
    # Seed one address if empty so we can validate the shape
    if len(data) == 0:
        c = s.post(
            f"{BASE_URL}/api/users/{uid}/addresses",
            json=_make_payload("shape_seed"),
        )
        assert c.status_code == 200, c.text
        r = s.get(f"{BASE_URL}/api/users/{uid}/addresses")
        data = r.json()
    for a in data:
        assert "id" in a, f"missing id: {a}"
        assert "address_line" in a, f"missing address_line: {a}"
        assert "is_default" in a, f"missing is_default: {a}"
        assert isinstance(a["is_default"], bool), (
            f"is_default should be bool, got {type(a['is_default']).__name__} in {a}"
        )


# 2) Full lifecycle: create -> add second -> set-default(second) -> GET has
#    EXACTLY ONE is_default=true and it's the one we just set.
def test_set_default_exclusivity_lifecycle(api):
    s, uid = api

    # Create first address (not default)
    c1 = s.post(
        f"{BASE_URL}/api/users/{uid}/addresses",
        json=_make_payload("lc_first", is_default=False),
    )
    assert c1.status_code == 200, c1.text
    a1 = c1.json()

    # Create second address (not default)
    c2 = s.post(
        f"{BASE_URL}/api/users/{uid}/addresses",
        json=_make_payload("lc_second", is_default=False),
    )
    assert c2.status_code == 200, c2.text
    a2 = c2.json()

    # Set the SECOND one as default
    sd = s.put(f"{BASE_URL}/api/users/{uid}/addresses/{a2['id']}/set-default")
    assert sd.status_code == 200, sd.text

    # GET list and verify exactly ONE is_default=true, and it is a2
    r = s.get(f"{BASE_URL}/api/users/{uid}/addresses")
    assert r.status_code == 200, r.text
    addrs = r.json()

    scoped = [a for a in addrs if a["id"] in (a1["id"], a2["id"])]
    assert len(scoped) == 2, f"Both created addresses should be present: {scoped}"

    defaults_all = [a for a in addrs if a.get("is_default") is True]
    assert len(defaults_all) == 1, (
        f"Exactly ONE address must be default across the user's list, "
        f"found {len(defaults_all)}: {[(a['id'], a.get('address_line')) for a in defaults_all]}"
    )
    assert defaults_all[0]["id"] == a2["id"], (
        f"Default should be the one just set ({a2['id']}), got {defaults_all[0]['id']}"
    )

    # And a1 must be is_default=false after the flip
    got_a1 = next(a for a in addrs if a["id"] == a1["id"])
    assert got_a1["is_default"] is False, (
        f"Previous default must be flipped false, got {got_a1}"
    )

    # cleanup
    s.delete(f"{BASE_URL}/api/users/{uid}/addresses/{a1['id']}")
    s.delete(f"{BASE_URL}/api/users/{uid}/addresses/{a2['id']}")


# 3) Fallback: when no address has is_default explicitly, GET still returns
#    a stable, non-empty list so the mobile client can pick the first entry.
#
# NOTE on backend behavior: server sets is_default=True automatically on the
# FIRST address for a user (server.py:4524). To truly test the "no default"
# fallback path we must explicitly PUT is_default=false on that first address
# after creation. This mirrors the safety net in the client for edge cases
# (e.g. legacy rows with is_default missing/false).
def test_get_list_fallback_when_no_default(api):
    s, uid = api

    # Clean any pre-existing addresses to have a controlled start
    r0 = s.get(f"{BASE_URL}/api/users/{uid}/addresses")
    assert r0.status_code == 200
    for a in r0.json():
        s.delete(f"{BASE_URL}/api/users/{uid}/addresses/{a['id']}")

    # Create two addresses. Server auto-marks the first as default -> flip it off.
    ca = s.post(
        f"{BASE_URL}/api/users/{uid}/addresses",
        json=_make_payload("fb_first", is_default=False),
    )
    assert ca.status_code == 200, ca.text
    a_first = ca.json()

    cb = s.post(
        f"{BASE_URL}/api/users/{uid}/addresses",
        json=_make_payload("fb_second", is_default=False),
    )
    assert cb.status_code == 200, cb.text
    a_second = cb.json()

    # Force the auto-marked default off
    upd = s.put(
        f"{BASE_URL}/api/users/{uid}/addresses/{a_first['id']}",
        json={"is_default": False},
    )
    assert upd.status_code == 200, upd.text

    # GET list -> non-empty and NO address has is_default=true
    r = s.get(f"{BASE_URL}/api/users/{uid}/addresses")
    assert r.status_code == 200
    addrs = r.json()
    assert len(addrs) >= 2, f"List should still contain at least the 2 created: {addrs}"

    scoped = [a for a in addrs if a["id"] in (a_first["id"], a_second["id"])]
    defaults_scoped = [a for a in scoped if a.get("is_default") is True]
    assert defaults_scoped == [], (
        f"No scoped address should be default after flipping first off: "
        f"{[(a['id'], a['is_default']) for a in scoped]}"
    )

    # List order should be stable across repeat GETs so client "first" fallback is deterministic
    r2 = s.get(f"{BASE_URL}/api/users/{uid}/addresses")
    assert r2.status_code == 200
    order1 = [a["id"] for a in addrs]
    order2 = [a["id"] for a in r2.json()]
    assert order1 == order2, f"List order should be stable: {order1} vs {order2}"

    # cleanup
    s.delete(f"{BASE_URL}/api/users/{uid}/addresses/{a_first['id']}")
    s.delete(f"{BASE_URL}/api/users/{uid}/addresses/{a_second['id']}")


# 4) Delete removes address from subsequent GET
def test_delete_removes_from_subsequent_get(api):
    s, uid = api

    c = s.post(
        f"{BASE_URL}/api/users/{uid}/addresses",
        json=_make_payload("del", is_default=False),
    )
    assert c.status_code == 200, c.text
    aid = c.json()["id"]

    d = s.delete(f"{BASE_URL}/api/users/{uid}/addresses/{aid}")
    assert d.status_code == 200, d.text

    r = s.get(f"{BASE_URL}/api/users/{uid}/addresses")
    assert r.status_code == 200
    ids = [a["id"] for a in r.json()]
    assert aid not in ids, f"Deleted address {aid} still present in list: {ids}"


# 5) Bonus: verify server's auto-first-default behavior (docs the current contract)
def test_first_address_is_auto_default(api):
    s, uid = api

    # Clean slate
    r0 = s.get(f"{BASE_URL}/api/users/{uid}/addresses")
    for a in r0.json():
        s.delete(f"{BASE_URL}/api/users/{uid}/addresses/{a['id']}")

    c = s.post(
        f"{BASE_URL}/api/users/{uid}/addresses",
        json=_make_payload("auto_default", is_default=False),
    )
    assert c.status_code == 200, c.text
    a = c.json()
    assert a["is_default"] is True, (
        "Server should auto-mark the first address as default; got is_default=False"
    )

    # cleanup
    s.delete(f"{BASE_URL}/api/users/{uid}/addresses/{a['id']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
