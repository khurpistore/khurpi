"""
Product Catalog API Tests
Tests for: Products API, Category filtering, Search functionality
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Expected categories from seed data
EXPECTED_CATEGORIES = {
    "vegetables": "034c8aea-38f6-49d0-b21e-3aee1f8b1365",
    "fruits": "54e2ce6c-4261-44eb-994f-64ac5a8c678b",
    "leafy_greens": "6900f756-4063-40f7-b158-c93a7d63508f",
    "root_vegetables": "3a1f7ff8-71db-4494-be32-6df62693f3dc",
    "exotic": "d790f665-5c8d-4267-b078-aceee52da106"
}


class TestProductsAPI:
    """Test the products API endpoint"""
    
    def test_get_all_products(self):
        """Test GET /api/products returns all products"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "Expected at least some products"
        print(f"Total products returned: {len(data)}")
    
    def test_products_have_required_fields(self):
        """Test that products have all required fields"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        products = response.json()
        
        required_fields = ['id', 'name', 'image', 'price', 'stock_status']
        
        for product in products[:10]:  # Check first 10 products
            for field in required_fields:
                assert field in product, f"Product {product.get('name', 'unknown')} missing field: {field}"
        
        print(f"All required fields present in products")
    
    def test_products_have_valid_prices(self):
        """Test that all products have valid prices"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        products = response.json()
        
        for product in products:
            assert product['price'] >= 0, f"Product {product['name']} has invalid price: {product['price']}"
            # Wholesale price should be 0 or positive
            wholesale_price = product.get('wholesale_price', 0)
            assert wholesale_price >= 0, f"Product {product['name']} has invalid wholesale_price: {wholesale_price}"
        
        print(f"All {len(products)} products have valid prices")
    
    def test_products_count_matches_expected(self):
        """Test that we have the expected number of products (106 total)"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        products = response.json()
        
        # We expect 82 new products + 24 existing microgreens = 106 total
        assert len(products) >= 100, f"Expected at least 100 products, got {len(products)}"
        print(f"Product count: {len(products)} (expected ~106)")


class TestCategoriesAPI:
    """Test the categories API endpoint"""
    
    def test_get_all_categories(self):
        """Test GET /api/categories returns all categories"""
        response = requests.get(f"{BASE_URL}/api/categories")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 5, f"Expected at least 5 categories, got {len(data)}"
        print(f"Total categories: {len(data)}")
    
    def test_categories_have_required_fields(self):
        """Test that categories have required fields"""
        response = requests.get(f"{BASE_URL}/api/categories")
        assert response.status_code == 200
        categories = response.json()
        
        required_fields = ['id', 'name', 'slug']
        
        for category in categories:
            for field in required_fields:
                assert field in category, f"Category {category.get('name', 'unknown')} missing field: {field}"
        
        print(f"All categories have required fields")
    
    def test_expected_categories_exist(self):
        """Test that all expected categories exist"""
        response = requests.get(f"{BASE_URL}/api/categories")
        assert response.status_code == 200
        categories = response.json()
        
        category_names = [c['name'].lower() for c in categories]
        
        expected_names = ['vegetables', 'fruits', 'leafy greens', 'root vegetables', 'exotic']
        for expected in expected_names:
            found = any(expected in name for name in category_names)
            assert found, f"Expected category '{expected}' not found in {category_names}"
        
        print(f"All expected categories found")


class TestProductCategoryAssignment:
    """Test that products are correctly assigned to categories"""
    
    def test_products_have_category_names_resolved(self):
        """Test that products with category_id have category_name resolved"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        products = response.json()
        
        products_with_category_id = [p for p in products if p.get('category_id')]
        products_with_category_name = [p for p in products if p.get('category_name')]
        
        # All products with category_id should have category_name resolved
        for product in products_with_category_id:
            assert product.get('category_name'), f"Product {product['name']} has category_id but no category_name"
        
        print(f"Products with category_id: {len(products_with_category_id)}")
        print(f"Products with category_name: {len(products_with_category_name)}")
    
    def test_category_distribution(self):
        """Test that products are distributed across categories"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        products = response.json()
        
        # Count products per category
        category_counts = {}
        for product in products:
            cat_name = product.get('category_name') or 'Uncategorized'
            category_counts[cat_name] = category_counts.get(cat_name, 0) + 1
        
        print(f"Category distribution: {category_counts}")
        
        # Each main category should have at least 10 products
        expected_categories = ['Vegetables', 'Fruits', 'Leafy Greens', 'Root Vegetables', 'Exotic & Imported']
        for cat in expected_categories:
            count = category_counts.get(cat, 0)
            assert count >= 10, f"Category '{cat}' has only {count} products, expected at least 10"
        
        print(f"All categories have sufficient products")
    
    def test_vegetables_category_products(self):
        """Test that Vegetables category has correct products"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        products = response.json()
        
        vegetables = [p for p in products if p.get('category_name') == 'Vegetables']
        
        assert len(vegetables) >= 15, f"Expected at least 15 vegetables, got {len(vegetables)}"
        
        # Check some expected vegetable names
        vegetable_names = [v['name'].lower() for v in vegetables]
        expected_veggies = ['tomato', 'cauliflower', 'cabbage', 'broccoli', 'cucumber']
        
        for expected in expected_veggies:
            found = any(expected in name for name in vegetable_names)
            assert found, f"Expected vegetable '{expected}' not found in Vegetables category"
        
        print(f"Vegetables category has {len(vegetables)} products with expected items")
    
    def test_fruits_category_products(self):
        """Test that Fruits category has correct products"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        products = response.json()
        
        fruits = [p for p in products if p.get('category_name') == 'Fruits']
        
        assert len(fruits) >= 15, f"Expected at least 15 fruits, got {len(fruits)}"
        
        # Check some expected fruit names
        fruit_names = [f['name'].lower() for f in fruits]
        expected_fruits = ['apple', 'banana', 'orange', 'mango', 'grape']
        
        for expected in expected_fruits:
            found = any(expected in name for name in fruit_names)
            assert found, f"Expected fruit '{expected}' not found in Fruits category"
        
        print(f"Fruits category has {len(fruits)} products with expected items")


class TestProductSearch:
    """Test product search functionality (frontend-based, but API supports it)"""
    
    def test_products_searchable_by_name(self):
        """Test that products can be searched by name"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        products = response.json()
        
        # Simulate frontend search for "tomato"
        search_term = "tomato"
        matching = [p for p in products if search_term.lower() in p['name'].lower()]
        
        assert len(matching) > 0, f"No products found matching '{search_term}'"
        print(f"Found {len(matching)} products matching '{search_term}'")
    
    def test_products_searchable_by_benefit(self):
        """Test that products can be searched by benefit text"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        products = response.json()
        
        # Simulate frontend search for "vitamin C"
        search_term = "vitamin c"
        matching = [p for p in products if search_term.lower() in (p.get('benefit') or '').lower()]
        
        assert len(matching) > 0, f"No products found with benefit containing '{search_term}'"
        print(f"Found {len(matching)} products with benefit containing '{search_term}'")


class TestProductPricing:
    """Test product pricing including wholesale prices"""
    
    def test_products_have_wholesale_prices(self):
        """Test that new products have wholesale prices set"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        products = response.json()
        
        # Filter to products with category (new products)
        categorized_products = [p for p in products if p.get('category_id')]
        
        products_with_wholesale = [p for p in categorized_products if p.get('wholesale_price', 0) > 0]
        
        # Most new products should have wholesale prices
        assert len(products_with_wholesale) > 50, f"Expected more than 50 products with wholesale prices, got {len(products_with_wholesale)}"
        
        print(f"Products with wholesale prices: {len(products_with_wholesale)} out of {len(categorized_products)}")
    
    def test_wholesale_price_less_than_retail(self):
        """Test that wholesale prices are less than retail prices"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        products = response.json()
        
        for product in products:
            wholesale = product.get('wholesale_price', 0)
            retail = product.get('price', 0)
            
            if wholesale > 0:
                assert wholesale <= retail, f"Product {product['name']} has wholesale ({wholesale}) > retail ({retail})"
        
        print(f"All wholesale prices are less than or equal to retail prices")


class TestProductImages:
    """Test that products have valid images"""
    
    def test_products_have_images(self):
        """Test that all products have image URLs"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        products = response.json()
        
        products_without_images = [p for p in products if not p.get('image')]
        
        assert len(products_without_images) == 0, f"{len(products_without_images)} products missing images"
        print(f"All {len(products)} products have images")
    
    def test_product_images_are_valid_urls(self):
        """Test that product images are valid URLs"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        products = response.json()
        
        for product in products:
            image = product.get('image', '')
            assert image.startswith('http'), f"Product {product['name']} has invalid image URL: {image}"
        
        print(f"All product images are valid URLs")


class TestProductStockStatus:
    """Test product stock status"""
    
    def test_products_have_valid_stock_status(self):
        """Test that products have valid stock status values"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        products = response.json()
        
        valid_statuses = ['in_stock', 'growing', 'out_of_stock', 'low_stock']
        
        for product in products:
            status = product.get('stock_status', 'in_stock')
            assert status in valid_statuses, f"Product {product['name']} has invalid stock_status: {status}"
        
        print(f"All products have valid stock status")
    
    def test_stock_status_distribution(self):
        """Test stock status distribution"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        products = response.json()
        
        status_counts = {}
        for product in products:
            status = product.get('stock_status', 'in_stock')
            status_counts[status] = status_counts.get(status, 0) + 1
        
        print(f"Stock status distribution: {status_counts}")
        
        # Most products should be in_stock
        in_stock = status_counts.get('in_stock', 0)
        assert in_stock > len(products) * 0.5, f"Expected more than 50% products in_stock, got {in_stock}/{len(products)}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
