import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, Users, Eye, ShoppingCart, CreditCard, MapPin, 
  Monitor, Smartphone, Tablet, Globe, TrendingUp, Calendar,
  Package, MousePointer, Search, UserPlus, LogIn, Loader2,
  AlertTriangle, Activity, Target, RefreshCw, Clock, ArrowRight,
  Percent, UserCheck, UserX, Zap, Share2, Facebook, Instagram, 
  MessageCircle, Twitter, Linkedin, Youtube, ExternalLink, Map,
  Navigation, CircleDot, ZoomIn, ZoomOut, Layers
} from 'lucide-react';
import axios from 'axios';
import AdminLayout from '@/components/AdminLayout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [locations, setLocations] = useState([]);
  const [locationFunnel, setLocationFunnel] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [realtime, setRealtime] = useState(null);
  const [engagement, setEngagement] = useState(null);
  const [errors, setErrors] = useState([]);
  const [journeys, setJourneys] = useState([]);
  const [utmData, setUtmData] = useState([]);
  const [trafficSources, setTrafficSources] = useState({ sources: [], channels: [] });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');
  const [activeTab, setActiveTab] = useState('overview');
  const [mapZoom, setMapZoom] = useState(5);
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 }); // India center
  const mapRef = useRef(null);

  useEffect(() => {
    fetchAnalytics();
    fetchRealtime();
    // Refresh realtime every 30 seconds
    const interval = setInterval(fetchRealtime, 30000);
    return () => clearInterval(interval);
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [summaryRes, locationsRes, locationFunnelRes, eventsRes, engagementRes, errorsRes, journeysRes, utmRes, trafficRes] = await Promise.all([
        axios.get(`${API}/admin/analytics/summary?days=${period}`).catch(() => ({ data: {} })),
        axios.get(`${API}/admin/analytics/locations`).catch(() => ({ data: [] })),
        axios.get(`${API}/admin/analytics/location-funnel?days=${period}`).catch(() => ({ data: [] })),
        axios.get(`${API}/admin/analytics/events?limit=50`).catch(() => ({ data: [] })),
        axios.get(`${API}/admin/analytics/engagement?days=${period}`).catch(() => ({ data: {} })),
        axios.get(`${API}/admin/analytics/errors?days=${period}`).catch(() => ({ data: [] })),
        axios.get(`${API}/admin/analytics/user-journeys?limit=20`).catch(() => ({ data: [] })),
        axios.get(`${API}/admin/analytics/utm?days=${period}`).catch(() => ({ data: [] })),
        axios.get(`${API}/admin/analytics/traffic-sources?days=${period}`).catch(() => ({ data: { sources: [], channels: [] } }))
      ]);
      setAnalytics(summaryRes.data);
      setLocations(locationsRes.data);
      setLocationFunnel(locationFunnelRes.data || []);
      setRecentEvents(eventsRes.data);
      setEngagement(engagementRes.data);
      setErrors(errorsRes.data);
      setJourneys(journeysRes.data);
      setUtmData(utmRes.data);
      setTrafficSources(trafficRes.data || { sources: [], channels: [] });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRealtime = async () => {
    try {
      const res = await axios.get(`${API}/admin/analytics/realtime`);
      setRealtime(res.data);
    } catch (error) {
      console.error('Error fetching realtime:', error);
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
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
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
            <p className="text-muted-foreground">Advanced tracking and insights</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchAnalytics}>
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
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
        </div>

        {/* Real-time Stats */}
        {realtime && (
          <Card className="bg-gradient-to-r from-teal-600 to-cyan-600 border-0 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-5 h-5 text-amber-300 animate-pulse" />
                <span className="font-semibold text-white">Real-time (Last 30 min)</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{realtime.active_sessions}</p>
                  <p className="text-sm text-teal-100">Active Sessions</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-amber-300">{realtime.active_users}</p>
                  <p className="text-sm text-teal-100">Active Users</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{realtime.events_last_30_min}</p>
                  <p className="text-sm text-teal-100">Events</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-amber-300">{Object.keys(realtime.current_pages || {}).length}</p>
                  <p className="text-sm text-teal-100">Pages Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 w-full max-w-3xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="location-map" className="flex items-center gap-1">
              <Map className="w-3 h-3" />
              Location
            </TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="journeys">Journeys</TabsTrigger>
            <TabsTrigger value="errors">Errors</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Events</p>
                      <p className="text-3xl font-bold">{analytics?.summary?.total_events || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-teal-600" />
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
                    <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-cyan-600" />
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
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                      <UserCheck className="w-6 h-6 text-amber-600" />
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
                    <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
                      <Eye className="w-6 h-6 text-rose-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Conversion Funnel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Conversion Funnel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap justify-between items-center gap-4">
                  {[
                    { label: 'Page Views', value: analytics?.conversion_funnel?.page_views || 0, color: 'bg-teal-500' },
                    { label: 'Product Views', value: analytics?.conversion_funnel?.product_views || 0, color: 'bg-cyan-500' },
                    { label: 'Add to Cart', value: analytics?.conversion_funnel?.add_to_cart || 0, color: 'bg-amber-500' },
                    { label: 'Checkout', value: analytics?.conversion_funnel?.checkout_started || 0, color: 'bg-orange-500' },
                    { label: 'Purchase', value: analytics?.conversion_funnel?.purchase || 0, color: 'bg-emerald-500' },
                  ].map((step, index, arr) => (
                    <React.Fragment key={step.label}>
                      <div className="flex flex-col items-center">
                        <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                          {step.value}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{step.label}</p>
                        {index > 0 && arr[index - 1].value > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {((step.value / arr[index - 1].value) * 100).toFixed(1)}%
                          </p>
                        )}
                      </div>
                      {index < arr.length - 1 && (
                        <ArrowRight className="w-6 h-6 text-gray-300 hidden sm:block" />
                      )}
                    </React.Fragment>
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

              {/* Top Locations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Top Locations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(analytics?.cities || {}).slice(0, 8).map(([city, count], index) => (
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

            {/* Recent Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {recentEvents.slice(0, 20).map((event, index) => (
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Location Map Tab */}
          <TabsContent value="location-map" className="space-y-6">
            {/* Location Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Globe className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Locations</p>
                      <p className="text-2xl font-bold">{locationFunnel.length || Object.keys(analytics?.cities || {}).length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Anonymous Visitors</p>
                      <p className="text-2xl font-bold">{locationFunnel.reduce((acc, l) => acc + (l.anonymous_visitors || 0), 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <ShoppingCart className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Cart Adds (No Login)</p>
                      <p className="text-2xl font-bold">{locationFunnel.reduce((acc, l) => acc + (l.anonymous_cart_adds || 0), 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CreditCard className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Checkouts Started</p>
                      <p className="text-2xl font-bold">{locationFunnel.reduce((acc, l) => acc + (l.checkout_started || 0), 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Interactive Map */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Map className="w-5 h-5" />
                    User Locations Map
                  </span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setMapZoom(z => Math.min(z + 1, 18))}>
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setMapZoom(z => Math.max(z - 1, 2))}>
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { setMapCenter({ lat: 20.5937, lng: 78.9629 }); setMapZoom(5); }}>
                      <Navigation className="w-4 h-4 mr-1" />
                      Reset
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  ref={mapRef}
                  className="relative w-full h-[500px] bg-slate-100 rounded-lg overflow-hidden border"
                  style={{
                    backgroundImage: `url('https://api.mapbox.com/styles/v1/mapbox/light-v11/static/${mapCenter.lng},${mapCenter.lat},${mapZoom},0/1200x600@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {/* OpenStreetMap Embed */}
                  <iframe
                    title="User Locations Map"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapCenter.lng - 15},${mapCenter.lat - 10},${mapCenter.lng + 15},${mapCenter.lat + 10}&layer=mapnik&marker=${mapCenter.lat},${mapCenter.lng}`}
                    style={{ border: 0 }}
                  />
                  
                  {/* Pin Markers Overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    {locationFunnel.slice(0, 50).map((location, index) => {
                      if (!location.latitude || !location.longitude) return null;
                      
                      // Calculate position on the map view
                      const mapWidth = 1200;
                      const mapHeight = 500;
                      const latRange = 20; // degrees visible
                      const lngRange = 30;
                      
                      const x = ((location.longitude - (mapCenter.lng - lngRange/2)) / lngRange) * 100;
                      const y = ((mapCenter.lat + latRange/2 - location.latitude) / latRange) * 100;
                      
                      if (x < 0 || x > 100 || y < 0 || y > 100) return null;
                      
                      const size = Math.min(Math.max(location.total_events / 10, 8), 40);
                      const hasCartAdd = location.anonymous_cart_adds > 0;
                      const hasCheckout = location.checkout_started > 0;
                      
                      return (
                        <div
                          key={index}
                          className="absolute transform -translate-x-1/2 -translate-y-full pointer-events-auto cursor-pointer group"
                          style={{ left: `${x}%`, top: `${y}%` }}
                          title={`${location.city}: ${location.total_events} events, ${location.anonymous_cart_adds || 0} cart adds`}
                        >
                          <div className={`
                            relative flex items-center justify-center
                            ${hasCheckout ? 'text-green-500' : hasCartAdd ? 'text-amber-500' : 'text-blue-500'}
                          `}>
                            <MapPin 
                              className="drop-shadow-lg" 
                              style={{ width: size, height: size }}
                              fill={hasCheckout ? '#22c55e' : hasCartAdd ? '#f59e0b' : '#3b82f6'}
                              strokeWidth={1.5}
                            />
                            {location.total_events > 5 && (
                              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                                {location.total_events > 99 ? '99+' : location.total_events}
                              </span>
                            )}
                          </div>
                          
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                            <div className="bg-white rounded-lg shadow-xl p-3 min-w-[200px] border">
                              <p className="font-semibold text-sm">{location.city}, {location.state}</p>
                              <div className="mt-2 space-y-1 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Page Views:</span>
                                  <span className="font-medium">{location.page_views || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Product Views:</span>
                                  <span className="font-medium">{location.product_views || 0}</span>
                                </div>
                                <div className="flex justify-between text-amber-600">
                                  <span>Cart Adds:</span>
                                  <span className="font-medium">{location.anonymous_cart_adds || 0}</span>
                                </div>
                                <div className="flex justify-between text-green-600">
                                  <span>Checkouts:</span>
                                  <span className="font-medium">{location.checkout_started || 0}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Map Legend */}
                <div className="flex flex-wrap gap-4 mt-4 justify-center text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-500" fill="#3b82f6" />
                    <span>Page Views Only</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-amber-500" fill="#f59e0b" />
                    <span>Added to Cart</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-500" fill="#22c55e" />
                    <span>Started Checkout</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Funnel Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Location-wise Funnel (Anonymous + Logged In)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-3 font-medium">Location</th>
                        <th className="text-right p-3 font-medium">
                          <span className="flex items-center justify-end gap-1">
                            <Eye className="w-4 h-4" /> Page Views
                          </span>
                        </th>
                        <th className="text-right p-3 font-medium">
                          <span className="flex items-center justify-end gap-1">
                            <Package className="w-4 h-4" /> Product Views
                          </span>
                        </th>
                        <th className="text-right p-3 font-medium">
                          <span className="flex items-center justify-end gap-1">
                            <ShoppingCart className="w-4 h-4" /> Add to Cart
                          </span>
                        </th>
                        <th className="text-right p-3 font-medium">
                          <span className="flex items-center justify-end gap-1">
                            <CreditCard className="w-4 h-4" /> Checkout
                          </span>
                        </th>
                        <th className="text-right p-3 font-medium">Anonymous %</th>
                        <th className="text-right p-3 font-medium">Conv. Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {locationFunnel.length > 0 ? (
                        locationFunnel.slice(0, 20).map((location, index) => {
                          const convRate = location.page_views > 0 
                            ? ((location.checkout_started / location.page_views) * 100).toFixed(1) 
                            : '0.0';
                          const anonPercent = location.total_events > 0
                            ? (((location.anonymous_visitors || 0) / location.total_events) * 100).toFixed(0)
                            : '0';
                          
                          return (
                            <tr key={index} className="border-b hover:bg-gray-50">
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-gray-400" />
                                  <div>
                                    <p className="font-medium">{location.city}</p>
                                    <p className="text-xs text-muted-foreground">{location.state}, {location.country}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 text-right font-medium">{location.page_views || 0}</td>
                              <td className="p-3 text-right">{location.product_views || 0}</td>
                              <td className="p-3 text-right">
                                <span className="text-amber-600 font-medium">{location.anonymous_cart_adds || 0}</span>
                              </td>
                              <td className="p-3 text-right">
                                <span className="text-green-600 font-medium">{location.checkout_started || 0}</span>
                              </td>
                              <td className="p-3 text-right">
                                <Badge variant={parseInt(anonPercent) > 70 ? 'destructive' : 'secondary'}>
                                  {anonPercent}%
                                </Badge>
                              </td>
                              <td className="p-3 text-right">
                                <Badge variant={parseFloat(convRate) > 2 ? 'default' : 'outline'}>
                                  {convRate}%
                                </Badge>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-muted-foreground">
                            <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No location data available yet</p>
                            <p className="text-sm">Location data will appear as users browse the site</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Top Cities Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-600">
                    <ShoppingCart className="w-5 h-5" />
                    Top Cities - Anonymous Cart Adds
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {locationFunnel
                      .filter(l => (l.anonymous_cart_adds || 0) > 0)
                      .sort((a, b) => (b.anonymous_cart_adds || 0) - (a.anonymous_cart_adds || 0))
                      .slice(0, 10)
                      .map((location, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center text-xs font-bold text-amber-800">
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-medium">{location.city}</p>
                              <p className="text-xs text-muted-foreground">{location.state}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-amber-700">{location.anonymous_cart_adds}</p>
                            <p className="text-xs text-muted-foreground">cart adds</p>
                          </div>
                        </div>
                      ))
                    }
                    {locationFunnel.filter(l => (l.anonymous_cart_adds || 0) > 0).length === 0 && (
                      <p className="text-center text-muted-foreground py-4">No anonymous cart activity yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <TrendingUp className="w-5 h-5" />
                    Top Converting Locations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {locationFunnel
                      .filter(l => (l.checkout_started || 0) > 0)
                      .sort((a, b) => {
                        const aRate = a.page_views > 0 ? (a.checkout_started / a.page_views) : 0;
                        const bRate = b.page_views > 0 ? (b.checkout_started / b.page_views) : 0;
                        return bRate - aRate;
                      })
                      .slice(0, 10)
                      .map((location, index) => {
                        const convRate = location.page_views > 0 
                          ? ((location.checkout_started / location.page_views) * 100).toFixed(1)
                          : '0.0';
                        return (
                          <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center text-xs font-bold text-green-800">
                                {index + 1}
                              </span>
                              <div>
                                <p className="font-medium">{location.city}</p>
                                <p className="text-xs text-muted-foreground">{location.page_views} views → {location.checkout_started} checkouts</p>
                              </div>
                            </div>
                            <Badge className="bg-green-600">{convRate}%</Badge>
                          </div>
                        );
                      })
                    }
                    {locationFunnel.filter(l => (l.checkout_started || 0) > 0).length === 0 && (
                      <p className="text-center text-muted-foreground py-4">No checkout data yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Engagement Tab */}
          <TabsContent value="engagement" className="space-y-6">
            {engagement && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Percent className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                      <p className="text-3xl font-bold">{engagement.bounce_rate}%</p>
                      <p className="text-sm text-muted-foreground">Bounce Rate</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <TrendingUp className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
                      <p className="text-3xl font-bold">{engagement.conversion_rate}%</p>
                      <p className="text-sm text-muted-foreground">Conversion Rate</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Eye className="w-8 h-8 mx-auto mb-2 text-cyan-600" />
                      <p className="text-3xl font-bold">{engagement.avg_pages_per_session}</p>
                      <p className="text-sm text-muted-foreground">Avg Pages/Session</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Zap className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                      <p className="text-3xl font-bold">{engagement.avg_events_per_session}</p>
                      <p className="text-sm text-muted-foreground">Avg Events/Session</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Visitor Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-teal-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <UserPlus className="w-6 h-6 text-teal-600" />
                            <span className="font-medium">New Visitors</span>
                          </div>
                          <span className="text-2xl font-bold text-teal-700">{engagement.new_visitors}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-cyan-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <UserCheck className="w-6 h-6 text-cyan-600" />
                            <span className="font-medium">Returning Visitors</span>
                          </div>
                          <span className="text-2xl font-bold text-cyan-700">{engagement.returning_visitors}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Percent className="w-6 h-6 text-amber-600" />
                            <span className="font-medium">Return Rate</span>
                          </div>
                          <span className="text-2xl font-bold text-amber-700">{engagement.returning_visitor_rate?.toFixed(1)}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Session Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                          <span className="font-medium">Total Sessions</span>
                          <span className="text-2xl font-bold">{engagement.total_sessions}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                          <span className="font-medium">Total Visitors</span>
                          <span className="text-2xl font-bold">{engagement.total_visitors}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* Journeys Tab */}
          <TabsContent value="journeys" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Journeys</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {journeys.map((journey, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{journey.event_count} events</Badge>
                          {journey.user_id && <Badge className="bg-green-100 text-green-700">Logged In</Badge>}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Session: {journey.session_id?.substring(0, 20)}...
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {journey.events?.slice(0, 10).map((event, i) => (
                          <React.Fragment key={i}>
                            <div className="flex items-center gap-1 px-2 py-1 bg-white rounded text-xs">
                              {getEventIcon(event.event_type)}
                              <span>{event.page || event.event_type}</span>
                            </div>
                            {i < Math.min(journey.events.length - 1, 9) && (
                              <ArrowRight className="w-4 h-4 text-gray-300" />
                            )}
                          </React.Fragment>
                        ))}
                        {journey.events?.length > 10 && (
                          <Badge variant="secondary">+{journey.events.length - 10} more</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  {journeys.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No user journeys recorded yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Errors Tab */}
          <TabsContent value="errors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Error Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                {errors.length > 0 ? (
                  <div className="space-y-3">
                    {errors.map((error, index) => (
                      <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="destructive">{error.count} occurrences</Badge>
                          <span className="text-xs text-muted-foreground">
                            Last: {new Date(error.last_seen).toLocaleString()}
                          </span>
                        </div>
                        <p className="font-medium text-red-800">{error.error_type}</p>
                        <p className="text-sm text-red-600 mt-1">{error.message}</p>
                        <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                          <span>Pages: {error.affected_pages?.join(', ') || 'Unknown'}</span>
                          <span>•</span>
                          <span>Users affected: {error.affected_users_count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <AlertTriangle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                    <p className="text-lg font-medium text-green-700">No Errors!</p>
                    <p className="text-muted-foreground">Everything is running smoothly</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            {/* Traffic Sources Overview */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* By Source */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="w-5 h-5" />
                    Traffic Sources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {trafficSources.sources?.length > 0 ? (
                    <div className="space-y-3">
                      {trafficSources.sources.slice(0, 10).map((source, index) => {
                        const totalSessions = trafficSources.sources.reduce((a, b) => a + b.sessions, 0);
                        const percentage = totalSessions > 0 ? ((source.sessions / totalSessions) * 100).toFixed(1) : 0;
                        
                        // Get icon based on source name
                        const getSourceIcon = (name) => {
                          const lowerName = name.toLowerCase();
                          if (lowerName.includes('facebook') || lowerName.includes('fb')) return <Facebook className="w-4 h-4 text-blue-600" />;
                          if (lowerName.includes('instagram')) return <Instagram className="w-4 h-4 text-pink-500" />;
                          if (lowerName.includes('whatsapp')) return <MessageCircle className="w-4 h-4 text-green-500" />;
                          if (lowerName.includes('twitter') || lowerName.includes('x.com')) return <Twitter className="w-4 h-4 text-blue-400" />;
                          if (lowerName.includes('linkedin')) return <Linkedin className="w-4 h-4 text-blue-700" />;
                          if (lowerName.includes('youtube')) return <Youtube className="w-4 h-4 text-red-600" />;
                          if (lowerName.includes('google')) return <Search className="w-4 h-4 text-orange-500" />;
                          if (lowerName === 'direct') return <Globe className="w-4 h-4 text-gray-500" />;
                          return <ExternalLink className="w-4 h-4 text-gray-400" />;
                        };
                        
                        const getSourceColor = (name) => {
                          const lowerName = name.toLowerCase();
                          if (lowerName.includes('facebook') || lowerName.includes('fb')) return 'bg-blue-500';
                          if (lowerName.includes('instagram')) return 'bg-gradient-to-r from-purple-500 to-pink-500';
                          if (lowerName.includes('whatsapp')) return 'bg-green-500';
                          if (lowerName.includes('twitter') || lowerName.includes('x.com')) return 'bg-blue-400';
                          if (lowerName.includes('linkedin')) return 'bg-blue-700';
                          if (lowerName.includes('youtube')) return 'bg-red-600';
                          if (lowerName.includes('google')) return 'bg-orange-500';
                          if (lowerName === 'direct') return 'bg-gray-500';
                          return 'bg-purple-500';
                        };
                        
                        return (
                          <div key={source.source} className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              {getSourceIcon(source.source)}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between mb-1">
                                <span className="font-medium capitalize text-sm">{source.source}</span>
                                <span className="text-sm text-muted-foreground">{source.sessions} ({percentage}%)</span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${getSourceColor(source.source)} rounded-full`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Share2 className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                      <p className="text-muted-foreground">No traffic data yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* By Channel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Traffic Channels
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {trafficSources.channels?.length > 0 ? (
                    <div className="space-y-4">
                      {trafficSources.channels.map((channel) => {
                        const totalSessions = trafficSources.channels.reduce((a, b) => a + b.sessions, 0);
                        const percentage = totalSessions > 0 ? ((channel.sessions / totalSessions) * 100).toFixed(1) : 0;
                        
                        const channelColors = {
                          'social': { bg: 'bg-pink-50', text: 'text-pink-700', bar: 'bg-pink-500' },
                          'search': { bg: 'bg-orange-50', text: 'text-orange-700', bar: 'bg-orange-500' },
                          'direct': { bg: 'bg-gray-50', text: 'text-gray-700', bar: 'bg-gray-500' },
                          'referral': { bg: 'bg-purple-50', text: 'text-purple-700', bar: 'bg-purple-500' },
                          'email': { bg: 'bg-blue-50', text: 'text-blue-700', bar: 'bg-blue-500' },
                          'content': { bg: 'bg-green-50', text: 'text-green-700', bar: 'bg-green-500' }
                        };
                        const colors = channelColors[channel.channel] || channelColors.referral;
                        
                        return (
                          <div key={channel.channel} className={`p-4 ${colors.bg} rounded-lg`}>
                            <div className="flex justify-between items-center mb-2">
                              <span className={`font-semibold capitalize ${colors.text}`}>{channel.channel}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{channel.sessions} sessions</span>
                                <Badge variant="outline">{percentage}%</Badge>
                              </div>
                            </div>
                            <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${colors.bar} rounded-full`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                              <span>{channel.events} events</span>
                              <span>{channel.conversions} conversions ({channel.conversion_rate?.toFixed(1)}%)</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <TrendingUp className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                      <p className="text-muted-foreground">No channel data yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Source Performance Table */}
            {trafficSources.sources?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Source Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3">Source</th>
                          <th className="text-right p-3">Sessions</th>
                          <th className="text-right p-3">Events</th>
                          <th className="text-right p-3">Add to Cart</th>
                          <th className="text-right p-3">Conversions</th>
                          <th className="text-right p-3">Conv. Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trafficSources.sources.map((source) => (
                          <tr key={source.source} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium capitalize">{source.source}</td>
                            <td className="p-3 text-right">{source.sessions}</td>
                            <td className="p-3 text-right">{source.events}</td>
                            <td className="p-3 text-right">{source.add_to_cart}</td>
                            <td className="p-3 text-right">{source.conversions}</td>
                            <td className="p-3 text-right">
                              <Badge variant={source.conversion_rate > 2 ? "default" : "secondary"}>
                                {source.conversion_rate?.toFixed(1)}%
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* UTM Campaign Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  UTM Campaign Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                {utmData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3">Source</th>
                          <th className="text-left p-3">Medium</th>
                          <th className="text-left p-3">Campaign</th>
                          <th className="text-right p-3">Sessions</th>
                          <th className="text-right p-3">Page Views</th>
                          <th className="text-right p-3">Conversions</th>
                          <th className="text-right p-3">Conv. Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {utmData.map((row, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium">{row.source}</td>
                            <td className="p-3">{row.medium}</td>
                            <td className="p-3">{row.campaign}</td>
                            <td className="p-3 text-right">{row.sessions}</td>
                            <td className="p-3 text-right">{row.page_views}</td>
                            <td className="p-3 text-right">{row.conversions}</td>
                            <td className="p-3 text-right">
                              <Badge variant={row.conversion_rate > 2 ? "default" : "secondary"}>
                                {row.conversion_rate?.toFixed(1)}%
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Target className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-lg font-medium">No Campaign Data</p>
                    <p className="text-muted-foreground">Add UTM parameters to your links to track campaigns</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Example: ?utm_source=facebook&utm_medium=social&utm_campaign=summer_sale
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
