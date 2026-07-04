"""
Test JWT Token Generation for Khurpi Microgreens App
Tests: JWT token generation on login, register, and OTP verification
"""
import pytest
import requests
import os
import uuid
import jwt

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from test_credentials.md
CUSTOMER_PHONE = "9971818259"
CUSTOMER_PASSWORD = "test1234"

# JWT secret for verification (should match backend)
JWT_SECRET_KEY = "khurpi-fresh-secret-key-2026-secure"
JWT_ALGORITHM = "HS256"


class TestJWTLogin:
    """Test JWT token generation on login"""
    
    def test_login_returns_jwt_token(self):
        """Test that login endpoint returns a valid JWT token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "phone": CUSTOMER_PHONE,
            "password": CUSTOMER_PASSWORD
        })
        
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "token" in data, "Response missing 'token'"
        assert "user" in data, "Response missing 'user'"
        
        # Verify token is a valid JWT
        token = data["token"]
        assert token.count('.') == 2, "Token should have 3 parts separated by dots"
        
        # Decode and verify token payload
        try:
            payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
            assert "user_id" in payload, "Token missing user_id"
            assert "phone" in payload, "Token missing phone"
            assert "role" in payload, "Token missing role"
            assert "exp" in payload, "Token missing expiration"
            assert "iat" in payload, "Token missing issued at"
            
            # Verify payload values match user
            assert payload["phone"] == CUSTOMER_PHONE
            assert payload["user_id"] == data["user"]["id"]
            
            print(f"✓ Login returns valid JWT token with user_id: {payload['user_id']}")
        except jwt.InvalidTokenError as e:
            pytest.fail(f"Invalid JWT token: {e}")
    
    def test_login_user_object_structure(self):
        """Test that login returns proper user object"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "phone": CUSTOMER_PHONE,
            "password": CUSTOMER_PASSWORD
        })
        
        assert response.status_code == 200
        data = response.json()
        
        user = data["user"]
        assert "id" in user, "User missing id"
        assert "phone" in user, "User missing phone"
        assert "name" in user, "User missing name"
        assert "role" in user, "User missing role"
        assert "password" not in user, "Password should not be in response"
        
        print(f"✓ Login returns proper user object: {user['name']}")


class TestJWTRegister:
    """Test JWT token generation on register"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup unique test phone"""
        self.test_phone = f"TEST_{uuid.uuid4().hex[:8]}"[:10]
        self.test_phone = f"99{uuid.uuid4().hex[:8]}"[:10]  # Valid phone format
        yield
    
    def test_register_returns_jwt_token(self):
        """Test that register endpoint returns a valid JWT token"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "phone": self.test_phone,
            "password": "testpass123",
            "name": "TEST_JWT_User"
        })
        
        assert response.status_code == 200, f"Register failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "token" in data, "Response missing 'token'"
        assert "user" in data, "Response missing 'user'"
        
        # Verify token is a valid JWT
        token = data["token"]
        assert token.count('.') == 2, "Token should have 3 parts separated by dots"
        
        # Decode and verify token payload
        try:
            payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
            assert "user_id" in payload, "Token missing user_id"
            assert "phone" in payload, "Token missing phone"
            assert "role" in payload, "Token missing role"
            
            # Verify payload values match user
            assert payload["phone"] == self.test_phone
            assert payload["user_id"] == data["user"]["id"]
            assert payload["role"] == "customer"
            
            print(f"✓ Register returns valid JWT token for new user: {self.test_phone}")
        except jwt.InvalidTokenError as e:
            pytest.fail(f"Invalid JWT token: {e}")
        
        # Cleanup: Delete test user
        try:
            requests.delete(f"{BASE_URL}/api/admin/users/{data['user']['id']}")
        except:
            pass
    
    def test_register_user_object_structure(self):
        """Test that register returns proper user object"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "phone": self.test_phone,
            "password": "testpass123",
            "name": "TEST_JWT_User2"
        })
        
        assert response.status_code == 200
        data = response.json()
        
        user = data["user"]
        assert "id" in user, "User missing id"
        assert "phone" in user, "User missing phone"
        assert "name" in user, "User missing name"
        assert "role" in user, "User missing role"
        assert user["role"] == "customer"
        assert "password" not in user, "Password should not be in response"
        
        print(f"✓ Register returns proper user object: {user['name']}")
        
        # Cleanup
        try:
            requests.delete(f"{BASE_URL}/api/admin/users/{user['id']}")
        except:
            pass


class TestJWTOTPVerified:
    """Test JWT token generation on OTP verification"""
    
    def test_otp_verified_existing_user_returns_jwt(self):
        """Test that OTP verified endpoint returns JWT for existing user"""
        response = requests.post(f"{BASE_URL}/api/auth/otp-verified", json={
            "phone": CUSTOMER_PHONE,
            "name": "Test User"
        })
        
        assert response.status_code == 200, f"OTP verified failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "success" in data, "Response missing 'success'"
        assert data["success"] == True, "Success should be True"
        assert "token" in data, "Response missing 'token'"
        assert "user" in data, "Response missing 'user'"
        assert "is_new_user" in data, "Response missing 'is_new_user'"
        assert data["is_new_user"] == False, "Should be existing user"
        
        # Verify token is a valid JWT
        token = data["token"]
        assert token.count('.') == 2, "Token should have 3 parts separated by dots"
        
        # Decode and verify token payload
        try:
            payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
            assert "user_id" in payload, "Token missing user_id"
            assert "phone" in payload, "Token missing phone"
            assert payload["phone"] == CUSTOMER_PHONE
            
            print(f"✓ OTP verified returns valid JWT for existing user: {payload['user_id']}")
        except jwt.InvalidTokenError as e:
            pytest.fail(f"Invalid JWT token: {e}")
    
    def test_otp_verified_new_user_without_name(self):
        """Test that OTP verified prompts for name for new user"""
        new_phone = f"88{uuid.uuid4().hex[:8]}"[:10]
        
        response = requests.post(f"{BASE_URL}/api/auth/otp-verified", json={
            "phone": new_phone
        })
        
        assert response.status_code == 200
        data = response.json()
        
        # Should indicate new user needs name
        assert data["success"] == True
        assert data["is_new_user"] == True
        assert "message" in data or "token" not in data
        
        print(f"✓ OTP verified correctly prompts for name for new user")
    
    def test_otp_verified_new_user_with_name_returns_jwt(self):
        """Test that OTP verified creates user and returns JWT when name provided"""
        new_phone = f"77{uuid.uuid4().hex[:8]}"[:10]
        
        response = requests.post(f"{BASE_URL}/api/auth/otp-verified", json={
            "phone": new_phone,
            "name": "TEST_OTP_NewUser"
        })
        
        assert response.status_code == 200, f"OTP verified failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert data["success"] == True
        assert "token" in data, "Response missing 'token'"
        assert "user" in data, "Response missing 'user'"
        assert data["is_new_user"] == True, "Should be new user"
        
        # Verify token is valid
        token = data["token"]
        try:
            payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
            assert payload["phone"] == new_phone
            assert payload["user_id"] == data["user"]["id"]
            
            print(f"✓ OTP verified creates new user and returns JWT: {payload['user_id']}")
        except jwt.InvalidTokenError as e:
            pytest.fail(f"Invalid JWT token: {e}")
        
        # Cleanup
        try:
            requests.delete(f"{BASE_URL}/api/admin/users/{data['user']['id']}")
        except:
            pass


class TestJWTTokenExpiration:
    """Test JWT token expiration settings"""
    
    def test_token_has_valid_expiration(self):
        """Test that token has proper expiration (30 days)"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "phone": CUSTOMER_PHONE,
            "password": CUSTOMER_PASSWORD
        })
        
        assert response.status_code == 200
        data = response.json()
        token = data["token"]
        
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        
        # Check expiration is set
        assert "exp" in payload
        assert "iat" in payload
        
        # Expiration should be ~30 days from issued at
        exp_diff = payload["exp"] - payload["iat"]
        expected_diff = 24 * 30 * 3600  # 30 days in seconds
        
        # Allow 1 hour tolerance
        assert abs(exp_diff - expected_diff) < 3600, f"Token expiration should be ~30 days, got {exp_diff/3600/24} days"
        
        print(f"✓ Token has valid 30-day expiration")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
