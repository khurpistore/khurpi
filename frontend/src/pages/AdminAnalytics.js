import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, Users, Eye, ShoppingCart, CreditCard, MapPin, 
  Monitor, Smartphone, Tablet, Globe, TrendingUp, Calendar,
  Package, MousePointer, Search, UserPlus, LogIn, Loader2
} from 'lucide-react';
import axios from 'axios';
import AdminLayout from '@/components/AdminLayout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [locations, setLocations] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [summaryRes, locationsRes, eventsRes] = await Promise.all([
        axios.get(`${API}/admin/analytics/summary?days=${period}`),
        axios.get(`${API}/admin/analytics/locations`),
        axios.get(`${API}/admin/analytics/events?limit=50`)
      ]);
      setAnalytics(summaryRes.data);
      setLocations(locationsRes.data);
      setRecentEvents(eventsRes.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'page_view': return <Eye className="w-4 h-4" />;
      case 'product_view': return <Package className="w-4 h-4" />;
      case 'add_to_cart': return <ShoppingCart className="w-4 h-4" />;
      case 'checkout_started': return <CreditCard className="w-4 h-4" />;
      case 'purchase': return <CreditCard className="w-4 h-4 text-green-500" />;
      case 'click': return <MousePointer className="w-4 h-4" />;
      case 'search': return <Search className="w-4 h-4" />;
      case 'login': return <LogIn className="w-4 h-4" />;
      case 'signup': return <UserPlus className="w-4 h-4" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'mobile': return <Smartphone className="w-5 h-5" />;
      case 'tablet': return <Tablet className="w-5 h-5" />;
      default: return <Monitor className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Track user behavior and site performance</p>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Events</p>
                  <p className="text-3xl font-bold">{analytics?.summary?.total_events || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Unique Sessions</p>
                  <p className="text-3xl font-bold">{analytics?.summary?.unique_sessions || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Unique Users</p>
                  <p className="text-3xl font-bold">{analytics?.summary?.unique_users || 0}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Page Views</p>
                  <p className="text-3xl font-bold">{analytics?.conversion_funnel?.page_views || 0}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Eye className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Conversion Funnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-between items-center gap-4">
              {[
                { label: 'Page Views', value: analytics?.conversion_funnel?.page_views || 0, color: 'bg-blue-500' },
                { label: 'Product Views', value: analytics?.conversion_funnel?.product_views || 0, color: 'bg-purple-500' },
                { label: 'Add to Cart', value: analytics?.conversion_funnel?.add_to_cart || 0, color: 'bg-orange-500' },
                { label: 'Checkout', value: analytics?.conversion_funnel?.checkout_started || 0, color: 'bg-yellow-500' },
                { label: 'Purchase', value: analytics?.conversion_funnel?.purchase || 0, color: 'bg-green-500' },
              ].map((step, index) => (
                <div key={step.label} className="flex flex-col items-center">
                  <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                    {step.value}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{step.label}</p>
                  {index < 4 && <span className="hidden sm:block text-2xl text-gray-300 mt-2">→</span>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Device Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Devices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics?.devices || {}).map(([device, count]) => {
                  const total = Object.values(analytics?.devices || {}).reduce((a, b) => a + b, 0);
                  const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                  return (
                    <div key={device} className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {getDeviceIcon(device)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="capitalize font-medium">{device}</span>
                          <span className="text-muted-foreground">{count} ({percentage}%)</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Browser Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Browsers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analytics?.browsers || {}).slice(0, 6).map(([browser, count]) => {
                  const total = Object.values(analytics?.browsers || {}).reduce((a, b) => a + b, 0);
                  const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                  return (
                    <div key={browser} className="flex items-center justify-between">
                      <span className="font-medium">{browser}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-16 text-right">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Pages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Top Pages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analytics?.page_views || {}).slice(0, 10).map(([page, count], index) => (
                  <div key={page} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-gray-100 rounded text-xs flex items-center justify-center font-medium">
                        {index + 1}
                      </span>
                      <span className="text-sm truncate max-w-[200px]">{page}</span>
                    </div>
                    <Badge variant="secondary">{count} views</Badge>
                  </div>
                ))}
                {Object.keys(analytics?.page_views || {}).length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No page views recorded</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Cities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Top Locations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analytics?.cities || {}).slice(0, 10).map(([city, count], index) => (
                  <div key={city} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-green-100 rounded text-xs flex items-center justify-center font-medium text-green-700">
                        {index + 1}
                      </span>
                      <span className="font-medium">{city}</span>
                    </div>
                    <Badge variant="outline">{count} visits</Badge>
                  </div>
                ))}
                {Object.keys(analytics?.cities || {}).length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No location data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Product Interactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(analytics?.product_interactions || {}).slice(0, 9).map(([product, count]) => (
                <div key={product} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium truncate">{product}</span>
                  <Badge>{count}</Badge>
                </div>
              ))}
              {Object.keys(analytics?.product_interactions || {}).length === 0 && (
                <p className="text-muted-foreground col-span-3 text-center py-4">No product interactions recorded</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Recent Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {recentEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                      {getEventIcon(event.event_type)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{event.event_type.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-muted-foreground">{event.page}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {event.device?.type || 'unknown'} • {event.device?.browser || 'unknown'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              {recentEvents.length === 0 && (
                <p className="text-muted-foreground text-center py-8">No events recorded yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Location Map Placeholder */}
        {locations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                User Locations ({locations.length} unique locations)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {locations.slice(0, 8).map((loc, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="font-medium">{loc.city || 'Unknown'}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {loc.event_count} events • {loc.unique_users} users
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {loc.latitude?.toFixed(4)}, {loc.longitude?.toFixed(4)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
