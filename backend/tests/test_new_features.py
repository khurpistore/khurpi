"""
Test new features for Khurpi Microgreens app:
1. Admin order status update
2. Coupon validation endpoint
3. Free delivery threshold from settings
4. Order detail endpoint
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://microgreen-mgmt.preview.emergentagent.com').rstrip('/')

class TestAdminOrderStatusUpdate:
    """Test admin order status update functionality"""
    
    def test_get_admin_orders(self):
        """Test GET /api/admin/orders returns orders list"""
        response = requests.get(f"{BASE_URL}/api/admin/orders")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ GET /api/admin/orders returned {len(data)} orders")
        return data
    
    def test_update_order_status_preparing(self):
        """Test PUT /api/admin/orders/{id}/status with JSON body"""
        # First get an order
        orders_response = requests.get(f"{BASE_URL}/api/admin/orders")
        orders = orders_response.json()
        
        if not orders:
            pytest.skip("No orders available to test status update")
        
        order_id = orders[0]['id']
        original_status = orders[0]['status']
        
        # Update status to 'preparing'
        response = requests.put(
            f"{BASE_URL}/api/admin/orders/{order_id}/status",
            json={"status": "preparing"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'preparing'
        print(f"✅ Order {order_id[:8]} status updated to 'preparing'")
        
        # Restore original status
        requests.put(
            f"{BASE_URL}/api/admin/orders/{order_id}/status",
            json={"status": original_status}
        )
    
    def test_update_order_status_out_for_delivery(self):
        """Test updating order status to out_for_delivery"""
        orders_response = requests.get(f"{BASE_URL}/api/admin/orders")
        orders = orders_response.json()
        
        if not orders:
            pytest.skip("No orders available to test status update")
        
        order_id = orders[0]['id']
        original_status = orders[0]['status']
        
        response = requests.put(
            f"{BASE_URL}/api/admin/orders/{order_id}/status",
            json={"status": "out_for_delivery"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'out_for_delivery'
        print(f"✅ Order {order_id[:8]} status updated to 'out_for_delivery'")
        
        # Restore original status
        requests.put(
            f"{BASE_URL}/api/admin/orders/{order_id}/status",
            json={"status": original_status}
        )
    
    def test_update_order_status_invalid(self):
        """Test updating order status with invalid status"""
        orders_response = requests.get(f"{BASE_URL}/api/admin/orders")
        orders = orders_response.json()
        
        if not orders:
            pytest.skip("No orders available to test status update")
        
        order_id = orders[0]['id']
        
        response = requests.put(
            f"{BASE_URL}/api/admin/orders/{order_id}/status",
            json={"status": "invalid_status"}
        )
        
        assert response.status_code == 400
        print("✅ Invalid status correctly rejected with 400")
    
    def test_update_order_status_nonexistent_order(self):
        """Test updating status for non-existent order"""
        response = requests.put(
            f"{BASE_URL}/api/admin/orders/nonexistent-order-id/status",
            json={"status": "preparing"}
        )
        
        assert response.status_code == 404
        print("✅ Non-existent order correctly returns 404")


class TestCouponValidation:
    """Test coupon validation endpoint"""
    
    def test_coupon_validate_endpoint_exists(self):
        """Test that coupon validation endpoint exists (POST method)"""
        response = requests.post(
            f"{BASE_URL}/api/coupons/validate",
            params={"code": "TESTCODE", "order_amount": 500}
        )
        # Should return 404 (coupon not found) or 200 (valid coupon)
        # Not 500 (server error) or 405 (method not allowed)
        assert response.status_code in [200, 404, 400]
        print(f"✅ Coupon validation endpoint exists (status: {response.status_code})")
    
    def test_coupon_validate_invalid_code(self):
        """Test coupon validation with invalid code"""
        response = requests.post(
            f"{BASE_URL}/api/coupons/validate",
            params={"code": "INVALIDCODE123", "order_amount": 500}
        )
        # Should return 404 for invalid coupon
        assert response.status_code in [404, 400]
        print("✅ Invalid coupon correctly rejected")


class TestSettingsEndpoints:
    """Test settings endpoints for free delivery threshold"""
    
    def test_get_all_settings(self):
        """Test GET /api/admin/settings/all returns settings"""
        response = requests.get(f"{BASE_URL}/api/admin/settings/all")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        print(f"✅ GET /api/admin/settings/all returned settings")
        
        # Check for shop_config with free_delivery_threshold
        if 'shop_config' in data:
            shop_config = data['shop_config']
            if 'free_delivery_threshold' in shop_config:
                print(f"   Free delivery threshold: ₹{shop_config['free_delivery_threshold']}")
        
        return data
    
    def test_delivery_fee_calculation(self):
        """Test delivery fee calculation endpoint"""
        # Test with Noida coordinates
        response = requests.post(
            f"{BASE_URL}/api/settings/calculate-delivery-fee",
            params={"lat": 28.5672, "lon": 77.4538}
        )
        assert response.status_code == 200
        data = response.json()
        assert 'fee' in data
        assert 'distance' in data
        print(f"✅ Delivery fee calculation: ₹{data['fee']} for {data['distance']}km")


class TestOrderDetailEndpoint:
    """Test order detail endpoint"""
    
    def test_get_order_by_id(self):
        """Test GET /api/orders/{order_id} returns order details"""
        # First get list of orders
        orders_response = requests.get(f"{BASE_URL}/api/admin/orders")
        orders = orders_response.json()
        
        if not orders:
            pytest.skip("No orders available to test order detail")
        
        order_id = orders[0]['id']
        
        response = requests.get(f"{BASE_URL}/api/orders/{order_id}")
        assert response.status_code == 200
        data = response.json()
        
        # Verify order structure
        assert 'id' in data
        assert 'items' in data
        assert 'total' in data
        assert 'status' in data
        print(f"✅ Order detail endpoint returns order {order_id[:8]}")
        print(f"   Status: {data['status']}, Total: ₹{data['total']}")
    
    def test_get_order_nonexistent(self):
        """Test GET /api/orders/{order_id} for non-existent order"""
        response = requests.get(f"{BASE_URL}/api/orders/nonexistent-order-id")
        assert response.status_code == 404
        print("✅ Non-existent order correctly returns 404")


class TestUserOrdersEndpoint:
    """Test user orders endpoint"""
    
    def test_get_user_orders(self):
        """Test GET /api/orders?user_id={user_id} returns user orders"""
        # Use test user ID from previous tests
        test_user_id = "3fc5cc8b-1126-4385-bbc5-656c44990553"
        
        response = requests.get(f"{BASE_URL}/api/orders", params={"user_id": test_user_id})
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ User orders endpoint returned {len(data)} orders for user")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
