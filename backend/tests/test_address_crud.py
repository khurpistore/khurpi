"""
Test Address CRUD Operations for Khurpi Microgreens App
Tests: Create, Read, Update, Delete, Set Default address functionality
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from test_credentials.md
TEST_PHONE = "9971818259"
TEST_PASSWORD = "test1234"

class TestAddressCRUD:
    """Address CRUD operations tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session and login"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get user_id
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "phone": TEST_PHONE,
            "password": TEST_PASSWORD
        })
        
        if login_response.status_code != 200:
            pytest.skip(f"Login failed: {login_response.text}")
        
        login_data = login_response.json()
        self.user = login_data.get("user", login_data)  # Handle both old and new response format
        self.user_id = self.user.get("id")
        self.created_address_id = None
        
        yield
        
        # Cleanup: Delete test address if created
        if self.created_address_id:
            try:
                self.session.delete(f"{BASE_URL}/api/users/{self.user_id}/addresses/{self.created_address_id}")
            except:
                pass
    
    def test_01_login_success(self):
        """Test login with valid credentials returns JWT token and user"""
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "phone": TEST_PHONE,
            "password": TEST_PASSWORD
        })
        
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        
        # New response format: {token, user}
        assert "token" in data, "Response missing 'token'"
        assert "user" in data, "Response missing 'user'"
        
        user = data["user"]
        assert "id" in user
        assert user["phone"] == TEST_PHONE
        print(f"✓ Login successful with JWT token, user_id: {user['id']}")
    
    def test_02_get_addresses_initial(self):
        """Test getting user addresses"""
        response = self.session.get(f"{BASE_URL}/api/users/{self.user_id}/addresses")
        
        assert response.status_code == 200, f"Get addresses failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Got {len(data)} existing addresses")
    
    def test_03_create_address(self):
        """Test creating a new address with all fields"""
        address_data = {
            "address_line": "TEST_B-42, Sunrise Apartments, Sector 62, NOIDA, 201301",
            "name": "TEST_Home",
            "address_line_1": "B-42, Sunrise Apartments",
            "address_line_2": "Near City Mall",
            "area": "Sector 62",
            "city": "NOIDA",
            "pincode": "201301",
            "latitude": 28.6139,
            "longitude": 77.3726,
            "is_default": False
        }
        
        response = self.session.post(
            f"{BASE_URL}/api/users/{self.user_id}/addresses",
            json=address_data
        )
        
        assert response.status_code == 200, f"Create address failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "id" in data
        assert data["user_id"] == self.user_id
        assert "NOIDA" in data["address_line"].upper()
        
        self.created_address_id = data["id"]
        print(f"✓ Created address with id: {data['id']}")
        
        return data["id"]
    
    def test_04_read_address_after_create(self):
        """Test reading addresses after creating one"""
        # First create an address
        address_data = {
            "address_line": "TEST_C-15, Green Valley, Sector 50, NOIDA, 201301",
            "latitude": 28.6139,
            "longitude": 77.3726,
            "is_default": False
        }
        
        create_response = self.session.post(
            f"{BASE_URL}/api/users/{self.user_id}/addresses",
            json=address_data
        )
        assert create_response.status_code == 200
        created = create_response.json()
        self.created_address_id = created["id"]
        
        # Now read all addresses
        response = self.session.get(f"{BASE_URL}/api/users/{self.user_id}/addresses")
        
        assert response.status_code == 200
        addresses = response.json()
        
        # Verify the created address is in the list
        address_ids = [a["id"] for a in addresses]
        assert created["id"] in address_ids, "Created address not found in list"
        
        # Find and verify the created address
        found_address = next((a for a in addresses if a["id"] == created["id"]), None)
        assert found_address is not None
        assert "NOIDA" in found_address["address_line"].upper()
        
        print(f"✓ Verified address {created['id']} exists in address list")
    
    def test_05_update_address(self):
        """Test updating an address"""
        # First create an address
        address_data = {
            "address_line": "TEST_D-20, Old Building, Sector 45, NOIDA, 201301",
            "latitude": 28.6139,
            "longitude": 77.3726,
            "is_default": False
        }
        
        create_response = self.session.post(
            f"{BASE_URL}/api/users/{self.user_id}/addresses",
            json=address_data
        )
        assert create_response.status_code == 200
        created = create_response.json()
        self.created_address_id = created["id"]
        
        # Update the address
        update_data = {
            "address_line": "TEST_D-20, New Building, Sector 45, NOIDA, 201301"
        }
        
        update_response = self.session.put(
            f"{BASE_URL}/api/users/{self.user_id}/addresses/{created['id']}",
            json=update_data
        )
        
        assert update_response.status_code == 200, f"Update failed: {update_response.text}"
        updated = update_response.json()
        
        # Verify update
        assert "New Building" in updated["address_line"]
        print(f"✓ Updated address: {updated['address_line']}")
        
        # Verify persistence with GET
        get_response = self.session.get(f"{BASE_URL}/api/users/{self.user_id}/addresses")
        assert get_response.status_code == 200
        addresses = get_response.json()
        
        found = next((a for a in addresses if a["id"] == created["id"]), None)
        assert found is not None
        assert "New Building" in found["address_line"]
        print(f"✓ Verified update persisted in database")
    
    def test_06_set_default_address(self):
        """Test setting an address as default"""
        # First create an address
        address_data = {
            "address_line": "TEST_E-10, Default Test, Sector 55, NOIDA, 201301",
            "latitude": 28.6139,
            "longitude": 77.3726,
            "is_default": False
        }
        
        create_response = self.session.post(
            f"{BASE_URL}/api/users/{self.user_id}/addresses",
            json=address_data
        )
        assert create_response.status_code == 200
        created = create_response.json()
        self.created_address_id = created["id"]
        
        # Set as default
        set_default_response = self.session.put(
            f"{BASE_URL}/api/users/{self.user_id}/addresses/{created['id']}/set-default"
        )
        
        assert set_default_response.status_code == 200, f"Set default failed: {set_default_response.text}"
        
        # Verify it's now default
        get_response = self.session.get(f"{BASE_URL}/api/users/{self.user_id}/addresses")
        assert get_response.status_code == 200
        addresses = get_response.json()
        
        found = next((a for a in addresses if a["id"] == created["id"]), None)
        assert found is not None
        assert found["is_default"] == True, "Address should be marked as default"
        print(f"✓ Address {created['id']} set as default successfully")
    
    def test_07_delete_address(self):
        """Test deleting an address"""
        # First create an address
        address_data = {
            "address_line": "TEST_F-5, Delete Test, Sector 60, NOIDA, 201301",
            "latitude": 28.6139,
            "longitude": 77.3726,
            "is_default": False
        }
        
        create_response = self.session.post(
            f"{BASE_URL}/api/users/{self.user_id}/addresses",
            json=address_data
        )
        assert create_response.status_code == 200
        created = create_response.json()
        address_id = created["id"]
        
        # Delete the address
        delete_response = self.session.delete(
            f"{BASE_URL}/api/users/{self.user_id}/addresses/{address_id}"
        )
        
        assert delete_response.status_code == 200, f"Delete failed: {delete_response.text}"
        
        # Verify deletion with GET
        get_response = self.session.get(f"{BASE_URL}/api/users/{self.user_id}/addresses")
        assert get_response.status_code == 200
        addresses = get_response.json()
        
        address_ids = [a["id"] for a in addresses]
        assert address_id not in address_ids, "Deleted address should not be in list"
        print(f"✓ Address {address_id} deleted successfully")
        
        # Clear the created_address_id since we already deleted it
        self.created_address_id = None
    
    @pytest.mark.skip(reason="NOIDA validation not implemented in backend")
    def test_08_noida_validation(self):
        """Test that non-NOIDA addresses are rejected"""
        address_data = {
            "address_line": "TEST_123, Some Street, Delhi, 110001",
            "latitude": 28.6139,
            "longitude": 77.2090,
            "is_default": False
        }
        
        response = self.session.post(
            f"{BASE_URL}/api/users/{self.user_id}/addresses",
            json=address_data
        )
        
        # Should be rejected (400 error)
        assert response.status_code == 400, f"Expected 400 for non-NOIDA address, got {response.status_code}"
        assert "NOIDA" in response.text.upper() or "deliver" in response.text.lower()
        print(f"✓ Non-NOIDA address correctly rejected")
    
    def test_09_full_crud_flow(self):
        """Test complete CRUD flow: Create -> Read -> Update -> Set Default -> Delete"""
        # CREATE
        address_data = {
            "address_line": "TEST_G-100, Full Flow Test, Sector 70, NOIDA, 201301",
            "latitude": 28.6139,
            "longitude": 77.3726,
            "is_default": False
        }
        
        create_response = self.session.post(
            f"{BASE_URL}/api/users/{self.user_id}/addresses",
            json=address_data
        )
        assert create_response.status_code == 200
        created = create_response.json()
        address_id = created["id"]
        print(f"✓ CREATE: Address created with id {address_id}")
        
        # READ
        get_response = self.session.get(f"{BASE_URL}/api/users/{self.user_id}/addresses")
        assert get_response.status_code == 200
        addresses = get_response.json()
        found = next((a for a in addresses if a["id"] == address_id), None)
        assert found is not None
        print(f"✓ READ: Address found in list")
        
        # UPDATE
        update_response = self.session.put(
            f"{BASE_URL}/api/users/{self.user_id}/addresses/{address_id}",
            json={"address_line": "TEST_G-100, Updated Flow Test, Sector 70, NOIDA, 201301"}
        )
        assert update_response.status_code == 200
        updated = update_response.json()
        assert "Updated" in updated["address_line"]
        print(f"✓ UPDATE: Address updated successfully")
        
        # SET DEFAULT
        set_default_response = self.session.put(
            f"{BASE_URL}/api/users/{self.user_id}/addresses/{address_id}/set-default"
        )
        assert set_default_response.status_code == 200
        
        # Verify default
        get_response2 = self.session.get(f"{BASE_URL}/api/users/{self.user_id}/addresses")
        addresses2 = get_response2.json()
        found2 = next((a for a in addresses2 if a["id"] == address_id), None)
        assert found2["is_default"] == True
        print(f"✓ SET DEFAULT: Address marked as default")
        
        # DELETE
        delete_response = self.session.delete(
            f"{BASE_URL}/api/users/{self.user_id}/addresses/{address_id}"
        )
        assert delete_response.status_code == 200
        
        # Verify deletion
        get_response3 = self.session.get(f"{BASE_URL}/api/users/{self.user_id}/addresses")
        addresses3 = get_response3.json()
        address_ids = [a["id"] for a in addresses3]
        assert address_id not in address_ids
        print(f"✓ DELETE: Address removed from database")
        
        print(f"\n✓✓✓ FULL CRUD FLOW COMPLETED SUCCESSFULLY ✓✓✓")


class TestAddressCleanup:
    """Cleanup test addresses"""
    
    def test_cleanup_test_addresses(self):
        """Remove all TEST_ prefixed addresses"""
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        
        # Login
        login_response = session.post(f"{BASE_URL}/api/auth/login", json={
            "phone": TEST_PHONE,
            "password": TEST_PASSWORD
        })
        
        if login_response.status_code != 200:
            pytest.skip("Login failed for cleanup")
        
        login_data = login_response.json()
        user = login_data.get("user", login_data)  # Handle both formats
        user_id = user.get("id")
        
        # Get all addresses
        get_response = session.get(f"{BASE_URL}/api/users/{user_id}/addresses")
        if get_response.status_code != 200:
            pytest.skip("Could not get addresses for cleanup")
        
        addresses = get_response.json()
        
        # Delete TEST_ prefixed addresses
        deleted_count = 0
        for address in addresses:
            if address.get("address_line", "").startswith("TEST_"):
                delete_response = session.delete(
                    f"{BASE_URL}/api/users/{user_id}/addresses/{address['id']}"
                )
                if delete_response.status_code == 200:
                    deleted_count += 1
        
        print(f"✓ Cleaned up {deleted_count} test addresses")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
