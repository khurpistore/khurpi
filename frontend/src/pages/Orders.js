import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { Package, MapPin, Calendar, ChevronRight, ShoppingBag, CalendarCheck, Repeat, Truck } from 'lucide-react';
import { format } from 'date-fns';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchAllOrders();
  }, [user, navigate]);

  const fetchAllOrders = async () => {
    try {
      const [ordersRes, subscriptionsRes] = await Promise.all([
        axios.get(`${API}/orders?user_id=${user.id}`),
        axios.get(`${API}/subscriptions?user_id=${user.id}`)
      ]);
      setOrders(ordersRes.data);
      setSubscriptions(subscriptionsRes.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'delivered': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanDisplayName = (frequency) => {
    const planNames = {
      'once_week': 'Fresh Start Plan',
      'twice_week': 'Balanced Nutrition Plan',
      'four_days_week': 'Power Greens Plan',
      'weekly': 'Fresh Start Plan',
      'twice_weekly': 'Balanced Nutrition Plan',
      'four_days': 'Power Greens Plan'
    };
    return planNames[frequency] || frequency;
  };

  // Combine and sort all orders by date
  const getAllOrdersSorted = () => {
    const oneTimeOrders = orders.map(o => ({ ...o, type: 'order' }));
    const subOrders = subscriptions.map(s => ({ ...s, type: 'subscription' }));
    return [...oneTimeOrders, ...subOrders].sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const allOrders = getAllOrdersSorted();
  const filteredOrders = activeTab === 'all' 
    ? allOrders 
    : activeTab === 'orders' 
      ? allOrders.filter(o => o.type === 'order')
      : allOrders.filter(o => o.type === 'subscription');

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2">
            <ShoppingBag className="w-7 h-7" />
            My Orders
          </h1>
          <Button onClick={() => navigate('/products')} className="rounded-full">
            Continue Shopping
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3 bg-primary p-1 rounded-full">
            <TabsTrigger 
              value="all" 
              className="flex items-center gap-2 rounded-full text-white data-[state=active]:bg-white data-[state=active]:text-primary data-[state=inactive]:text-white"
            >
              All ({allOrders.length})
            </TabsTrigger>
            <TabsTrigger 
              value="orders" 
              className="flex items-center gap-2 rounded-full text-white data-[state=active]:bg-white data-[state=active]:text-primary data-[state=inactive]:text-white"
            >
              <ShoppingBag className="w-4 h-4" />
              One-time ({orders.length})
            </TabsTrigger>
            <TabsTrigger 
              value="subscriptions" 
              className="flex items-center gap-2 rounded-full text-white data-[state=active]:bg-white data-[state=active]:text-primary data-[state=inactive]:text-white"
            >
              <Repeat className="w-4 h-4" />
              Subscriptions ({subscriptions.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {filteredOrders.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
              <p className="text-muted-foreground mb-4">
                {activeTab === 'subscriptions' 
                  ? "You don't have any subscriptions yet."
                  : "You haven't placed any orders yet. Start shopping!"}
              </p>
              <Button 
                onClick={() => navigate(activeTab === 'subscriptions' ? '/subscription/create' : '/products')} 
                className="rounded-full"
              >
                {activeTab === 'subscriptions' ? 'Start Subscription' : 'Browse Products'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((item) => (
              item.type === 'order' ? (
                // One-time Order Card
                <Card 
                  key={`order-${item.id}`} 
                  data-testid={`order-${item.id}`} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/order/${item.id}`)}
                >
                  <CardContent className="p-4 sm:p-6">
                    {/* Header Row */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                          <Badge className={getStatusColor(item.status)}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Order #{item.id.slice(0, 8)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">₹{item.total?.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.items?.length || 0} item(s)
                        </p>
                      </div>
                    </div>
                    
                    {/* Products */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {item.items?.slice(0, 3).map((orderItem, idx) => (
                        <span key={idx} className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {orderItem.product?.name || 'Product'} × {orderItem.quantity}
                        </span>
                      ))}
                      {item.items?.length > 3 && (
                        <button 
                          className="text-sm text-primary font-medium hover:underline"
                          onClick={(e) => { e.stopPropagation(); navigate(`/order/${item.id}`); }}
                        >
                          +{item.items.length - 3} more
                        </button>
                      )}
                    </div>

                    {/* Delivery Address */}
                    {item.address && (
                      <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Delivery Address</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{item.address.address_line}</p>
                            {item.address.phone && (
                              <p className="text-xs text-muted-foreground">📞 +91 {item.address.phone}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Order Date and Delivery Date */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-muted-foreground">Order Date</p>
                        <p className="text-xs font-medium">{format(new Date(item.created_at), 'MMM d, yyyy')}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-green-700">Delivery Date</p>
                        <p className="text-xs font-medium text-green-800">
                          {item.estimated_delivery_date 
                            ? format(new Date(item.estimated_delivery_date), 'MMM d, yyyy')
                            : format(new Date(new Date(item.created_at).getTime() + 86400000), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>

                    {/* View Details */}
                    <div className="flex items-center justify-end">
                      <span className="text-sm text-primary font-medium flex items-center gap-1">
                        View Details <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                // Subscription Card - Enhanced with product info like MySubscriptions
                <Card 
                  key={`sub-${item.id}`} 
                  data-testid={`subscription-${item.id}`} 
                  className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-primary/50"
                  onClick={() => navigate(`/subscription/${item.id}`, { state: { from: 'orders' } })}
                >
                  <CardContent className="p-4 sm:p-6">
                    {/* Header Row */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Repeat className="w-4 h-4 text-primary" />
                          <Badge className={getStatusColor(item.status)}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">Subscription</Badge>
                        </div>
                        <h3 className="font-semibold text-primary">
                          {getPlanDisplayName(item.frequency)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {item.tray_count}gm • {(item.delivery_days?.length || 1) * 4} deliveries/month
                        </p>
                        <p className="text-sm text-muted-foreground">
                          📅 {item.delivery_days && item.delivery_days.length > 0 
                            ? item.delivery_days.join(', ')
                            : item.delivery_day || 'Not set'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">
                          ₹{(item.total_price * (item.delivery_days?.length || 1) * 4).toFixed(0)}
                        </p>
                        <p className="text-xs text-muted-foreground">per month</p>
                      </div>
                    </div>

                    {/* Products Grid - Same as MySubscriptions */}
                    {item.items && item.items.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Products</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {item.items.map((subItem) => (
                            <div 
                              key={subItem.id} 
                              className="flex items-center gap-2 p-2 rounded-lg bg-gray-50"
                            >
                              <img 
                                src={subItem.product?.image} 
                                alt={subItem.product?.name} 
                                className="w-10 h-10 rounded object-cover" 
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{subItem.product?.name}</p>
                                <p className="text-xs text-muted-foreground">{subItem.quantity}gm</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Delivery Address */}
                    {item.address && (
                      <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Delivery Address</p>
                              {item.address.name && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                  {item.address.name}
                                </span>
                              )}
                            </div>
                            {item.address.receiver_name && (
                              <p className="text-sm font-semibold text-primary">{item.address.receiver_name}</p>
                            )}
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {[
                                item.address.address_line || item.address.address_line_1,
                                item.address.landmark,
                                item.address.area,
                                item.address.city
                              ].filter(Boolean).join(', ')}
                              {item.address.pincode && ` - ${item.address.pincode}`}
                            </p>
                            {item.address.phone && (
                              <p className="text-xs text-muted-foreground mt-1">📞 +91 {item.address.phone}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Important Dates */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-muted-foreground">Created</p>
                        <p className="text-xs font-medium">{format(new Date(item.created_at), 'MMM d, yyyy')}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-green-700">Next Delivery</p>
                        <p className="text-xs font-medium text-green-800">
                          {item.next_delivery_date 
                            ? format(new Date(item.next_delivery_date), 'MMM d')
                            : '-'}
                        </p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-blue-700">Renews On</p>
                        <p className="text-xs font-medium text-blue-800">
                          {item.renewal_date 
                            ? format(new Date(item.renewal_date), 'MMM d')
                            : format(new Date(new Date(item.start_date).setMonth(new Date(item.start_date).getMonth() + 1)), 'MMM d')}
                        </p>
                      </div>
                    </div>

                    {/* View Details */}
                    <div className="flex items-center justify-end">
                      <span className="text-sm text-primary font-medium flex items-center gap-1">
                        View Details <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
