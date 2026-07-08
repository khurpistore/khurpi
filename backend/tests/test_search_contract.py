"""
Backend contract tests for GET /api/search that the Flutter search client's
stale-response race fix depends on.

Verifies:
- Valid queries return relevant, non-empty results (apple -> Fresh Apples).
- 'cap' returns capsicum-related items only.
- Short (<2 chars) and empty queries do NOT dump full catalog.
- Repeated/rapid different queries return deterministic, query-scoped results
  so the client can safely filter stale responses by comparing to current text.
"""

import os
import concurrent.futures
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    # Fallback: read from frontend/.env (test env)
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip()
                break

BASE_URL = BASE_URL.rstrip("/")
SEARCH_URL = f"{BASE_URL}/api/search"


@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Accept": "application/json"})
    return s


# ---------------- Valid query returns relevant results ----------------

def test_search_apple_returns_apple_products(api):
    r = api.get(SEARCH_URL, params={"q": "apple", "limit": 20}, timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "products" in data and isinstance(data["products"], list)
    assert data.get("query") == "apple"
    assert len(data["products"]) > 0, "apple query should return >=1 product"
    names = [p.get("name", "").lower() for p in data["products"]]
    # 'Fresh Apples' should be present
    assert any("apple" in n for n in names), f"No apple product in results: {names}"
    assert any(n == "fresh apples" for n in names), f"'Fresh Apples' missing: {names}"


def test_search_apple_all_results_are_relevant(api):
    """Every returned product must actually contain the substring 'apple'
    in name, description or tags (case-insensitive). Guards against catalog dump."""
    r = api.get(SEARCH_URL, params={"q": "apple", "limit": 50}, timeout=15)
    assert r.status_code == 200
    products = r.json().get("products", [])
    assert len(products) > 0
    for p in products:
        haystack = " ".join([
            str(p.get("name", "")),
            str(p.get("description", "") or ""),
            " ".join(p.get("tags", []) if isinstance(p.get("tags"), list) else [str(p.get("tags", ""))]),
        ]).lower()
        assert "apple" in haystack, f"Irrelevant product returned for 'apple': {p.get('name')}"


# ---------------- 'cap' returns capsicum-related only ----------------

def test_search_cap_returns_capsicum_only(api):
    r = api.get(SEARCH_URL, params={"q": "cap", "limit": 20}, timeout=15)
    assert r.status_code == 200
    data = r.json()
    products = data.get("products", [])
    assert data.get("query") == "cap"
    assert len(products) > 0, "'cap' should match capsicum products"
    names = [p.get("name", "").lower() for p in products]
    # At least one capsicum-related item
    assert any("capsicum" in n or "pepper" in n for n in names), f"Unexpected results: {names}"
    # Every product must contain 'cap' substring somewhere (name/desc/tags)
    for p in products:
        haystack = " ".join([
            str(p.get("name", "")),
            str(p.get("description", "") or ""),
            " ".join(p.get("tags", []) if isinstance(p.get("tags"), list) else [str(p.get("tags", ""))]),
        ]).lower()
        assert "cap" in haystack, f"Irrelevant product for 'cap': {p.get('name')}"


# ---------------- Short queries do NOT dump catalog ----------------

def test_search_single_char_returns_empty(api):
    r = api.get(SEARCH_URL, params={"q": "a", "limit": 20}, timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert data.get("query") == "a"
    assert data.get("products") == [], f"Single-char query should return empty, got: {data}"


def test_search_empty_query_returns_empty(api):
    r = api.get(SEARCH_URL, params={"q": "", "limit": 20}, timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert data.get("query") == ""
    assert data.get("products") == [], f"Empty query should return empty, got: {data}"


# ---------------- Determinism: repeated calls same output ----------------

def test_search_repeated_same_query_deterministic(api):
    """Same query executed multiple times returns identical product ID sets."""
    ids_batches = []
    for _ in range(3):
        r = api.get(SEARCH_URL, params={"q": "apple", "limit": 20}, timeout=15)
        assert r.status_code == 200
        ids_batches.append({p["id"] for p in r.json()["products"]})
    assert ids_batches[0] == ids_batches[1] == ids_batches[2], (
        f"Non-deterministic search results across calls: {ids_batches}"
    )


# ---------------- Query-scoped: rapid different queries each get their own results ----------------

def test_search_rapid_different_queries_are_query_scoped(api):
    """Fire multiple different queries concurrently. Each response must contain
    results matching that specific query (or be empty for short/no-match).
    This is what enables the Flutter client to reject stale responses
    by comparing the returned `query` field to the current typed text."""

    queries = ["apple", "cap", "tomato", "onion", "banana", "milk", "xyzznope"]

    def fetch(q):
        r = requests.get(SEARCH_URL, params={"q": q, "limit": 20}, timeout=15)
        return q, r.status_code, r.json()

    with concurrent.futures.ThreadPoolExecutor(max_workers=len(queries)) as ex:
        results = list(ex.map(fetch, queries * 3))  # 21 concurrent calls

    for q, status, data in results:
        assert status == 200, f"q={q} status={status}"
        # Response should echo the query
        assert data.get("query") == q, f"Response query mismatch for {q}: {data.get('query')}"
        prods = data.get("products", [])
        if prods:
            for p in prods:
                haystack = " ".join([
                    str(p.get("name", "")),
                    str(p.get("description", "") or ""),
                    " ".join(p.get("tags", []) if isinstance(p.get("tags"), list) else [str(p.get("tags", ""))]),
                ]).lower()
                assert q.lower() in haystack, (
                    f"Response for q='{q}' contains irrelevant product '{p.get('name')}' "
                    f"(no substring match)"
                )


# ---------------- No MongoDB _id leakage ----------------

def test_search_response_excludes_mongo_object_id(api):
    r = api.get(SEARCH_URL, params={"q": "apple", "limit": 20}, timeout=15)
    assert r.status_code == 200
    for p in r.json().get("products", []):
        assert "_id" not in p, f"Mongo _id leaked in response: {p}"


# ---------------- Response schema sanity ----------------

def test_search_response_schema(api):
    r = api.get(SEARCH_URL, params={"q": "apple", "limit": 5}, timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert set(["products", "query"]).issubset(data.keys())
    assert isinstance(data["products"], list)
    for p in data["products"]:
        # Must be a dict with an id and name
        assert isinstance(p, dict)
        assert "id" in p and isinstance(p["id"], str)
        assert "name" in p and isinstance(p["name"], str)
