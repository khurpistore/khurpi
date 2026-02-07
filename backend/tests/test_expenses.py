"""
Test suite for Expense Tracking API endpoints
Features: CRUD operations for expenses, expense types, summary

Test coverage:
- GET /api/admin/expense-types - returns list of expense types
- POST /api/admin/expenses - creates a new expense entry
- GET /api/admin/expenses - retrieves all expenses with summary
- PUT /api/admin/expenses/{id} - updates an expense
- DELETE /api/admin/expenses/{id} - deletes an expense
"""
import pytest
import requests
import os
import uuid
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestExpenseTypes:
    """Test expense types endpoint"""
    
    def test_get_expense_types_returns_list(self):
        """GET /api/admin/expense-types should return predefined expense types"""
        response = requests.get(f"{BASE_URL}/api/admin/expense-types")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Expected a list of expense types"
        assert len(data) > 0, "Expected at least one expense type"
        
        # Verify structure of expense types
        first_type = data[0]
        assert "name" in first_type, "Each type should have 'name'"
        assert "label" in first_type, "Each type should have 'label'"
        
        # Verify some predefined types exist
        type_names = [t["name"] for t in data]
        expected_types = ["seeds", "lights", "fans", "racks", "trays", "cocopeat"]
        for expected in expected_types:
            assert expected in type_names, f"Expected type '{expected}' not found"
        
        print(f"SUCCESS: Got {len(data)} expense types")


class TestExpenseCRUD:
    """Test expense CRUD operations"""
    
    @pytest.fixture
    def test_expense_data(self):
        """Generate test expense data"""
        return {
            "item_type": "seeds",
            "item_name": f"TEST_Sunflower Seeds {uuid.uuid4().hex[:8]}",
            "description": "Test purchase for QA",
            "vendor_name": "TEST_Vendor ABC",
            "vendor_location": "Delhi",
            "vendor_phone": "9876543210",
            "quantity": 5,
            "unit_price": 200.0,
            "total_price": 1000.0,
            "paid_status": "pending",
            "paid_amount": 0,
            "payment_method": "cash",
            "order_date": datetime.now().strftime("%Y-%m-%d"),
            "delivery_date": datetime.now().strftime("%Y-%m-%d"),
            "invoice_number": f"TEST-INV-{uuid.uuid4().hex[:6]}",
            "notes": "Test expense entry"
        }
    
    def test_create_expense(self, test_expense_data):
        """POST /api/admin/expenses - should create a new expense"""
        response = requests.post(
            f"{BASE_URL}/api/admin/expenses",
            json=test_expense_data
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "id" in data, "Response should contain 'id'"
        assert data["item_name"] == test_expense_data["item_name"]
        assert data["vendor_name"] == test_expense_data["vendor_name"]
        assert data["total_price"] == test_expense_data["total_price"]
        assert data["paid_status"] == "pending"
        
        print(f"SUCCESS: Created expense with ID: {data['id']}")
        return data
    
    def test_get_all_expenses_returns_list_with_summary(self):
        """GET /api/admin/expenses - should return expenses with summary"""
        response = requests.get(f"{BASE_URL}/api/admin/expenses")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "expenses" in data, "Response should contain 'expenses'"
        assert "summary" in data, "Response should contain 'summary'"
        
        # Verify summary structure
        summary = data["summary"]
        assert "total_expenses" in summary, "Summary should have 'total_expenses'"
        assert "total_amount" in summary, "Summary should have 'total_amount'"
        assert "total_paid" in summary, "Summary should have 'total_paid'"
        assert "pending_amount" in summary, "Summary should have 'pending_amount'"
        
        # Verify expenses is a list
        assert isinstance(data["expenses"], list), "Expenses should be a list"
        
        print(f"SUCCESS: Got {summary['total_expenses']} expenses, total: ₹{summary['total_amount']}")
    
    def test_create_and_get_expense(self, test_expense_data):
        """Create expense and verify by GET"""
        # Create expense
        create_response = requests.post(
            f"{BASE_URL}/api/admin/expenses",
            json=test_expense_data
        )
        assert create_response.status_code == 200, f"Create failed: {create_response.text}"
        
        created = create_response.json()
        expense_id = created["id"]
        
        # Get single expense
        get_response = requests.get(f"{BASE_URL}/api/admin/expenses/{expense_id}")
        assert get_response.status_code == 200, f"Get failed: {get_response.text}"
        
        fetched = get_response.json()
        assert fetched["id"] == expense_id
        assert fetched["item_name"] == test_expense_data["item_name"]
        assert fetched["total_price"] == test_expense_data["total_price"]
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/expenses/{expense_id}")
        print(f"SUCCESS: Created and fetched expense {expense_id}")
    
    def test_update_expense(self, test_expense_data):
        """PUT /api/admin/expenses/{id} - should update expense"""
        # Create expense first
        create_response = requests.post(
            f"{BASE_URL}/api/admin/expenses",
            json=test_expense_data
        )
        assert create_response.status_code == 200
        
        expense_id = create_response.json()["id"]
        
        # Update expense
        update_data = {
            "paid_status": "paid",
            "paid_amount": 1000.0,
            "payment_method": "upi",
            "notes": "Payment completed via UPI"
        }
        
        update_response = requests.put(
            f"{BASE_URL}/api/admin/expenses/{expense_id}",
            json=update_data
        )
        
        assert update_response.status_code == 200, f"Update failed: {update_response.text}"
        
        updated = update_response.json()
        assert updated["paid_status"] == "paid"
        assert updated["paid_amount"] == 1000.0
        assert updated["payment_method"] == "upi"
        
        # Verify by GET
        verify_response = requests.get(f"{BASE_URL}/api/admin/expenses/{expense_id}")
        verified = verify_response.json()
        assert verified["paid_status"] == "paid"
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/expenses/{expense_id}")
        print(f"SUCCESS: Updated expense {expense_id}")
    
    def test_delete_expense(self, test_expense_data):
        """DELETE /api/admin/expenses/{id} - should delete expense"""
        # Create expense first
        create_response = requests.post(
            f"{BASE_URL}/api/admin/expenses",
            json=test_expense_data
        )
        assert create_response.status_code == 200
        
        expense_id = create_response.json()["id"]
        
        # Delete expense
        delete_response = requests.delete(f"{BASE_URL}/api/admin/expenses/{expense_id}")
        assert delete_response.status_code == 200, f"Delete failed: {delete_response.text}"
        
        data = delete_response.json()
        assert data["success"] == True
        
        # Verify expense no longer exists
        verify_response = requests.get(f"{BASE_URL}/api/admin/expenses/{expense_id}")
        assert verify_response.status_code == 404, "Deleted expense should return 404"
        
        print(f"SUCCESS: Deleted expense {expense_id}")
    
    def test_get_nonexistent_expense_returns_404(self):
        """GET /api/admin/expenses/{id} - should return 404 for invalid ID"""
        fake_id = "nonexistent-expense-id-12345"
        response = requests.get(f"{BASE_URL}/api/admin/expenses/{fake_id}")
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("SUCCESS: Got 404 for nonexistent expense")
    
    def test_delete_nonexistent_expense_returns_404(self):
        """DELETE /api/admin/expenses/{id} - should return 404 for invalid ID"""
        fake_id = "nonexistent-expense-id-12345"
        response = requests.delete(f"{BASE_URL}/api/admin/expenses/{fake_id}")
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("SUCCESS: Got 404 for deleting nonexistent expense")


class TestExpenseFilters:
    """Test expense filtering functionality"""
    
    def test_filter_by_expense_type(self):
        """GET /api/admin/expenses?expense_type=seeds"""
        response = requests.get(f"{BASE_URL}/api/admin/expenses?expense_type=seeds")
        
        assert response.status_code == 200
        data = response.json()
        
        # All returned expenses should be of type 'seeds'
        for expense in data["expenses"]:
            if expense.get("item_type"):  # Only check if filter actually returned results
                assert expense["item_type"] == "seeds", f"Expected 'seeds', got '{expense['item_type']}'"
        
        print(f"SUCCESS: Filter by type returned {len(data['expenses'])} expenses")
    
    def test_filter_by_paid_status(self):
        """GET /api/admin/expenses?paid_status=pending"""
        response = requests.get(f"{BASE_URL}/api/admin/expenses?paid_status=pending")
        
        assert response.status_code == 200
        data = response.json()
        
        for expense in data["expenses"]:
            if expense.get("paid_status"):
                assert expense["paid_status"] == "pending"
        
        print(f"SUCCESS: Filter by status returned {len(data['expenses'])} expenses")


class TestExpenseSummary:
    """Test expense summary endpoint"""
    
    def test_monthly_summary(self):
        """GET /api/admin/expenses/summary/monthly"""
        response = requests.get(f"{BASE_URL}/api/admin/expenses/summary/monthly")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "monthly" in data, "Response should contain 'monthly'"
        assert "by_type" in data, "Response should contain 'by_type'"
        assert "year" in data, "Response should contain 'year'"
        
        # Year should be current year
        current_year = datetime.now().year
        assert data["year"] == current_year
        
        print(f"SUCCESS: Got monthly summary for year {data['year']}")


class TestCleanup:
    """Cleanup TEST_ prefixed expenses after all tests"""
    
    def test_cleanup_test_expenses(self):
        """Remove all TEST_ prefixed expenses"""
        response = requests.get(f"{BASE_URL}/api/admin/expenses")
        assert response.status_code == 200
        
        expenses = response.json()["expenses"]
        deleted_count = 0
        
        for expense in expenses:
            item_name = expense.get("item_name") or ""
            vendor_name = expense.get("vendor_name") or ""
            invoice_number = expense.get("invoice_number") or ""
            if item_name.startswith("TEST_") or \
               vendor_name.startswith("TEST_") or \
               invoice_number.startswith("TEST-"):
                delete_response = requests.delete(f"{BASE_URL}/api/admin/expenses/{expense['id']}")
                if delete_response.status_code == 200:
                    deleted_count += 1
        
        print(f"SUCCESS: Cleaned up {deleted_count} test expenses")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
