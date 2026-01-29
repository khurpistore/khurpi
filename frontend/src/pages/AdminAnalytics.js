import React, { useState, useEffect } from 'react';
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
  MessageCircle, Twitter, Linkedin, Youtube, ExternalLink
} from 'lucide-react';
import axios from 'axios';
import AdminLayout from '@/components/AdminLayout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [locations, setLocations] = useState([]);
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
      const [summaryRes, locationsRes, eventsRes, engagementRes, errorsRes, journeysRes, utmRes, trafficRes] = await Promise.all([
        axios.get(`${API}/admin/analytics/summary?days=${period}`),
        axios.get(`${API}/admin/analytics/locations`),
        axios.get(`${API}/admin/analytics/events?limit=50`),
        axios.get(`${API}/admin/analytics/engagement?days=${period}`),
        axios.get(`${API}/admin/analytics/errors?days=${period}`),
        axios.get(`${API}/admin/analytics/user-journeys?limit=20`),
        axios.get(`${API}/admin/analytics/utm?days=${period}`),
        axios.get(`${API}/admin/analytics/traffic-sources?days=${period}`)
      ]);
      setAnalytics(summaryRes.data);
      setLocations(locationsRes.data);
      setRecentEvents(eventsRes.data);
      setEngagement(engagementRes.data);
      setErrors(errorsRes.data);
      setJourneys(journeysRes.data);
      setUtmData(utmRes.data);
      setTrafficSources(trafficRes.data);
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
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
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
                    { label: 'Page Views', value: analytics?.conversion_funnel?.page_views || 0, color: 'bg-blue-500' },
                    { label: 'Product Views', value: analytics?.conversion_funnel?.product_views || 0, color: 'bg-purple-500' },
                    { label: 'Add to Cart', value: analytics?.conversion_funnel?.add_to_cart || 0, color: 'bg-orange-500' },
                    { label: 'Checkout', value: analytics?.conversion_funnel?.checkout_started || 0, color: 'bg-yellow-500' },
                    { label: 'Purchase', value: analytics?.conversion_funnel?.purchase || 0, color: 'bg-green-500' },
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
                      <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
                      <p className="text-3xl font-bold">{engagement.conversion_rate}%</p>
                      <p className="text-sm text-muted-foreground">Conversion Rate</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Eye className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                      <p className="text-3xl font-bold">{engagement.avg_pages_per_session}</p>
                      <p className="text-sm text-muted-foreground">Avg Pages/Session</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Zap className="w-8 h-8 mx-auto mb-2 text-orange-600" />
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
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <UserPlus className="w-6 h-6 text-green-600" />
                            <span className="font-medium">New Visitors</span>
                          </div>
                          <span className="text-2xl font-bold text-green-700">{engagement.new_visitors}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <UserCheck className="w-6 h-6 text-blue-600" />
                            <span className="font-medium">Returning Visitors</span>
                          </div>
                          <span className="text-2xl font-bold text-blue-700">{engagement.returning_visitors}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Percent className="w-6 h-6 text-purple-600" />
                            <span className="font-medium">Return Rate</span>
                          </div>
                          <span className="text-2xl font-bold text-purple-700">{engagement.returning_visitor_rate?.toFixed(1)}%</span>
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
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <span className="font-medium">Total Sessions</span>
                          <span className="text-2xl font-bold">{engagement.total_sessions}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
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
