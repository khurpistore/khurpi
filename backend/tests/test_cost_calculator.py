"""
Cost Calculator Backend Tests
Tests CRUD operations for:
- One-time purchases with depreciation
- Monthly fixed costs
- Production/variable costs
- Product cost configurations
- Cost calculation endpoint
"""

import pytest
import requests
import os
import uuid
from datetime import datetime, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
if not BASE_URL:
    BASE_URL = "https://july-branch.preview.emergentagent.com"


class TestCostCalculatorCategories:
    """Test categories endpoint"""
    
    def test_get_categories(self):
        """GET /api/admin/cost-calculator/categories returns all category types"""
        response = requests.get(f"{BASE_URL}/api/admin/cost-calculator/categories")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "one_time" in data, "Missing 'one_time' categories"
        assert "fixed" in data, "Missing 'fixed' categories"
        assert "production" in data, "Missing 'production' categories"
        
        # Verify one_time categories
        one_time_names = [c["name"] for c in data["one_time"]]
        assert "racks" in one_time_names
        assert "lights" in one_time_names
        assert "equipment" in one_time_names
        
        # Verify fixed categories
        fixed_names = [c["name"] for c in data["fixed"]]
        assert "rent" in fixed_names
        assert "electricity" in fixed_names
        assert "salary" in fixed_names
        
        # Verify production categories
        production_names = [c["name"] for c in data["production"]]
        assert "seeds" in production_names
        assert "soil" in production_names
        assert "labor" in production_names
        
        print(f"✓ Categories endpoint returns all 3 types with {len(data['one_time'])} one_time, {len(data['fixed'])} fixed, {len(data['production'])} production")


class TestOneTimePurchases:
    """Test One-Time Purchases CRUD with depreciation calculations"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Store created item IDs for cleanup"""
        self.created_ids = []
        yield
        # Cleanup after tests
        for item_id in self.created_ids:
            try:
                requests.delete(f"{BASE_URL}/api/admin/cost-calculator/one-time/{item_id}")
            except:
                pass
    
    def test_get_one_time_purchases(self):
        """GET /api/admin/cost-calculator/one-time returns purchases with depreciation"""
        response = requests.get(f"{BASE_URL}/api/admin/cost-calculator/one-time")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "purchases" in data
        assert "summary" in data
        assert "total_purchase_cost" in data["summary"]
        assert "total_monthly_depreciation" in data["summary"]
        assert "total_current_value" in data["summary"]
        
        print(f"✓ One-time purchases: {len(data['purchases'])} items, total cost ₹{data['summary']['total_purchase_cost']}")
    
    def test_create_one_time_purchase(self):
        """POST /api/admin/cost-calculator/one-time creates a new purchase"""
        purchase_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
        payload = {
            "name": "TEST_Grow Rack 5-Tier",
            "category": "racks",
            "purchase_cost": 5000,
            "purchase_date": purchase_date,
            "useful_life_months": 36,
            "salvage_value": 500,
            "notes": "Test purchase for automated testing"
        }
        
        response = requests.post(f"{BASE_URL}/api/admin/cost-calculator/one-time", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "id" in data
        self.created_ids.append(data["id"])
        
        assert data["name"] == payload["name"]
        assert data["category"] == payload["category"]
        assert data["purchase_cost"] == payload["purchase_cost"]
        assert data["useful_life_months"] == payload["useful_life_months"]
        
        print(f"✓ Created one-time purchase: {data['name']} with ID {data['id']}")
        
        # Verify it appears in GET list
        get_response = requests.get(f"{BASE_URL}/api/admin/cost-calculator/one-time")
        assert get_response.status_code == 200
        purchases = get_response.json()["purchases"]
        created_item = next((p for p in purchases if p["id"] == data["id"]), None)
        assert created_item is not None, "Created item not found in list"
        
        # Verify depreciation calculation
        assert "monthly_depreciation" in created_item
        assert "current_value" in created_item
        assert "months_remaining" in created_item
        
        # Verify straight-line depreciation calculation
        # (purchase_cost - salvage_value) / useful_life_months
        expected_monthly_dep = (5000 - 500) / 36
        assert abs(created_item["monthly_depreciation"] - expected_monthly_dep) < 0.01, \
            f"Depreciation mismatch: expected {expected_monthly_dep}, got {created_item['monthly_depreciation']}"
        
        print(f"✓ Depreciation verified: ₹{created_item['monthly_depreciation']}/month")
    
    def test_update_one_time_purchase(self):
        """PUT /api/admin/cost-calculator/one-time/:id updates a purchase"""
        # First create
        payload = {
            "name": "TEST_LED Lights",
            "category": "lights",
            "purchase_cost": 3000,
            "purchase_date": datetime.now().strftime('%Y-%m-%d'),
            "useful_life_months": 24,
            "salvage_value": 0
        }
        create_response = requests.post(f"{BASE_URL}/api/admin/cost-calculator/one-time", json=payload)
        assert create_response.status_code == 200
        item_id = create_response.json()["id"]
        self.created_ids.append(item_id)
        
        # Update
        update_payload = {
            "name": "TEST_LED Grow Lights Updated",
            "category": "lights",
            "purchase_cost": 3500,
            "purchase_date": payload["purchase_date"],
            "useful_life_months": 36,
            "salvage_value": 100
        }
        update_response = requests.put(f"{BASE_URL}/api/admin/cost-calculator/one-time/{item_id}", json=update_payload)
        assert update_response.status_code == 200
        
        updated = update_response.json()
        assert updated["name"] == update_payload["name"]
        assert updated["purchase_cost"] == update_payload["purchase_cost"]
        assert updated["useful_life_months"] == update_payload["useful_life_months"]
        
        print(f"✓ Updated one-time purchase: {updated['name']}")
    
    def test_delete_one_time_purchase(self):
        """DELETE /api/admin/cost-calculator/one-time/:id removes a purchase"""
        # First create
        payload = {
            "name": "TEST_Fans to Delete",
            "category": "fans",
            "purchase_cost": 1000,
            "purchase_date": datetime.now().strftime('%Y-%m-%d'),
            "useful_life_months": 24,
            "salvage_value": 0
        }
        create_response = requests.post(f"{BASE_URL}/api/admin/cost-calculator/one-time", json=payload)
        assert create_response.status_code == 200
        item_id = create_response.json()["id"]
        
        # Delete
        delete_response = requests.delete(f"{BASE_URL}/api/admin/cost-calculator/one-time/{item_id}")
        assert delete_response.status_code == 200
        assert delete_response.json()["success"] == True
        
        # Verify deleted
        get_response = requests.get(f"{BASE_URL}/api/admin/cost-calculator/one-time")
        purchases = get_response.json()["purchases"]
        deleted_item = next((p for p in purchases if p["id"] == item_id), None)
        assert deleted_item is None, "Deleted item still exists"
        
        print(f"✓ Deleted one-time purchase: {item_id}")
    
    def test_delete_nonexistent_returns_404(self):
        """DELETE nonexistent item returns 404"""
        response = requests.delete(f"{BASE_URL}/api/admin/cost-calculator/one-time/nonexistent-id-12345")
        assert response.status_code == 404
        print("✓ DELETE nonexistent item returns 404")


class TestFixedCosts:
    """Test Monthly Fixed Costs CRUD"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.created_ids = []
        yield
        for item_id in self.created_ids:
            try:
                requests.delete(f"{BASE_URL}/api/admin/cost-calculator/fixed-costs/{item_id}")
            except:
                pass
    
    def test_get_fixed_costs(self):
        """GET /api/admin/cost-calculator/fixed-costs returns monthly costs"""
        response = requests.get(f"{BASE_URL}/api/admin/cost-calculator/fixed-costs")
        assert response.status_code == 200
        
        data = response.json()
        assert "costs" in data
        assert "summary" in data
        assert "total_monthly" in data["summary"]
        
        print(f"✓ Fixed costs: {len(data['costs'])} items, total ₹{data['summary']['total_monthly']}/month")
    
    def test_create_fixed_cost(self):
        """POST /api/admin/cost-calculator/fixed-costs creates a cost"""
        payload = {
            "name": "TEST_Shop Rent",
            "category": "rent",
            "monthly_amount": 15000,
            "notes": "Test fixed cost"
        }
        
        response = requests.post(f"{BASE_URL}/api/admin/cost-calculator/fixed-costs", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert "id" in data
        self.created_ids.append(data["id"])
        
        assert data["name"] == payload["name"]
        assert data["category"] == payload["category"]
        assert data["monthly_amount"] == payload["monthly_amount"]
        
        # Verify in list
        get_response = requests.get(f"{BASE_URL}/api/admin/cost-calculator/fixed-costs")
        costs = get_response.json()["costs"]
        created = next((c for c in costs if c["id"] == data["id"]), None)
        assert created is not None
        
        print(f"✓ Created fixed cost: {data['name']} - ₹{data['monthly_amount']}/month")
    
    def test_update_fixed_cost(self):
        """PUT /api/admin/cost-calculator/fixed-costs/:id updates a cost"""
        # Create
        payload = {
            "name": "TEST_Electricity",
            "category": "electricity",
            "monthly_amount": 3000
        }
        create_response = requests.post(f"{BASE_URL}/api/admin/cost-calculator/fixed-costs", json=payload)
        item_id = create_response.json()["id"]
        self.created_ids.append(item_id)
        
        # Update
        update_payload = {
            "name": "TEST_Electricity (Updated)",
            "category": "electricity",
            "monthly_amount": 4000,
            "notes": "Increased due to summer"
        }
        update_response = requests.put(f"{BASE_URL}/api/admin/cost-calculator/fixed-costs/{item_id}", json=update_payload)
        assert update_response.status_code == 200
        
        updated = update_response.json()
        assert updated["monthly_amount"] == 4000
        print(f"✓ Updated fixed cost: {updated['name']}")
    
    def test_delete_fixed_cost(self):
        """DELETE /api/admin/cost-calculator/fixed-costs/:id removes a cost"""
        # Create
        payload = {"name": "TEST_Water to Delete", "category": "water", "monthly_amount": 500}
        create_response = requests.post(f"{BASE_URL}/api/admin/cost-calculator/fixed-costs", json=payload)
        item_id = create_response.json()["id"]
        
        # Delete
        delete_response = requests.delete(f"{BASE_URL}/api/admin/cost-calculator/fixed-costs/{item_id}")
        assert delete_response.status_code == 200
        
        # Verify deleted
        get_response = requests.get(f"{BASE_URL}/api/admin/cost-calculator/fixed-costs")
        costs = get_response.json()["costs"]
        assert not any(c["id"] == item_id for c in costs)
        
        print(f"✓ Deleted fixed cost")


class TestProductionCosts:
    """Test Production/Variable Costs CRUD"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.created_ids = []
        yield
        for item_id in self.created_ids:
            try:
                requests.delete(f"{BASE_URL}/api/admin/cost-calculator/production-costs/{item_id}")
            except:
                pass
    
    def test_get_production_costs(self):
        """GET /api/admin/cost-calculator/production-costs returns variable costs"""
        response = requests.get(f"{BASE_URL}/api/admin/cost-calculator/production-costs")
        assert response.status_code == 200
        
        data = response.json()
        assert "costs" in data
        assert "count" in data
        
        print(f"✓ Production costs: {data['count']} items")
    
    def test_create_production_cost(self):
        """POST /api/admin/cost-calculator/production-costs creates a variable cost"""
        payload = {
            "name": "TEST_Sunflower Seeds",
            "category": "seeds",
            "cost_per_unit": 25,
            "unit": "per_tray",
            "notes": "Premium organic seeds"
        }
        
        response = requests.post(f"{BASE_URL}/api/admin/cost-calculator/production-costs", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert "id" in data
        self.created_ids.append(data["id"])
        
        assert data["name"] == payload["name"]
        assert data["cost_per_unit"] == payload["cost_per_unit"]
        assert data["unit"] == payload["unit"]
        
        print(f"✓ Created production cost: {data['name']} - ₹{data['cost_per_unit']}/{data['unit']}")
    
    def test_update_production_cost(self):
        """PUT /api/admin/cost-calculator/production-costs/:id updates a cost"""
        payload = {"name": "TEST_Cocopeat", "category": "soil", "cost_per_unit": 10, "unit": "per_tray"}
        create_response = requests.post(f"{BASE_URL}/api/admin/cost-calculator/production-costs", json=payload)
        item_id = create_response.json()["id"]
        self.created_ids.append(item_id)
        
        update_payload = {"name": "TEST_Cocopeat (Premium)", "category": "soil", "cost_per_unit": 15, "unit": "per_tray"}
        update_response = requests.put(f"{BASE_URL}/api/admin/cost-calculator/production-costs/{item_id}", json=update_payload)
        assert update_response.status_code == 200
        
        updated = update_response.json()
        assert updated["cost_per_unit"] == 15
        print(f"✓ Updated production cost")
    
    def test_delete_production_cost(self):
        """DELETE /api/admin/cost-calculator/production-costs/:id removes a cost"""
        payload = {"name": "TEST_Labor to Delete", "category": "labor", "cost_per_unit": 100, "unit": "per_hour"}
        create_response = requests.post(f"{BASE_URL}/api/admin/cost-calculator/production-costs", json=payload)
        item_id = create_response.json()["id"]
        
        delete_response = requests.delete(f"{BASE_URL}/api/admin/cost-calculator/production-costs/{item_id}")
        assert delete_response.status_code == 200
        
        print(f"✓ Deleted production cost")


class TestProductConfigs:
    """Test Product Cost Configuration CRUD"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.created_product_ids = []
        yield
        for pid in self.created_product_ids:
            try:
                requests.delete(f"{BASE_URL}/api/admin/cost-calculator/product-configs/{pid}")
            except:
                pass
    
    def test_get_product_configs(self):
        """GET /api/admin/cost-calculator/product-configs returns configurations"""
        response = requests.get(f"{BASE_URL}/api/admin/cost-calculator/product-configs")
        assert response.status_code == 200
        
        data = response.json()
        assert "configs" in data
        assert "count" in data
        
        print(f"✓ Product configs: {data['count']} configured")
    
    def test_create_product_config(self):
        """POST /api/admin/cost-calculator/product-configs creates a config"""
        # First get a product ID
        products_response = requests.get(f"{BASE_URL}/api/products")
        products_data = products_response.json()
        products = products_data.get("products", products_data) if isinstance(products_data, dict) else products_data
        if not products:
            pytest.skip("No products available for testing")
        
        product = products[0]
        test_product_id = f"TEST_{uuid.uuid4().hex[:8]}"
        
        payload = {
            "product_id": test_product_id,
            "product_name": f"TEST_{product['name']}",
            "trays_per_batch": 2,
            "growth_days": 10,
            "yield_grams_per_tray": 120,
            "seed_cost_per_tray": 30,
            "soil_cost_per_tray": 15,
            "labor_hours_per_batch": 0.5,
            "labor_rate_per_hour": 100,
            "packaging_cost_per_unit": 8,
            "other_variable_costs": 5,
            "notes": "Test product configuration"
        }
        
        response = requests.post(f"{BASE_URL}/api/admin/cost-calculator/product-configs", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        self.created_product_ids.append(test_product_id)
        
        assert data["product_id"] == payload["product_id"]
        assert data["growth_days"] == payload["growth_days"]
        assert data["seed_cost_per_tray"] == payload["seed_cost_per_tray"]
        
        print(f"✓ Created product config: {data['product_name']}")
    
    def test_upsert_product_config(self):
        """POST same product_id updates existing config (upsert)"""
        test_product_id = f"TEST_{uuid.uuid4().hex[:8]}"
        
        # Create first config
        payload1 = {
            "product_id": test_product_id,
            "product_name": "TEST_Broccoli Microgreens",
            "growth_days": 7,
            "yield_grams_per_tray": 100,
            "seed_cost_per_tray": 20
        }
        response1 = requests.post(f"{BASE_URL}/api/admin/cost-calculator/product-configs", json=payload1)
        assert response1.status_code == 200
        self.created_product_ids.append(test_product_id)
        
        # Update with same product_id (upsert)
        payload2 = {
            "product_id": test_product_id,
            "product_name": "TEST_Broccoli Microgreens (Updated)",
            "growth_days": 8,
            "yield_grams_per_tray": 110,
            "seed_cost_per_tray": 25
        }
        response2 = requests.post(f"{BASE_URL}/api/admin/cost-calculator/product-configs", json=payload2)
        assert response2.status_code == 200
        
        updated = response2.json()
        assert updated["growth_days"] == 8
        assert updated["seed_cost_per_tray"] == 25
        
        print(f"✓ Upsert product config works correctly")
    
    def test_delete_product_config(self):
        """DELETE /api/admin/cost-calculator/product-configs/:product_id removes config"""
        test_product_id = f"TEST_{uuid.uuid4().hex[:8]}"
        
        payload = {
            "product_id": test_product_id,
            "product_name": "TEST_Radish to Delete",
            "growth_days": 5,
            "yield_grams_per_tray": 80
        }
        requests.post(f"{BASE_URL}/api/admin/cost-calculator/product-configs", json=payload)
        
        delete_response = requests.delete(f"{BASE_URL}/api/admin/cost-calculator/product-configs/{test_product_id}")
        assert delete_response.status_code == 200
        
        print(f"✓ Deleted product config")


class TestCostCalculation:
    """Test cost calculation endpoint"""
    
    def test_calculate_costs_default(self):
        """GET /api/admin/cost-calculator/calculate returns cost analysis"""
        response = requests.get(f"{BASE_URL}/api/admin/cost-calculator/calculate")
        assert response.status_code == 200
        
        data = response.json()
        
        # Check structure
        assert "monthly_overhead" in data
        assert "depreciation" in data["monthly_overhead"]
        assert "fixed_costs" in data["monthly_overhead"]
        assert "total" in data["monthly_overhead"]
        assert "overhead_per_tray" in data["monthly_overhead"]
        
        assert "monthly_production_trays" in data
        assert "product_costs" in data
        assert "summary" in data
        
        print(f"✓ Cost calculation: overhead ₹{data['monthly_overhead']['total']}/month")
    
    def test_calculate_costs_with_production_trays(self):
        """GET /api/admin/cost-calculator/calculate?monthly_production_trays=200"""
        response1 = requests.get(f"{BASE_URL}/api/admin/cost-calculator/calculate?monthly_production_trays=100")
        response2 = requests.get(f"{BASE_URL}/api/admin/cost-calculator/calculate?monthly_production_trays=200")
        
        assert response1.status_code == 200
        assert response2.status_code == 200
        
        data1 = response1.json()
        data2 = response2.json()
        
        # Higher production should result in lower overhead per tray
        overhead_100 = data1["monthly_overhead"]["overhead_per_tray"]
        overhead_200 = data2["monthly_overhead"]["overhead_per_tray"]
        
        # Only verify if there's actual overhead data
        if data1["monthly_overhead"]["total"] > 0:
            assert overhead_200 < overhead_100 or overhead_200 == overhead_100, \
                f"Higher production ({overhead_200}) should not have higher overhead than lower production ({overhead_100})"
            print(f"✓ Overhead per tray: 100 trays=₹{overhead_100}, 200 trays=₹{overhead_200}")
        else:
            print(f"✓ No overhead data to compare (total overhead is 0)")
    
    def test_calculate_returns_product_costs_structure(self):
        """Verify product_costs array structure in calculate response"""
        response = requests.get(f"{BASE_URL}/api/admin/cost-calculator/calculate")
        data = response.json()
        
        if data["product_costs"]:
            product = data["product_costs"][0]
            
            assert "product_id" in product
            assert "product_name" in product
            assert "selling_price" in product
            assert "cost_breakdown" in product
            assert "yield" in product
            assert "unit_costs" in product
            assert "profitability" in product
            
            # Check cost_breakdown
            breakdown = product["cost_breakdown"]
            assert "seed_cost" in breakdown
            assert "soil_cost" in breakdown
            assert "labor_cost" in breakdown
            assert "overhead_allocation" in breakdown
            
            # Check profitability
            profit = product["profitability"]
            assert "profit_per_unit" in profit
            assert "margin_percent" in profit
            assert "profitable" in profit
            
            print(f"✓ Product cost structure verified: {product['product_name']}")
        else:
            print(f"✓ No product configs to verify structure (empty list)")
    
    def test_summary_stats(self):
        """Verify summary statistics in calculate response"""
        response = requests.get(f"{BASE_URL}/api/admin/cost-calculator/calculate")
        data = response.json()
        
        summary = data["summary"]
        assert "products_configured" in summary
        assert "avg_margin" in summary
        assert "profitable_products" in summary
        assert "unprofitable_products" in summary
        
        assert summary["products_configured"] == len(data["product_costs"])
        assert summary["profitable_products"] + summary["unprofitable_products"] == summary["products_configured"]
        
        print(f"✓ Summary: {summary['products_configured']} products, {summary['profitable_products']} profitable, avg margin {summary['avg_margin']}%")


class TestDepreciationCalculation:
    """Test straight-line depreciation calculation correctness"""
    
    def test_depreciation_formula(self):
        """Verify straight-line depreciation: (cost - salvage) / life"""
        # Create a test purchase with known values
        purchase_date = datetime.now().strftime('%Y-%m-%d')
        payload = {
            "name": "TEST_Depreciation Test Item",
            "category": "equipment",
            "purchase_cost": 10000,
            "purchase_date": purchase_date,
            "useful_life_months": 60,  # 5 years
            "salvage_value": 1000
        }
        
        response = requests.post(f"{BASE_URL}/api/admin/cost-calculator/one-time", json=payload)
        assert response.status_code == 200
        item_id = response.json()["id"]
        
        try:
            # Get the item with calculated depreciation
            get_response = requests.get(f"{BASE_URL}/api/admin/cost-calculator/one-time")
            purchases = get_response.json()["purchases"]
            item = next(p for p in purchases if p["id"] == item_id)
            
            # Verify calculation: (10000 - 1000) / 60 = 150/month
            expected_monthly_dep = (10000 - 1000) / 60
            assert abs(item["monthly_depreciation"] - expected_monthly_dep) < 0.01, \
                f"Monthly depreciation: expected {expected_monthly_dep}, got {item['monthly_depreciation']}"
            
            # Since just created today, months_remaining should be 60 or close
            assert item["months_remaining"] >= 59, f"Expected ~60 months remaining, got {item['months_remaining']}"
            
            print(f"✓ Depreciation calculation verified: ₹{item['monthly_depreciation']}/month over {item['months_remaining']} months")
        finally:
            requests.delete(f"{BASE_URL}/api/admin/cost-calculator/one-time/{item_id}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
