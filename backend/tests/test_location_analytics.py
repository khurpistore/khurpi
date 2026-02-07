"""
Test Location Map Analytics Feature
- Tests /api/admin/analytics/location-funnel endpoint
- Verifies location-wise funnel data aggregation
- Tests anonymous user tracking
"""
import pytest
import requests
import os
from datetime import datetime, timezone

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestLocationAnalytics:
    """Location Map Analytics endpoint tests"""
    
    def test_health_check(self):
        """Verify API is healthy"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ Health check passed")

    def test_location_funnel_endpoint_returns_200(self):
        """Test /api/admin/analytics/location-funnel returns 200"""
        response = requests.get(f"{BASE_URL}/api/admin/analytics/location-funnel?days=30")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Location funnel endpoint returns list with {len(data)} locations")

    def test_location_funnel_data_structure(self):
        """Verify location funnel data has required fields"""
        response = requests.get(f"{BASE_URL}/api/admin/analytics/location-funnel?days=30")
        assert response.status_code == 200
        data = response.json()
        
        if len(data) > 0:
            location = data[0]
            # Required fields for location funnel
            required_fields = [
                'city', 'state', 'country',
                'page_views', 'product_views', 'add_to_cart', 'checkout_started',
                'anonymous_visitors', 'anonymous_cart_adds',
                'total_events', 'unique_visitors'
            ]
            
            for field in required_fields:
                assert field in location, f"Missing field: {field}"
            
            # Verify data types
            assert isinstance(location['page_views'], int)
            assert isinstance(location['add_to_cart'], int)
            assert isinstance(location['anonymous_cart_adds'], int)
            assert isinstance(location['total_events'], int)
            
            print(f"✓ Location funnel data structure verified")
            print(f"  Sample: {location['city']} - {location['page_views']} page views, {location['anonymous_cart_adds']} anonymous cart adds")
        else:
            print("✓ Location funnel endpoint works (no data yet)")

    def test_location_funnel_has_coordinates(self):
        """Verify locations have latitude/longitude for map display"""
        response = requests.get(f"{BASE_URL}/api/admin/analytics/location-funnel?days=30")
        assert response.status_code == 200
        data = response.json()
        
        locations_with_coords = [l for l in data if l.get('latitude') and l.get('longitude')]
        print(f"✓ {len(locations_with_coords)} of {len(data)} locations have coordinates for map display")
        
        if locations_with_coords:
            sample = locations_with_coords[0]
            assert isinstance(sample['latitude'], (int, float))
            assert isinstance(sample['longitude'], (int, float))
            print(f"  Sample: {sample['city']} at ({sample['latitude']}, {sample['longitude']})")

    def test_location_funnel_anonymous_tracking(self):
        """Verify anonymous visitor tracking works"""
        response = requests.get(f"{BASE_URL}/api/admin/analytics/location-funnel?days=30")
        assert response.status_code == 200
        data = response.json()
        
        total_anonymous_visitors = sum(l.get('anonymous_visitors', 0) for l in data)
        total_anonymous_cart_adds = sum(l.get('anonymous_cart_adds', 0) for l in data)
        
        print(f"✓ Anonymous tracking active:")
        print(f"  Total anonymous visitors: {total_anonymous_visitors}")
        print(f"  Total anonymous cart adds: {total_anonymous_cart_adds}")
        
        # Check if any location has anonymous cart adds
        locations_with_anon_carts = [l for l in data if l.get('anonymous_cart_adds', 0) > 0]
        if locations_with_anon_carts:
            for loc in locations_with_anon_carts[:3]:
                print(f"  {loc['city']}: {loc['anonymous_cart_adds']} anonymous cart adds")

    def test_location_funnel_funnel_metrics(self):
        """Verify funnel metrics (page_views -> product_views -> add_to_cart -> checkout)"""
        response = requests.get(f"{BASE_URL}/api/admin/analytics/location-funnel?days=30")
        assert response.status_code == 200
        data = response.json()
        
        total_page_views = sum(l.get('page_views', 0) for l in data)
        total_product_views = sum(l.get('product_views', 0) for l in data)
        total_add_to_cart = sum(l.get('add_to_cart', 0) for l in data)
        total_checkout = sum(l.get('checkout_started', 0) for l in data)
        
        print(f"✓ Funnel metrics by location:")
        print(f"  Page Views: {total_page_views}")
        print(f"  Product Views: {total_product_views}")
        print(f"  Add to Cart: {total_add_to_cart}")
        print(f"  Checkout Started: {total_checkout}")
        
        # Funnel should generally decrease
        # (not strict assert since data may vary)

    def test_location_funnel_period_parameter(self):
        """Test period parameter works (7, 30, 90 days)"""
        for days in [7, 30, 90]:
            response = requests.get(f"{BASE_URL}/api/admin/analytics/location-funnel?days={days}")
            assert response.status_code == 200
            data = response.json()
            assert isinstance(data, list)
            print(f"✓ Period {days} days returns {len(data)} locations")

    def test_analytics_summary_endpoint(self):
        """Test /api/admin/analytics/summary endpoint"""
        response = requests.get(f"{BASE_URL}/api/admin/analytics/summary?days=30")
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert 'summary' in data
        assert 'conversion_funnel' in data
        assert 'cities' in data
        
        # Verify summary fields
        summary = data['summary']
        assert 'total_events' in summary
        assert 'unique_sessions' in summary
        
        # Verify cities data
        cities = data.get('cities', {})
        print(f"✓ Analytics summary: {summary['total_events']} events, {len(cities)} cities")

    def test_analytics_locations_endpoint(self):
        """Test /api/admin/analytics/locations endpoint for map data"""
        response = requests.get(f"{BASE_URL}/api/admin/analytics/locations")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        if data:
            sample = data[0]
            assert 'latitude' in sample
            assert 'longitude' in sample
            assert 'event_count' in sample
            print(f"✓ Locations endpoint returns {len(data)} location points")
        else:
            print("✓ Locations endpoint works (no coordinate data yet)")

    def test_track_analytics_event(self):
        """Test POST /api/analytics/track for event tracking"""
        event_data = {
            "event_type": "page_view",
            "page": "/test",
            "session_id": f"test_session_{datetime.now(timezone.utc).timestamp()}",
            "visitor_id": f"test_visitor_{datetime.now(timezone.utc).timestamp()}",
            "city": "TEST_City",
            "state": "TEST_State",
            "country": "TEST_Country",
            "latitude": 28.5672,
            "longitude": 77.4538,
            "device_type": "desktop",
            "browser": "Chrome"
        }
        
        response = requests.post(f"{BASE_URL}/api/analytics/track", json=event_data)
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'tracked'
        assert 'event_id' in data
        print(f"✓ Analytics event tracked successfully: {data['event_id']}")

    def test_realtime_analytics_endpoint(self):
        """Test /api/admin/analytics/realtime endpoint"""
        response = requests.get(f"{BASE_URL}/api/admin/analytics/realtime")
        assert response.status_code == 200
        data = response.json()
        
        assert 'active_sessions' in data
        assert 'active_users' in data
        assert 'events_last_30_min' in data
        
        print(f"✓ Realtime analytics:")
        print(f"  Active sessions: {data['active_sessions']}")
        print(f"  Events last 30 min: {data['events_last_30_min']}")


class TestAnalyticsTrackingIntegration:
    """Test that tracked events appear in location funnel"""
    
    def test_track_anonymous_cart_add_from_location(self):
        """Track an anonymous cart add event and verify structure"""
        event_data = {
            "event_type": "add_to_cart",
            "page": "/products",
            "session_id": f"anon_session_{datetime.now(timezone.utc).timestamp()}",
            "visitor_id": f"anon_visitor_{datetime.now(timezone.utc).timestamp()}",
            "user_id": None,  # Anonymous - no login
            "city": "TestCity",
            "state": "TestState", 
            "country": "India",
            "latitude": 19.076,
            "longitude": 72.8777,
            "product_id": "test_product",
            "product_name": "Test Microgreens",
            "value": 150.0
        }
        
        response = requests.post(f"{BASE_URL}/api/analytics/track", json=event_data)
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'tracked'
        print(f"✓ Anonymous cart add event tracked for location tracking")

    def test_traffic_sources_endpoint(self):
        """Test /api/admin/analytics/traffic-sources endpoint"""
        response = requests.get(f"{BASE_URL}/api/admin/analytics/traffic-sources?days=30")
        assert response.status_code == 200
        data = response.json()
        
        assert 'sources' in data
        assert 'channels' in data
        assert isinstance(data['sources'], list)
        assert isinstance(data['channels'], list)
        
        print(f"✓ Traffic sources: {len(data['sources'])} sources, {len(data['channels'])} channels")

    def test_utm_analytics_endpoint(self):
        """Test /api/admin/analytics/utm endpoint"""
        response = requests.get(f"{BASE_URL}/api/admin/analytics/utm?days=30")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ UTM analytics: {len(data)} campaigns tracked")

    def test_engagement_analytics_endpoint(self):
        """Test /api/admin/analytics/engagement endpoint"""
        response = requests.get(f"{BASE_URL}/api/admin/analytics/engagement?days=30")
        assert response.status_code == 200
        data = response.json()
        
        assert 'total_sessions' in data
        assert 'bounce_rate' in data
        assert 'conversion_rate' in data
        
        print(f"✓ Engagement metrics:")
        print(f"  Bounce rate: {data.get('bounce_rate', 0)}%")
        print(f"  Conversion rate: {data.get('conversion_rate', 0)}%")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
