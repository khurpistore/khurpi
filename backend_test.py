#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime, timedelta

class KhurpiAPITester:
    def __init__(self, base_url="https://green-sub-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.customer_user = None
        self.admin_user = None
        self.test_subscription_id = None
        self.test_product_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
            self.failed_tests.append({"test": name, "error": details})

    def make_request(self, method, endpoint, data=None, params=None):
        """Make HTTP request with error handling"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, params=params)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, params=params)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, params=params)
            
            return response
        except Exception as e:
            return None

    def test_customer_signup(self):
        """Test customer signup"""
        test_data = {
            "phone": "9876543210",
            "name": "Test User",
            "password": "test123"
        }
        
        response = self.make_request('POST', 'auth/signup', test_data)
        if response and response.status_code == 200:
            self.customer_user = response.json()
            self.log_test("Customer Signup", True)
            return True
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'Connection failed'
            self.log_test("Customer Signup", False, error_msg)
            return False

    def test_customer_login(self):
        """Test customer login"""
        test_data = {
            "phone": "9876543210",
            "password": "test123"
        }
        
        response = self.make_request('POST', 'auth/login', test_data)
        if response and response.status_code == 200:
            self.customer_user = response.json()
            self.log_test("Customer Login", True)
            return True
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'Connection failed'
            self.log_test("Customer Login", False, error_msg)
            return False

    def test_admin_login(self):
        """Test admin login"""
        response = self.make_request('POST', 'admin/login', params={"username": "admin", "password": "admin"})
        if response and response.status_code == 200:
            self.admin_user = response.json()
            self.log_test("Admin Login", True)
            return True
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'Connection failed'
            self.log_test("Admin Login", False, error_msg)
            return False

    def test_get_products(self):
        """Test get products"""
        response = self.make_request('GET', 'products')
        if response and response.status_code == 200:
            products = response.json()
            if len(products) > 0:
                self.test_product_id = products[0]['id']
            self.log_test("Get Products", True, f"Found {len(products)} products")
            return True
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'Connection failed'
            self.log_test("Get Products", False, error_msg)
            return False

    def test_create_product(self):
        """Test create product (admin)"""
        test_data = {
            "name": "Test Microgreen",
            "image": "https://example.com/test.jpg",
            "benefit": "Test benefit for health",
            "price": 50.0,
            "growth_days": 7,
            "active": True
        }
        
        response = self.make_request('POST', 'products', test_data)
        if response and response.status_code == 200:
            product = response.json()
            self.test_product_id = product['id']
            self.log_test("Create Product", True)
            return True
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'Connection failed'
            self.log_test("Create Product", False, error_msg)
            return False

    def test_update_user_address(self):
        """Test update user address"""
        if not self.customer_user:
            self.log_test("Update User Address", False, "No customer user available")
            return False
            
        test_address = "123 Test Street, Test City, 12345"
        response = self.make_request('PUT', f'users/{self.customer_user["id"]}/address', 
                                   params={"address": test_address})
        
        if response and response.status_code == 200:
            self.log_test("Update User Address", True)
            return True
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'Connection failed'
            self.log_test("Update User Address", False, error_msg)
            return False

    def test_create_subscription(self):
        """Test create subscription"""
        if not self.customer_user or not self.test_product_id:
            self.log_test("Create Subscription", False, "Missing customer user or product")
            return False
            
        test_data = {
            "frequency": "weekly",
            "delivery_day": "Monday",
            "start_date": (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d'),
            "tray_count": 2,
            "items": [{"product_id": self.test_product_id, "quantity": 2}],
            "total_price": 100.0
        }
        
        response = self.make_request('POST', 'subscriptions', test_data, 
                                   params={"user_id": self.customer_user["id"]})
        
        if response and response.status_code == 200:
            subscription = response.json()
            self.test_subscription_id = subscription['id']
            self.log_test("Create Subscription", True)
            return True
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'Connection failed'
            self.log_test("Create Subscription", False, error_msg)
            return False

    def test_get_subscriptions(self):
        """Test get user subscriptions"""
        if not self.customer_user:
            self.log_test("Get Subscriptions", False, "No customer user available")
            return False
            
        response = self.make_request('GET', 'subscriptions', 
                                   params={"user_id": self.customer_user["id"]})
        
        if response and response.status_code == 200:
            subscriptions = response.json()
            self.log_test("Get Subscriptions", True, f"Found {len(subscriptions)} subscriptions")
            return True
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'Connection failed'
            self.log_test("Get Subscriptions", False, error_msg)
            return False

    def test_update_subscription(self):
        """Test update subscription status"""
        if not self.test_subscription_id:
            self.log_test("Update Subscription", False, "No subscription ID available")
            return False
            
        test_data = {"status": "paused"}
        response = self.make_request('PUT', f'subscriptions/{self.test_subscription_id}', test_data)
        
        if response and response.status_code == 200:
            self.log_test("Update Subscription", True)
            return True
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'Connection failed'
            self.log_test("Update Subscription", False, error_msg)
            return False

    def test_get_payments(self):
        """Test get payment history"""
        if not self.customer_user:
            self.log_test("Get Payments", False, "No customer user available")
            return False
            
        response = self.make_request('GET', 'payments', 
                                   params={"user_id": self.customer_user["id"]})
        
        if response and response.status_code == 200:
            payments = response.json()
            self.log_test("Get Payments", True, f"Found {len(payments)} payments")
            return True
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'Connection failed'
            self.log_test("Get Payments", False, error_msg)
            return False

    def test_admin_dashboard(self):
        """Test admin dashboard"""
        response = self.make_request('GET', 'admin/dashboard')
        
        if response and response.status_code == 200:
            dashboard = response.json()
            required_fields = ['total_subscriptions', 'active_subscriptions', 'today_deliveries', 'total_revenue']
            if all(field in dashboard for field in required_fields):
                self.log_test("Admin Dashboard", True)
                return True
            else:
                self.log_test("Admin Dashboard", False, "Missing required fields")
                return False
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'Connection failed'
            self.log_test("Admin Dashboard", False, error_msg)
            return False

    def test_admin_deliveries(self):
        """Test admin today's deliveries"""
        response = self.make_request('GET', 'admin/deliveries/today')
        
        if response and response.status_code == 200:
            deliveries = response.json()
            self.log_test("Admin Today's Deliveries", True, f"Found {len(deliveries)} deliveries")
            return True
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'Connection failed'
            self.log_test("Admin Today's Deliveries", False, error_msg)
            return False

    def test_admin_inventory(self):
        """Test admin inventory planning"""
        response = self.make_request('GET', 'admin/inventory')
        
        if response and response.status_code == 200:
            inventory = response.json()
            self.log_test("Admin Inventory Planning", True, f"Found {len(inventory)} items")
            return True
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'Connection failed'
            self.log_test("Admin Inventory Planning", False, error_msg)
            return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Khurpi API Tests...")
        print("=" * 50)
        
        # Customer flow tests
        print("\n📱 Customer Flow Tests:")
        self.test_customer_signup()
        self.test_customer_login()
        self.test_get_products()
        self.test_update_user_address()
        self.test_create_subscription()
        self.test_get_subscriptions()
        self.test_update_subscription()
        self.test_get_payments()
        
        # Admin flow tests
        print("\n👨‍💼 Admin Flow Tests:")
        self.test_admin_login()
        self.test_create_product()
        self.test_admin_dashboard()
        self.test_admin_deliveries()
        self.test_admin_inventory()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for test in self.failed_tests:
                print(f"  - {test['test']}: {test['error']}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = KhurpiAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())