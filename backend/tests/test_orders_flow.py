"""
Test suite for Khurpi Microgreens Order Flow
Tests: Order creation, User orders, Admin orders, Admin payments
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://admin-spend-tracker.preview.emergentagent.com').rstrip('/')

# Test user credentials from the request
TEST_USER_ID = "3fc5cc8b-1126-4385-bbc5-656c44990553"
TEST_USER_PHONE = "9876543210"
TEST_USER_PASSWORD = "test123"
TEST_ADDRESS_ID = "5c41d79d-b97d-4148-a01c-cb5f059069c6"
TEST_ORDER_ID = "082badfb-42c8-45bc-bd40-01ad14d42e32"

# Admin credentials
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "Khurpi2026Secure"


class TestHealthCheck:
    """Health check tests"""
    
    def test_health_endpoint(self):
        """Test health endpoint is accessible"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ Health check passed")


class TestProductsAPI:
    """Products API tests"""
    
    def test_get_products(self):
        """Test getting all products"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        products = response.json()
        assert isinstance(products, list)
        assert len(products) > 0
        print(f"✓ Got {len(products)} products")
        
        # Verify product structure
        product = products[0]
        assert "id" in product
        assert "name" in product
        assert "price" in product
        assert "image" in product
        print("✓ Product structure is correct")


class TestUserAuthentication:
    """User authentication tests"""
    
    def test_user_login(self):
        """Test user login with phone and password"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "phone": TEST_USER_PHONE,
            "password": TEST_USER_PASSWORD
        })
        assert response.status_code == 200
        user = response.json()
        assert user["id"] == TEST_USER_ID
        assert user["phone"] == TEST_USER_PHONE
        print(f"✓ User login successful: {user['name']}")
    
    def test_user_login_invalid_credentials(self):
        """Test login with wrong password"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "phone": TEST_USER_PHONE,
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Invalid credentials correctly rejected")


class TestUserAddresses:
    """User addresses tests"""
    
    def test_get_user_addresses(self):
        """Test getting user addresses"""
        response = requests.get(f"{BASE_URL}/api/users/{TEST_USER_ID}/addresses")
        assert response.status_code == 200
        addresses = response.json()
        assert isinstance(addresses, list)
        assert len(addresses) > 0
        print(f"✓ Got {len(addresses)} addresses for user")
        
        # Verify address structure
        address = addresses[0]
        assert "id" in address
        assert "address_line" in address
        assert "city" in address
        print("✓ Address structure is correct")


class TestOrderCreation:
    """Order creation tests"""
    
    def test_create_order_success(self):
        """Test creating a new order"""
        # Get a product first
        products_response = requests.get(f"{BASE_URL}/api/products")
        products = products_response.json()
        product = products[0]
        
        order_data = {
            "user_id": TEST_USER_ID,
            "address_id": TEST_ADDRESS_ID,
            "items": [
                {
                    "product_id": product["id"],
                    "quantity": 1,
                    "price": product["price"]
                }
            ],
            "subtotal": product["price"],
            "delivery_fee": 0,
            "total": product["price"],
            "order_type": "one_time",
            "payment_id": f"pay_test_{uuid.uuid4().hex[:8]}",
            "razorpay_order_id": f"order_test_{uuid.uuid4().hex[:8]}",
            "payment_status": "paid"
        }
        
        response = requests.post(f"{BASE_URL}/api/orders", json=order_data)
        assert response.status_code == 200
        order = response.json()
        
        # Verify order structure
        assert "id" in order
        assert order["user_id"] == TEST_USER_ID
        assert order["address_id"] == TEST_ADDRESS_ID
        assert order["status"] == "confirmed"  # Should be confirmed since payment_status is paid
        assert order["payment_status"] == "paid"
        print(f"✓ Order created successfully: {order['id']}")
        
        # Store order ID for cleanup
        return order["id"]
    
    def test_create_order_invalid_user(self):
        """Test creating order with invalid user"""
        order_data = {
            "user_id": "invalid-user-id",
            "address_id": TEST_ADDRESS_ID,
            "items": [{"product_id": "test", "quantity": 1, "price": 100}],
            "subtotal": 100,
            "delivery_fee": 0,
            "total": 100,
            "order_type": "one_time",
            "payment_status": "pending"
        }
        
        response = requests.post(f"{BASE_URL}/api/orders", json=order_data)
        assert response.status_code == 404
        print("✓ Invalid user correctly rejected")
    
    def test_create_order_invalid_address(self):
        """Test creating order with invalid address"""
        order_data = {
            "user_id": TEST_USER_ID,
            "address_id": "invalid-address-id",
            "items": [{"product_id": "test", "quantity": 1, "price": 100}],
            "subtotal": 100,
            "delivery_fee": 0,
            "total": 100,
            "order_type": "one_time",
            "payment_status": "pending"
        }
        
        response = requests.post(f"{BASE_URL}/api/orders", json=order_data)
        assert response.status_code == 404
        print("✓ Invalid address correctly rejected")


class TestUserOrders:
    """User orders retrieval tests"""
    
    def test_get_user_orders(self):
        """Test getting orders for a user"""
        response = requests.get(f"{BASE_URL}/api/orders?user_id={TEST_USER_ID}")
        assert response.status_code == 200
        orders = response.json()
        assert isinstance(orders, list)
        assert len(orders) > 0
        print(f"✓ Got {len(orders)} orders for user")
        
        # Verify order structure with enriched data
        order = orders[0]
        assert "id" in order
        assert "user_id" in order
        assert "items" in order
        assert "total" in order
        assert "status" in order
        
        # Verify items have product details
        if order["items"]:
            item = order["items"][0]
            assert "product" in item
            if item["product"]:
                assert "name" in item["product"]
        
        # Verify address is included
        assert "address" in order
        print("✓ Order structure with enriched data is correct")
    
    def test_get_specific_order(self):
        """Test getting a specific order by ID"""
        response = requests.get(f"{BASE_URL}/api/orders/{TEST_ORDER_ID}")
        assert response.status_code == 200
        order = response.json()
        
        assert order["id"] == TEST_ORDER_ID
        assert order["user_id"] == TEST_USER_ID
        assert "items" in order
        assert "address" in order
        print(f"✓ Got specific order: {order['id']}")
    
    def test_get_nonexistent_order(self):
        """Test getting a non-existent order"""
        response = requests.get(f"{BASE_URL}/api/orders/nonexistent-order-id")
        assert response.status_code == 404
        print("✓ Non-existent order correctly returns 404")


class TestAdminOrders:
    """Admin orders API tests"""
    
    def test_get_all_orders_admin(self):
        """Test admin getting all orders"""
        response = requests.get(f"{BASE_URL}/api/admin/orders")
        assert response.status_code == 200
        orders = response.json()
        assert isinstance(orders, list)
        assert len(orders) > 0
        print(f"✓ Admin got {len(orders)} orders")
        
        # Verify admin order structure (includes user and address)
        order = orders[0]
        assert "id" in order
        assert "user" in order
        assert "address" in order
        assert "items" in order
        
        # Verify user info is included
        if order["user"]:
            assert "name" in order["user"]
            assert "phone" in order["user"]
        print("✓ Admin order structure is correct")
    
    def test_update_order_status(self):
        """Test updating order status"""
        # First get an order
        orders_response = requests.get(f"{BASE_URL}/api/admin/orders")
        orders = orders_response.json()
        order_id = orders[0]["id"]
        
        # Update status to processing
        response = requests.put(f"{BASE_URL}/api/admin/orders/{order_id}/status?status=processing")
        assert response.status_code == 200
        updated_order = response.json()
        assert updated_order["status"] == "processing"
        print(f"✓ Order status updated to processing")
        
        # Update back to confirmed
        response = requests.put(f"{BASE_URL}/api/admin/orders/{order_id}/status?status=confirmed")
        assert response.status_code == 200
        print("✓ Order status reverted to confirmed")
    
    def test_update_order_invalid_status(self):
        """Test updating order with invalid status"""
        response = requests.put(f"{BASE_URL}/api/admin/orders/{TEST_ORDER_ID}/status?status=invalid_status")
        assert response.status_code == 400
        print("✓ Invalid status correctly rejected")


class TestAdminPayments:
    """Admin payments API tests"""
    
    def test_get_all_payments_admin(self):
        """Test admin getting all payments"""
        response = requests.get(f"{BASE_URL}/api/admin/payments")
        assert response.status_code == 200
        payments = response.json()
        assert isinstance(payments, list)
        assert len(payments) > 0
        print(f"✓ Admin got {len(payments)} payments")
        
        # Verify payment structure
        payment = payments[0]
        assert "id" in payment
        assert "amount" in payment
        assert "status" in payment
        assert "user" in payment
        
        # Verify order is linked
        if payment.get("order"):
            assert "id" in payment["order"]
        print("✓ Admin payment structure is correct")


class TestAdminLogin:
    """Admin login tests"""
    
    def test_admin_login_success(self):
        """Test admin login with correct credentials"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            params={"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert data["role"] == "admin"
        print("✓ Admin login successful")
    
    def test_admin_login_invalid(self):
        """Test admin login with wrong credentials"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            params={"username": "admin", "password": "wrongpassword"}
        )
        assert response.status_code == 401
        print("✓ Invalid admin credentials correctly rejected")


class TestDeliveryFeeCalculation:
    """Delivery fee calculation tests"""
    
    def test_calculate_delivery_fee(self):
        """Test delivery fee calculation"""
        # ACE City Noida coordinates
        lat = 28.5672
        lon = 77.4538
        
        response = requests.post(f"{BASE_URL}/api/settings/calculate-delivery-fee?lat={lat}&lon={lon}")
        assert response.status_code == 200
        data = response.json()
        
        assert "fee" in data
        assert "distance" in data
        assert "label" in data
        print(f"✓ Delivery fee calculated: ₹{data['fee']} for {data['distance']:.2f}km")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
