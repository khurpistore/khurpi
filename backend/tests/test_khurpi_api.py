"""
Khurpi Microgreens API Tests
Tests for: Auth, Products, Addresses (multiple), Subscriptions
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test user credentials
TEST_PHONE = f"TEST_{uuid.uuid4().hex[:8]}"
TEST_PASSWORD = "test123"
TEST_NAME = "Test User"

# Existing test user
EXISTING_USER_PHONE = "9999999999"
EXISTING_USER_PASSWORD = "test123"


class TestHealthAndProducts:
    """Basic health and product endpoint tests"""
    
    def test_products_endpoint(self):
        """Test GET /api/products returns 200"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Products endpoint returned {len(data)} products")
    
    def test_products_with_active_filter(self):
        """Test GET /api/products with active_only filter"""
        response = requests.get(f"{BASE_URL}/api/products?active_only=true")
        assert response.status_code == 200
        data = response.json()
        # All returned products should be active
        for product in data:
            assert product.get("active", True) == True
        print(f"Active products: {len(data)}")


class TestAuthentication:
    """Authentication flow tests"""
    
    def test_signup_new_user(self):
        """Test user signup"""
        unique_phone = f"TEST_{uuid.uuid4().hex[:8]}"
        response = requests.post(f"{BASE_URL}/api/auth/signup", json={
            "phone": unique_phone,
            "name": "Test Signup User",
            "password": "testpass123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["phone"] == unique_phone
        assert data["name"] == "Test Signup User"
        assert data["role"] == "customer"
        print(f"Signup successful for user: {unique_phone}")
    
    def test_signup_duplicate_phone(self):
        """Test signup with existing phone fails"""
        # First signup
        unique_phone = f"TEST_{uuid.uuid4().hex[:8]}"
        requests.post(f"{BASE_URL}/api/auth/signup", json={
            "phone": unique_phone,
            "name": "First User",
            "password": "testpass123"
        })
        
        # Duplicate signup
        response = requests.post(f"{BASE_URL}/api/auth/signup", json={
            "phone": unique_phone,
            "name": "Duplicate User",
            "password": "testpass123"
        })
        assert response.status_code == 400
        print("Duplicate phone signup correctly rejected")
    
    def test_login_valid_credentials(self):
        """Test login with valid credentials"""
        # Create user first
        unique_phone = f"TEST_{uuid.uuid4().hex[:8]}"
        requests.post(f"{BASE_URL}/api/auth/signup", json={
            "phone": unique_phone,
            "name": "Login Test User",
            "password": "logintest123"
        })
        
        # Login
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "phone": unique_phone,
            "password": "logintest123"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["phone"] == unique_phone
        print(f"Login successful for: {unique_phone}")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "phone": "nonexistent_phone",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("Invalid login correctly rejected")
    
    def test_admin_login_valid(self):
        """Test admin login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/admin/login?username=admin&password=admin")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert data["role"] == "admin"
        print("Admin login successful")
    
    def test_admin_login_invalid(self):
        """Test admin login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/admin/login?username=admin&password=wrong")
        assert response.status_code == 401
        print("Invalid admin login correctly rejected")


class TestMultipleAddresses:
    """Tests for multiple address management feature"""
    
    @pytest.fixture
    def test_user(self):
        """Create a test user and return user data"""
        unique_phone = f"TEST_{uuid.uuid4().hex[:8]}"
        response = requests.post(f"{BASE_URL}/api/auth/signup", json={
            "phone": unique_phone,
            "name": "Address Test User",
            "password": "addresstest123"
        })
        assert response.status_code == 200
        return response.json()
    
    def test_add_first_address(self, test_user):
        """Test adding first address - should become default"""
        user_id = test_user["id"]
        
        response = requests.post(f"{BASE_URL}/api/users/{user_id}/addresses", json={
            "address_line": "Sector 62, NOIDA, UP 201301",
            "latitude": 28.6139,
            "longitude": 77.3726,
            "is_default": False
        })
        assert response.status_code == 200
        data = response.json()
        assert data["address_line"] == "Sector 62, NOIDA, UP 201301"
        assert data["is_default"] == True  # First address should be default
        assert data["user_id"] == user_id
        print(f"First address added successfully, is_default: {data['is_default']}")
    
    def test_add_second_address(self, test_user):
        """Test adding second address"""
        user_id = test_user["id"]
        
        # Add first address
        requests.post(f"{BASE_URL}/api/users/{user_id}/addresses", json={
            "address_line": "Sector 62, NOIDA, UP 201301",
            "latitude": 28.6139,
            "longitude": 77.3726
        })
        
        # Add second address
        response = requests.post(f"{BASE_URL}/api/users/{user_id}/addresses", json={
            "address_line": "Sector 18, NOIDA, UP 201301",
            "latitude": 28.5700,
            "longitude": 77.3200,
            "is_default": False
        })
        assert response.status_code == 200
        data = response.json()
        assert data["is_default"] == False  # Second address should not be default
        print("Second address added successfully")
    
    def test_get_user_addresses(self, test_user):
        """Test getting all addresses for a user"""
        user_id = test_user["id"]
        
        # Add two addresses
        requests.post(f"{BASE_URL}/api/users/{user_id}/addresses", json={
            "address_line": "Sector 62, NOIDA, UP 201301",
            "latitude": 28.6139,
            "longitude": 77.3726
        })
        requests.post(f"{BASE_URL}/api/users/{user_id}/addresses", json={
            "address_line": "Sector 18, NOIDA, UP 201301",
            "latitude": 28.5700,
            "longitude": 77.3200
        })
        
        # Get addresses
        response = requests.get(f"{BASE_URL}/api/users/{user_id}/addresses")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 2
        print(f"Retrieved {len(data)} addresses for user")
    
    def test_update_address(self, test_user):
        """Test updating an address"""
        user_id = test_user["id"]
        
        # Add address
        add_response = requests.post(f"{BASE_URL}/api/users/{user_id}/addresses", json={
            "address_line": "Sector 62, NOIDA, UP 201301",
            "latitude": 28.6139,
            "longitude": 77.3726
        })
        address_id = add_response.json()["id"]
        
        # Update address
        response = requests.put(f"{BASE_URL}/api/users/{user_id}/addresses/{address_id}", json={
            "address_line": "Updated Address, Sector 63, NOIDA, UP 201301"
        })
        assert response.status_code == 200
        data = response.json()
        assert "Updated Address" in data["address_line"]
        print("Address updated successfully")
    
    def test_set_default_address(self, test_user):
        """Test setting an address as default"""
        user_id = test_user["id"]
        
        # Add two addresses
        requests.post(f"{BASE_URL}/api/users/{user_id}/addresses", json={
            "address_line": "Sector 62, NOIDA, UP 201301",
            "latitude": 28.6139,
            "longitude": 77.3726
        })
        second_response = requests.post(f"{BASE_URL}/api/users/{user_id}/addresses", json={
            "address_line": "Sector 18, NOIDA, UP 201301",
            "latitude": 28.5700,
            "longitude": 77.3200
        })
        second_address_id = second_response.json()["id"]
        
        # Set second address as default
        response = requests.put(f"{BASE_URL}/api/users/{user_id}/addresses/{second_address_id}/set-default")
        assert response.status_code == 200
        
        # Verify
        addresses_response = requests.get(f"{BASE_URL}/api/users/{user_id}/addresses")
        addresses = addresses_response.json()
        default_count = sum(1 for a in addresses if a["is_default"])
        assert default_count == 1
        print("Default address set successfully")
    
    def test_delete_address(self, test_user):
        """Test deleting an address"""
        user_id = test_user["id"]
        
        # Add address
        add_response = requests.post(f"{BASE_URL}/api/users/{user_id}/addresses", json={
            "address_line": "Sector 62, NOIDA, UP 201301",
            "latitude": 28.6139,
            "longitude": 77.3726
        })
        address_id = add_response.json()["id"]
        
        # Delete address
        response = requests.delete(f"{BASE_URL}/api/users/{user_id}/addresses/{address_id}")
        assert response.status_code == 200
        
        # Verify deletion
        addresses_response = requests.get(f"{BASE_URL}/api/users/{user_id}/addresses")
        addresses = addresses_response.json()
        assert len(addresses) == 0
        print("Address deleted successfully")
    
    def test_address_noida_validation(self, test_user):
        """Test that non-NOIDA addresses are rejected"""
        user_id = test_user["id"]
        
        response = requests.post(f"{BASE_URL}/api/users/{user_id}/addresses", json={
            "address_line": "Sector 1, Gurgaon, Haryana",
            "latitude": 28.4595,
            "longitude": 77.0266
        })
        assert response.status_code == 400
        assert "NOIDA" in response.json()["detail"]
        print("Non-NOIDA address correctly rejected")


class TestAdminEndpoints:
    """Admin dashboard and management endpoint tests"""
    
    def test_admin_dashboard(self):
        """Test admin dashboard endpoint"""
        response = requests.get(f"{BASE_URL}/api/admin/dashboard")
        assert response.status_code == 200
        data = response.json()
        assert "total_subscriptions" in data
        assert "active_subscriptions" in data
        assert "today_deliveries" in data
        assert "total_revenue" in data
        print(f"Dashboard: {data['active_subscriptions']} active subscriptions, ₹{data['total_revenue']} revenue")
    
    def test_admin_users_list(self):
        """Test admin users list endpoint"""
        response = requests.get(f"{BASE_URL}/api/admin/users")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Verify no passwords are exposed
        for user in data:
            assert "password" not in user
        print(f"Admin users list: {len(data)} users")
    
    def test_admin_subscriptions_list(self):
        """Test admin subscriptions list endpoint"""
        response = requests.get(f"{BASE_URL}/api/admin/subscriptions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Admin subscriptions list: {len(data)} subscriptions")
    
    def test_admin_inventory(self):
        """Test admin inventory planning endpoint"""
        response = requests.get(f"{BASE_URL}/api/admin/inventory")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Inventory planning: {len(data)} products tracked")


class TestSubscriptions:
    """Subscription endpoint tests"""
    
    def test_get_subscriptions(self):
        """Test GET /api/subscriptions"""
        response = requests.get(f"{BASE_URL}/api/subscriptions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Subscriptions: {len(data)} total")
    
    def test_get_deliveries(self):
        """Test GET /api/deliveries"""
        response = requests.get(f"{BASE_URL}/api/deliveries")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Deliveries: {len(data)} total")
    
    def test_get_payments(self):
        """Test GET /api/payments"""
        response = requests.get(f"{BASE_URL}/api/payments")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Payments: {len(data)} total")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
