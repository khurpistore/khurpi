"""
Test Password-Based Authentication for Khurpi Microgreens App
Tests: Signup, Login, Change Password (User), Reset Password (Admin)
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test data
TEST_PHONE = f"98765{str(uuid.uuid4())[:5].replace('-', '0')}"[:10]
TEST_NAME = "TEST_PasswordUser"
TEST_PASSWORD = "test123456"
NEW_PASSWORD = "newpass789"

class TestUserSignup:
    """Test user signup with phone/password"""
    
    def test_signup_success(self):
        """Test successful user signup"""
        response = requests.post(f"{BASE_URL}/api/auth/signup", json={
            "phone": TEST_PHONE,
            "name": TEST_NAME,
            "password": TEST_PASSWORD
        })
        
        assert response.status_code == 200, f"Signup failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "id" in data, "Response missing 'id'"
        assert "phone" in data, "Response missing 'phone'"
        assert "name" in data, "Response missing 'name'"
        assert "role" in data, "Response missing 'role'"
        
        # Verify data values
        assert data["phone"] == TEST_PHONE
        assert data["name"] == TEST_NAME
        assert data["role"] == "customer"
        
        # Password should NOT be in response
        assert "password" not in data, "Password should not be in response"
        
        print(f"✓ Signup successful for phone: {TEST_PHONE}")
        
        # Store user_id for later tests
        pytest.user_id = data["id"]
    
    def test_signup_duplicate_phone(self):
        """Test signup with already registered phone"""
        response = requests.post(f"{BASE_URL}/api/auth/signup", json={
            "phone": TEST_PHONE,
            "name": "Another User",
            "password": "anotherpass"
        })
        
        assert response.status_code == 400, "Should reject duplicate phone"
        assert "already registered" in response.json().get("detail", "").lower()
        print("✓ Duplicate phone correctly rejected")


class TestUserLogin:
    """Test user login with phone/password"""
    
    def test_login_success(self):
        """Test successful login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "phone": TEST_PHONE,
            "password": TEST_PASSWORD
        })
        
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "id" in data
        assert "phone" in data
        assert "name" in data
        
        # Verify data values
        assert data["phone"] == TEST_PHONE
        assert data["name"] == TEST_NAME
        
        # Password should NOT be in response
        assert "password" not in data
        
        print(f"✓ Login successful for phone: {TEST_PHONE}")
    
    def test_login_wrong_password(self):
        """Test login with wrong password"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "phone": TEST_PHONE,
            "password": "wrongpassword"
        })
        
        assert response.status_code == 401, "Should reject wrong password"
        print("✓ Wrong password correctly rejected")
    
    def test_login_nonexistent_user(self):
        """Test login with non-existent phone"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "phone": "0000000000",
            "password": "anypassword"
        })
        
        assert response.status_code == 401, "Should reject non-existent user"
        print("✓ Non-existent user correctly rejected")


class TestChangePassword:
    """Test user changing their own password"""
    
    def test_change_password_success(self):
        """Test successful password change"""
        # First, get user_id from login
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "phone": TEST_PHONE,
            "password": TEST_PASSWORD
        })
        assert login_response.status_code == 200
        user_id = login_response.json()["id"]
        
        # Change password
        response = requests.post(f"{BASE_URL}/api/auth/change-password?user_id={user_id}", json={
            "current_password": TEST_PASSWORD,
            "new_password": NEW_PASSWORD
        })
        
        assert response.status_code == 200, f"Change password failed: {response.text}"
        data = response.json()
        assert data.get("success") == True
        assert "changed successfully" in data.get("message", "").lower()
        
        print("✓ Password changed successfully")
        
        # Verify old password no longer works
        old_login = requests.post(f"{BASE_URL}/api/auth/login", json={
            "phone": TEST_PHONE,
            "password": TEST_PASSWORD
        })
        assert old_login.status_code == 401, "Old password should not work"
        print("✓ Old password correctly rejected")
        
        # Verify new password works
        new_login = requests.post(f"{BASE_URL}/api/auth/login", json={
            "phone": TEST_PHONE,
            "password": NEW_PASSWORD
        })
        assert new_login.status_code == 200, "New password should work"
        print("✓ New password works correctly")
    
    def test_change_password_wrong_current(self):
        """Test change password with wrong current password"""
        # Get user_id
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "phone": TEST_PHONE,
            "password": NEW_PASSWORD
        })
        assert login_response.status_code == 200
        user_id = login_response.json()["id"]
        
        response = requests.post(f"{BASE_URL}/api/auth/change-password?user_id={user_id}", json={
            "current_password": "wrongcurrent",
            "new_password": "newpassword"
        })
        
        assert response.status_code == 400, "Should reject wrong current password"
        assert "incorrect" in response.json().get("detail", "").lower()
        print("✓ Wrong current password correctly rejected")
    
    def test_change_password_short_new(self):
        """Test change password with too short new password"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "phone": TEST_PHONE,
            "password": NEW_PASSWORD
        })
        assert login_response.status_code == 200
        user_id = login_response.json()["id"]
        
        response = requests.post(f"{BASE_URL}/api/auth/change-password?user_id={user_id}", json={
            "current_password": NEW_PASSWORD,
            "new_password": "12345"  # Less than 6 characters
        })
        
        assert response.status_code == 400, "Should reject short password"
        assert "6 characters" in response.json().get("detail", "")
        print("✓ Short password correctly rejected")


class TestAdminResetPassword:
    """Test admin resetting user password"""
    
    def test_admin_reset_password_success(self):
        """Test admin can reset user password"""
        # Get user_id
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "phone": TEST_PHONE,
            "password": NEW_PASSWORD
        })
        assert login_response.status_code == 200
        user_id = login_response.json()["id"]
        
        admin_reset_password = "admin_reset_pwd"
        
        # Admin resets password
        response = requests.post(f"{BASE_URL}/api/admin/users/{user_id}/reset-password", json={
            "new_password": admin_reset_password
        })
        
        assert response.status_code == 200, f"Admin reset failed: {response.text}"
        data = response.json()
        assert data.get("success") == True
        assert "reset successfully" in data.get("message", "").lower()
        
        print("✓ Admin reset password successfully")
        
        # Verify old password no longer works
        old_login = requests.post(f"{BASE_URL}/api/auth/login", json={
            "phone": TEST_PHONE,
            "password": NEW_PASSWORD
        })
        assert old_login.status_code == 401, "Old password should not work after admin reset"
        print("✓ Old password rejected after admin reset")
        
        # Verify new admin-set password works
        new_login = requests.post(f"{BASE_URL}/api/auth/login", json={
            "phone": TEST_PHONE,
            "password": admin_reset_password
        })
        assert new_login.status_code == 200, "Admin-set password should work"
        print("✓ Admin-set password works correctly")
    
    def test_admin_reset_password_short(self):
        """Test admin reset with too short password"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "phone": TEST_PHONE,
            "password": "admin_reset_pwd"
        })
        assert login_response.status_code == 200
        user_id = login_response.json()["id"]
        
        response = requests.post(f"{BASE_URL}/api/admin/users/{user_id}/reset-password", json={
            "new_password": "12345"  # Less than 6 characters
        })
        
        assert response.status_code == 400, "Should reject short password"
        print("✓ Admin reset with short password correctly rejected")
    
    def test_admin_reset_nonexistent_user(self):
        """Test admin reset for non-existent user"""
        response = requests.post(f"{BASE_URL}/api/admin/users/nonexistent-id/reset-password", json={
            "new_password": "newpassword123"
        })
        
        assert response.status_code == 404, "Should return 404 for non-existent user"
        print("✓ Non-existent user correctly returns 404")


class TestAdminLogin:
    """Test admin login functionality"""
    
    def test_admin_login_success(self):
        """Test admin login with correct credentials"""
        response = requests.post(f"{BASE_URL}/api/admin/login?username=admin&password=admin")
        
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        assert data.get("success") == True
        assert data.get("role") == "admin"
        print("✓ Admin login successful")
    
    def test_admin_login_wrong_credentials(self):
        """Test admin login with wrong credentials"""
        response = requests.post(f"{BASE_URL}/api/admin/login?username=admin&password=wrongpass")
        
        assert response.status_code == 401, "Should reject wrong admin credentials"
        print("✓ Wrong admin credentials correctly rejected")


class TestCleanup:
    """Cleanup test data"""
    
    def test_cleanup_test_user(self):
        """Delete test user"""
        # Get user_id
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "phone": TEST_PHONE,
            "password": "admin_reset_pwd"
        })
        
        if login_response.status_code == 200:
            user_id = login_response.json()["id"]
            delete_response = requests.delete(f"{BASE_URL}/api/admin/users/{user_id}")
            if delete_response.status_code == 200:
                print(f"✓ Test user {TEST_PHONE} cleaned up")
            else:
                print(f"⚠ Could not delete test user: {delete_response.text}")
        else:
            print("⚠ Test user not found for cleanup (may have been deleted)")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
