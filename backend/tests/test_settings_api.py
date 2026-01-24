"""
Khurpi Microgreens Settings API Tests
Tests for: Shop Config, Delivery Pricing, Subscription Plans, Delivery Fee Calculation
"""
import pytest
import requests
import os
import math

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Shop coordinates (ACE City Noida Extension)
SHOP_LAT = 28.5672
SHOP_LON = 77.4538


class TestSettingsAPIs:
    """Tests for settings endpoints - GET /api/settings/*"""
    
    def test_get_shop_settings(self):
        """Test GET /api/settings/shop returns shop configuration"""
        response = requests.get(f"{BASE_URL}/api/settings/shop")
        assert response.status_code == 200
        data = response.json()
        
        # Verify required fields
        assert "name" in data
        assert "address" in data
        assert "latitude" in data
        assert "longitude" in data
        
        # Verify expected values
        assert data["name"] == "Khurpi Microgreens"
        assert "E-312" in data["address"]
        assert "ACE City" in data["address"]
        assert "Noida Extension" in data["address"]
        assert "201306" in data["address"]
        
        # Verify coordinates
        assert data["latitude"] == 28.5672
        assert data["longitude"] == 77.4538
        
        print(f"Shop config: {data['name']} at {data['address']}")
    
    def test_get_delivery_pricing(self):
        """Test GET /api/settings/delivery-pricing returns pricing tiers"""
        response = requests.get(f"{BASE_URL}/api/settings/delivery-pricing")
        assert response.status_code == 200
        data = response.json()
        
        # Verify it's a list
        assert isinstance(data, list)
        assert len(data) >= 4  # Should have at least 4 tiers
        
        # Verify tier structure
        for tier in data:
            assert "max_distance" in tier
            assert "fee" in tier
            assert "label" in tier
        
        # Verify expected pricing tiers
        # Within 1km = Free
        tier_1km = next((t for t in data if t["max_distance"] == 1), None)
        assert tier_1km is not None
        assert tier_1km["fee"] == 0
        
        # Within 5km = ₹50
        tier_5km = next((t for t in data if t["max_distance"] == 5), None)
        assert tier_5km is not None
        assert tier_5km["fee"] == 50
        
        # Within 10km = ₹100
        tier_10km = next((t for t in data if t["max_distance"] == 10), None)
        assert tier_10km is not None
        assert tier_10km["fee"] == 100
        
        # Beyond 10km = ₹150
        tier_beyond = next((t for t in data if t["max_distance"] > 10), None)
        assert tier_beyond is not None
        assert tier_beyond["fee"] == 150
        
        print(f"Delivery pricing: {len(data)} tiers configured")
    
    def test_get_subscription_plans(self):
        """Test GET /api/settings/subscription-plans returns plans with discounts"""
        response = requests.get(f"{BASE_URL}/api/settings/subscription-plans")
        assert response.status_code == 200
        data = response.json()
        
        # Verify it's a list
        assert isinstance(data, list)
        assert len(data) >= 3  # Should have at least 3 plans
        
        # Verify plan structure
        for plan in data:
            assert "id" in plan
            assert "name" in plan
            assert "frequency" in plan
            assert "deliveries_per_week" in plan
            assert "discount" in plan
        
        # Verify expected plans and discounts
        # Weekly (1x/week) = 5% discount
        weekly_plan = next((p for p in data if p["frequency"] == "weekly"), None)
        assert weekly_plan is not None
        assert weekly_plan["discount"] == 5
        assert weekly_plan["deliveries_per_week"] == 1
        
        # Twice weekly (2x/week) = 10% discount
        twice_weekly = next((p for p in data if p["frequency"] == "twice_weekly"), None)
        assert twice_weekly is not None
        assert twice_weekly["discount"] == 10
        assert twice_weekly["deliveries_per_week"] == 2
        
        # Daily (6 days/week) = 25% discount
        daily_plan = next((p for p in data if p["frequency"] == "six_days"), None)
        assert daily_plan is not None
        assert daily_plan["discount"] == 25
        assert daily_plan["deliveries_per_week"] == 6
        
        print(f"Subscription plans: {len(data)} plans with discounts")


class TestDeliveryFeeCalculation:
    """Tests for delivery fee calculation API"""
    
    def test_calculate_delivery_fee_same_location(self):
        """Test delivery fee at shop location (0 km) = Free"""
        response = requests.post(
            f"{BASE_URL}/api/settings/calculate-delivery-fee?lat={SHOP_LAT}&lon={SHOP_LON}"
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "distance" in data
        assert "fee" in data
        assert "label" in data
        
        # At shop location, distance should be ~0
        assert data["distance"] < 0.1
        assert data["fee"] == 0
        print(f"Same location: {data['distance']} km, fee: ₹{data['fee']}")
    
    def test_calculate_delivery_fee_within_1km(self):
        """Test delivery fee within 1km = Free"""
        # Coordinates ~0.5km from shop
        lat = 28.5700
        lon = 77.4550
        
        response = requests.post(
            f"{BASE_URL}/api/settings/calculate-delivery-fee?lat={lat}&lon={lon}"
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["distance"] <= 1
        assert data["fee"] == 0
        print(f"Within 1km: {data['distance']} km, fee: ₹{data['fee']}")
    
    def test_calculate_delivery_fee_within_5km(self):
        """Test delivery fee within 5km = ₹50"""
        # Coordinates ~3km from shop (Noida Sector 62 area)
        lat = 28.5500
        lon = 77.4200
        
        response = requests.post(
            f"{BASE_URL}/api/settings/calculate-delivery-fee?lat={lat}&lon={lon}"
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["distance"] > 1
        assert data["distance"] <= 5
        assert data["fee"] == 50
        print(f"Within 5km: {data['distance']} km, fee: ₹{data['fee']}")
    
    def test_calculate_delivery_fee_within_10km(self):
        """Test delivery fee within 10km = ₹100"""
        # Coordinates ~7km from shop (Noida Sector 18 area)
        lat = 28.5700
        lon = 77.3200
        
        response = requests.post(
            f"{BASE_URL}/api/settings/calculate-delivery-fee?lat={lat}&lon={lon}"
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["distance"] > 5
        assert data["distance"] <= 10
        assert data["fee"] == 100
        print(f"Within 10km: {data['distance']} km, fee: ₹{data['fee']}")
    
    def test_calculate_delivery_fee_beyond_10km(self):
        """Test delivery fee beyond 10km = ₹150"""
        # Coordinates ~15km from shop (Greater Noida area)
        lat = 28.4500
        lon = 77.5000
        
        response = requests.post(
            f"{BASE_URL}/api/settings/calculate-delivery-fee?lat={lat}&lon={lon}"
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["distance"] > 10
        assert data["fee"] == 150
        print(f"Beyond 10km: {data['distance']} km, fee: ₹{data['fee']}")


class TestAdminSettingsAPIs:
    """Tests for admin settings management endpoints"""
    
    def test_get_all_admin_settings(self):
        """Test GET /api/admin/settings/all returns all settings"""
        response = requests.get(f"{BASE_URL}/api/admin/settings/all")
        assert response.status_code == 200
        data = response.json()
        
        # Verify all sections present
        assert "shop_config" in data
        assert "delivery_pricing" in data
        assert "subscription_plans" in data
        
        # Verify shop config
        assert data["shop_config"]["name"] == "Khurpi Microgreens"
        
        # Verify delivery pricing is a list
        assert isinstance(data["delivery_pricing"], list)
        
        # Verify subscription plans is a list
        assert isinstance(data["subscription_plans"], list)
        
        print("Admin settings: All sections loaded successfully")
    
    def test_update_shop_settings(self):
        """Test PUT /api/admin/settings/shop updates shop config"""
        # Get current settings
        current = requests.get(f"{BASE_URL}/api/settings/shop").json()
        
        # Update with same values (to not break other tests)
        response = requests.put(f"{BASE_URL}/api/admin/settings/shop", json=current)
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] == True
        print("Shop settings update: Success")
    
    def test_update_delivery_pricing(self):
        """Test PUT /api/admin/settings/delivery-pricing updates pricing"""
        # Get current pricing
        current = requests.get(f"{BASE_URL}/api/settings/delivery-pricing").json()
        
        # Update with same values
        response = requests.put(f"{BASE_URL}/api/admin/settings/delivery-pricing", json=current)
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] == True
        print("Delivery pricing update: Success")
    
    def test_update_delivery_pricing_validation(self):
        """Test delivery pricing validation - missing fields"""
        invalid_data = [{"max_distance": 5}]  # Missing fee and label
        
        response = requests.put(f"{BASE_URL}/api/admin/settings/delivery-pricing", json=invalid_data)
        assert response.status_code == 400
        print("Delivery pricing validation: Invalid data rejected")
    
    def test_update_subscription_plans(self):
        """Test PUT /api/admin/settings/subscription-plans updates plans"""
        # Get current plans
        current = requests.get(f"{BASE_URL}/api/settings/subscription-plans").json()
        
        # Update with same values
        response = requests.put(f"{BASE_URL}/api/admin/settings/subscription-plans", json=current)
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] == True
        print("Subscription plans update: Success")
    
    def test_update_subscription_plans_validation(self):
        """Test subscription plans validation - missing fields"""
        invalid_data = [{"id": "test", "name": "Test"}]  # Missing required fields
        
        response = requests.put(f"{BASE_URL}/api/admin/settings/subscription-plans", json=invalid_data)
        assert response.status_code == 400
        print("Subscription plans validation: Invalid data rejected")


class TestAdminLogin:
    """Admin authentication tests"""
    
    def test_admin_login_success(self):
        """Test admin login with correct credentials"""
        response = requests.post(f"{BASE_URL}/api/admin/login?username=admin&password=admin")
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] == True
        assert data["role"] == "admin"
        print("Admin login: Success")
    
    def test_admin_login_failure(self):
        """Test admin login with wrong credentials"""
        response = requests.post(f"{BASE_URL}/api/admin/login?username=admin&password=wrong")
        assert response.status_code == 401
        print("Admin login: Invalid credentials rejected")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
