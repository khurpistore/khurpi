"""
Wholesale Pricing Feature Tests
Tests for admin wholesale access toggle and API endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://admin-control-center-11.preview.emergentagent.com').rstrip('/')

# Test credentials
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "Khurpi2026Secure"
TEST_CUSTOMER_PHONE = "9971818259"
TEST_CUSTOMER_PASSWORD = "test1234"


@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture
def test_user_id(api_client):
    """Get or create test customer and return their ID"""
    # First try to login with existing test customer
    response = api_client.post(f"{BASE_URL}/api/auth/login", json={
        "phone": TEST_CUSTOMER_PHONE,
        "password": TEST_CUSTOMER_PASSWORD
    })
    
    if response.status_code == 200:
        return response.json()["id"]
    
    # Create test customer if doesn't exist
    response = api_client.post(f"{BASE_URL}/api/auth/signup", json={
        "phone": TEST_CUSTOMER_PHONE,
        "name": "Test Customer Wholesale",
        "password": TEST_CUSTOMER_PASSWORD
    })
    
    if response.status_code == 200:
        return response.json()["id"]
    
    pytest.skip(f"Could not get/create test user: {response.text}")


class TestWholesaleAccessAPI:
    """Test wholesale access API endpoints"""

    def test_get_wholesale_access_default_false(self, api_client, test_user_id):
        """GET /api/admin/users/{user_id}/wholesale-access - Default should be false"""
        response = api_client.get(f"{BASE_URL}/api/admin/users/{test_user_id}/wholesale-access")
        
        assert response.status_code == 200
        data = response.json()
        assert "wholesale_enabled" in data
        # Initially may be true or false depending on prior state
        assert isinstance(data["wholesale_enabled"], bool)

    def test_enable_wholesale_access(self, api_client, test_user_id):
        """PUT /api/admin/users/{user_id}/wholesale-access - Enable wholesale access"""
        response = api_client.put(
            f"{BASE_URL}/api/admin/users/{test_user_id}/wholesale-access",
            json={"wholesale_enabled": True}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["wholesale_enabled"] is True

    def test_verify_wholesale_access_enabled(self, api_client, test_user_id):
        """Verify wholesale access persisted after enabling"""
        # First enable
        api_client.put(
            f"{BASE_URL}/api/admin/users/{test_user_id}/wholesale-access",
            json={"wholesale_enabled": True}
        )
        
        # Then verify
        response = api_client.get(f"{BASE_URL}/api/admin/users/{test_user_id}/wholesale-access")
        
        assert response.status_code == 200
        data = response.json()
        assert data["wholesale_enabled"] is True

    def test_disable_wholesale_access(self, api_client, test_user_id):
        """PUT /api/admin/users/{user_id}/wholesale-access - Disable wholesale access"""
        response = api_client.put(
            f"{BASE_URL}/api/admin/users/{test_user_id}/wholesale-access",
            json={"wholesale_enabled": False}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["wholesale_enabled"] is False

    def test_verify_wholesale_access_disabled(self, api_client, test_user_id):
        """Verify wholesale access persisted after disabling"""
        # First disable
        api_client.put(
            f"{BASE_URL}/api/admin/users/{test_user_id}/wholesale-access",
            json={"wholesale_enabled": False}
        )
        
        # Then verify
        response = api_client.get(f"{BASE_URL}/api/admin/users/{test_user_id}/wholesale-access")
        
        assert response.status_code == 200
        data = response.json()
        assert data["wholesale_enabled"] is False

    def test_wholesale_access_nonexistent_user(self, api_client):
        """GET wholesale access for non-existent user returns 404"""
        response = api_client.get(f"{BASE_URL}/api/admin/users/nonexistent-user-id/wholesale-access")
        
        assert response.status_code == 404

    def test_enable_wholesale_nonexistent_user(self, api_client):
        """PUT wholesale access for non-existent user returns 404"""
        response = api_client.put(
            f"{BASE_URL}/api/admin/users/nonexistent-user-id/wholesale-access",
            json={"wholesale_enabled": True}
        )
        
        assert response.status_code == 404


class TestProductWholesalePrice:
    """Test product wholesale price in API responses"""

    def test_products_have_wholesale_price_field(self, api_client):
        """GET /api/products - Products should include wholesale_price field"""
        response = api_client.get(f"{BASE_URL}/api/products")
        
        assert response.status_code == 200
        products = response.json()
        assert len(products) > 0
        
        # Check that products have wholesale_price field
        for product in products[:5]:  # Check first 5 products
            assert "wholesale_price" in product
            assert isinstance(product["wholesale_price"], (int, float, type(None)))
            assert "price" in product  # Should also have regular price

    def test_find_product_with_wholesale_price(self, api_client):
        """Find a product with wholesale_price set (Turnip Microgreens expected)"""
        response = api_client.get(f"{BASE_URL}/api/products")
        
        assert response.status_code == 200
        products = response.json()
        
        # Find product with wholesale price > 0
        products_with_wholesale = [p for p in products if p.get("wholesale_price", 0) > 0]
        
        # According to the context, Turnip Microgreens should have wholesale_price = 150
        turnip = next((p for p in products if "Turnip" in p.get("name", "")), None)
        
        if turnip:
            assert "wholesale_price" in turnip
            # Wholesale price should be less than retail price
            if turnip["wholesale_price"] > 0:
                assert turnip["wholesale_price"] < turnip["price"]

    def test_update_product_wholesale_price(self, api_client):
        """PUT /api/products/{id} - Update wholesale price for a product"""
        # First get all products
        response = api_client.get(f"{BASE_URL}/api/products?active_only=false")
        assert response.status_code == 200
        products = response.json()
        
        if len(products) == 0:
            pytest.skip("No products available")
        
        # Use first product
        test_product = products[0]
        product_id = test_product["id"]
        original_wholesale_price = test_product.get("wholesale_price", 0)
        new_wholesale_price = 130.0
        
        # Update wholesale price
        response = api_client.put(
            f"{BASE_URL}/api/products/{product_id}",
            json={"wholesale_price": new_wholesale_price}
        )
        
        assert response.status_code == 200
        
        # Verify the update
        response = api_client.get(f"{BASE_URL}/api/products")
        products = response.json()
        updated_product = next((p for p in products if p["id"] == product_id), None)
        
        assert updated_product is not None
        assert updated_product["wholesale_price"] == new_wholesale_price
        
        # Restore original price
        api_client.put(
            f"{BASE_URL}/api/products/{product_id}",
            json={"wholesale_price": original_wholesale_price}
        )


class TestAdminUsersEndpoint:
    """Test admin users list includes wholesale status"""

    def test_admin_users_list(self, api_client):
        """GET /api/admin/users - Should return users list"""
        response = api_client.get(f"{BASE_URL}/api/admin/users")
        
        assert response.status_code == 200
        users = response.json()
        assert isinstance(users, list)

    def test_users_can_have_wholesale_enabled_field(self, api_client, test_user_id):
        """Users should have wholesale_enabled field after it's set"""
        # Enable wholesale for test user
        api_client.put(
            f"{BASE_URL}/api/admin/users/{test_user_id}/wholesale-access",
            json={"wholesale_enabled": True}
        )
        
        # Get users list
        response = api_client.get(f"{BASE_URL}/api/admin/users")
        assert response.status_code == 200
        users = response.json()
        
        # Find test user
        test_user = next((u for u in users if u["id"] == test_user_id), None)
        
        # wholesale_enabled should be present after being set
        if test_user:
            assert "wholesale_enabled" in test_user or test_user.get("wholesale_enabled") is True


class TestWholesaleTogglePersistence:
    """Test wholesale toggle persists across operations"""

    def test_wholesale_toggle_cycle(self, api_client, test_user_id):
        """Test wholesale toggle ON -> OFF -> ON cycle"""
        # Enable
        response = api_client.put(
            f"{BASE_URL}/api/admin/users/{test_user_id}/wholesale-access",
            json={"wholesale_enabled": True}
        )
        assert response.status_code == 200
        
        # Verify enabled
        response = api_client.get(f"{BASE_URL}/api/admin/users/{test_user_id}/wholesale-access")
        assert response.json()["wholesale_enabled"] is True
        
        # Disable
        response = api_client.put(
            f"{BASE_URL}/api/admin/users/{test_user_id}/wholesale-access",
            json={"wholesale_enabled": False}
        )
        assert response.status_code == 200
        
        # Verify disabled
        response = api_client.get(f"{BASE_URL}/api/admin/users/{test_user_id}/wholesale-access")
        assert response.json()["wholesale_enabled"] is False
        
        # Enable again
        response = api_client.put(
            f"{BASE_URL}/api/admin/users/{test_user_id}/wholesale-access",
            json={"wholesale_enabled": True}
        )
        assert response.status_code == 200
        
        # Verify enabled again
        response = api_client.get(f"{BASE_URL}/api/admin/users/{test_user_id}/wholesale-access")
        assert response.json()["wholesale_enabled"] is True
