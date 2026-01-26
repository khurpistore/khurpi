import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { Package, MapPin, Calendar, ChevronRight, ShoppingBag, CalendarCheck, Repeat } from 'lucide-react';
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
      'once_week': 'Once a Week',
      'twice_week': 'Twice a Week',
      'four_days_week': '4 Days a Week',
      'weekly': 'Once a Week',
      'twice_weekly': 'Twice a Week',
      'four_days': '4 Days a Week'
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="flex items-center gap-2">
              All ({allOrders.length})
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              One-time ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex items-center gap-2">
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
                <Card key={`order-${item.id}`} data-testid={`order-${item.id}`} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                          <Badge className={getStatusColor(item.status)}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Order #{item.id.slice(0, 8)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(item.created_at), 'PPP')}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-2">
                          {item.items?.slice(0, 3).map((orderItem, idx) => (
                            <span key={idx} className="text-sm bg-gray-100 px-2 py-1 rounded">
                              {orderItem.product?.name || 'Product'} × {orderItem.quantity}
                            </span>
                          ))}
                          {item.items?.length > 3 && (
                            <span className="text-sm text-muted-foreground">
                              +{item.items.length - 3} more
                            </span>
                          )}
                        </div>

                        {item.address && (
                          <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-1">{item.address.address_line}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">₹{item.total?.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.items?.length || 0} item(s)
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground hidden sm:block" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                // Subscription Card
                <Card 
                  key={`sub-${item.id}`} 
                  data-testid={`subscription-${item.id}`} 
                  className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-primary/50"
                  onClick={() => navigate(`/subscription/${item.id}`)}
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Repeat className="w-4 h-4 text-primary" />
                          <Badge className={getStatusColor(item.status)}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">Subscription</Badge>
                        </div>
                        
                        <h3 className="font-semibold text-primary mb-1">
                          {getPlanDisplayName(item.frequency)}
                        </h3>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Calendar className="w-4 h-4" />
                          Started {format(new Date(item.created_at), 'PPP')}
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {item.tray_count} pack{item.tray_count > 1 ? 's' : ''} • {item.delivery_days?.join(', ') || item.delivery_day}
                        </p>

                        {item.next_delivery_date && item.status === 'active' && (
                          <p className="text-sm text-primary mt-2">
                            📦 Next: {format(new Date(item.next_delivery_date), 'PP')}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">
                            ₹{(item.total_price * (item.delivery_days?.length || 1) * 4).toFixed(0)}
                          </p>
                          <p className="text-xs text-muted-foreground">per month</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground hidden sm:block" />
                      </div>
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
