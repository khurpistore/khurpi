import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { Package, MapPin, ChevronRight, ShoppingBag, Repeat, Clock, Tag, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
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
      
      // Combine orders and subscriptions into unified orders
      // Group by created_at date (same day = same order)
      const allItems = [
        ...ordersRes.data.map(o => ({ ...o, itemType: 'one_time' })),
        ...subscriptionsRes.data.map(s => ({ ...s, itemType: 'subscription' }))
      ];
      
      // Sort by date descending
      allItems.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      setOrders(allItems);
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
      'four_days': 'Power Greens Plan',
      'daily': 'Daily Plan'
    };
    return planNames[frequency] || frequency;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2">
            <ShoppingBag className="w-7 h-7" />
            My Orders
          </h1>
          <Button onClick={() => navigate('/products')} className="rounded-full">
            Continue Shopping
          </Button>
        </div>

        {orders.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't placed any orders yet. Start shopping!
              </p>
              <Button onClick={() => navigate('/products')} className="rounded-full">
                Browse Products
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isSubscription = order.itemType === 'subscription';
              
              // Calculate totals and discounts
              const originalAmount = isSubscription ? order.subtotal : order.subtotal;
              const paidAmount = isSubscription ? order.total_price : order.total;
              const discountAmount = isSubscription 
                ? (order.bulk_discount_amount || 0)
                : ((order.discount_amount || 0) + (order.coupon_discount || 0));
              const discountPercent = isSubscription 
                ? order.bulk_discount_percent 
                : order.discount_percent;
              
              return (
                <Card 
                  key={`${order.itemType}-${order.id}`}
                  data-testid={`order-${order.id}`}
                  className="overflow-hidden hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-0">
                    {/* Order Header */}
                    <div className="p-4 sm:p-6 border-b bg-gray-50/50">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Order #{order.id.slice(0, 8)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(order.created_at), 'MMM d, yyyy • hh:mm a')}
                          </div>
                        </div>
                        <div className="text-right">
                          {discountAmount > 0 && (
                            <p className="text-sm text-muted-foreground line-through">
                              ₹{originalAmount?.toLocaleString()}
                            </p>
                          )}
                          <p className="text-2xl font-bold text-primary">
                            ₹{paidAmount?.toLocaleString()}
                          </p>
                          {isSubscription && (
                            <p className="text-xs text-muted-foreground">per month</p>
                          )}
                          {discountAmount > 0 && (
                            <Badge className="bg-green-100 text-green-800 mt-1">
                              Saved ₹{discountAmount.toLocaleString()}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Order Body */}
                    <div className="p-4 sm:p-6">
                      {/* Subscription Section */}
                      {isSubscription && (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Repeat className="w-4 h-4 text-primary" />
                            <span className="text-sm font-semibold text-primary">Subscription</span>
                            <Badge variant="outline" className="text-xs">{getPlanDisplayName(order.frequency)}</Badge>
                          </div>
                          
                          {/* Subscription Info */}
                          <div className="p-3 bg-primary/5 rounded-lg mb-3">
                            <p className="text-sm font-medium text-primary">
                              {order.tray_count}gm • {(order.delivery_days?.length || 1) * 4} deliveries/month
                            </p>
                            <p className="text-sm text-muted-foreground">
                              📅 {order.delivery_days?.join(', ') || order.delivery_day || 'Not set'}
                            </p>
                          </div>

                          {/* Subscription Products */}
                          {order.items && order.items.length > 0 && (
                            <div className="space-y-2">
                              {order.items.map((item, idx) => {
                                const pricePerUnit = item.product?.price || 0;
                                const quantity = item.quantity || 100;
                                const totalPrice = (quantity / 100) * pricePerUnit;
                                return (
                                  <div 
                                    key={idx}
                                    className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                                  >
                                    <img 
                                      src={item.product?.image} 
                                      alt={item.product?.name}
                                      className="w-12 h-12 rounded-lg object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{item.product?.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {quantity}gm × ₹{pricePerUnit}/100gm
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-semibold text-primary">₹{totalPrice.toFixed(0)}</p>
                                      <p className="text-xs text-muted-foreground">per delivery</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Subscription Dates */}
                          <div className="grid grid-cols-2 gap-2 mt-3">
                            <div className="bg-green-50 rounded-lg p-2 text-center">
                              <p className="text-xs text-green-700">Next Delivery</p>
                              <p className="text-sm font-medium text-green-800">
                                {order.next_delivery_date 
                                  ? format(new Date(order.next_delivery_date), 'MMM d')
                                  : '-'}
                              </p>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-2 text-center">
                              <p className="text-xs text-blue-700">Renews On</p>
                              <p className="text-sm font-medium text-blue-800">
                                {order.renewal_date 
                                  ? format(new Date(order.renewal_date), 'MMM d')
                                  : format(new Date(new Date(order.start_date).setMonth(new Date(order.start_date).getMonth() + 1)), 'MMM d')}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* One-time Products Section */}
                      {!isSubscription && (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-3">
                            <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-semibold">One-time Purchase</span>
                          </div>

                          {/* One-time Products */}
                          {order.items && order.items.length > 0 && (
                            <div className="space-y-2">
                              {order.items.map((item, idx) => {
                                const pricePerUnit = item.price || item.product?.price || 0;
                                const quantity = item.quantity || 100;
                                const totalPrice = (quantity / 100) * pricePerUnit;
                                const isGrowing = item.product?.stock_status === 'growing';
                                return (
                                  <div 
                                    key={idx}
                                    className={`flex items-center gap-3 p-2 rounded-lg ${isGrowing ? 'bg-amber-50' : 'bg-gray-50'}`}
                                  >
                                    {item.product?.image ? (
                                      <img 
                                        src={item.product.image} 
                                        alt={item.product?.name}
                                        className="w-12 h-12 rounded-lg object-cover"
                                      />
                                    ) : (
                                      <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                        <Package className="w-6 h-6 text-gray-400" />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{item.product?.name || 'Product'}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {quantity}gm × ₹{pricePerUnit}/100gm
                                      </p>
                                    </div>
                                    <p className="text-sm font-semibold text-primary">₹{totalPrice.toFixed(0)}</p>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* One-time Delivery Date */}
                          <div className="mt-3 bg-green-50 rounded-lg p-2 flex items-center justify-center gap-2">
                            <Clock className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-green-700">Delivery:</span>
                            <span className="text-sm font-medium text-green-800">
                              {order.estimated_delivery_date 
                                ? format(new Date(order.estimated_delivery_date), 'MMM d, yyyy')
                                : '-'}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Savings Banner */}
                      {discountAmount > 0 && (
                        <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg mb-4">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-700">
                              {isSubscription 
                                ? `You saved ${discountPercent}% on orders above ₹4,000`
                                : `${discountPercent > 0 ? `${discountPercent}% bulk discount` : ''}${discountPercent > 0 && order.coupon_code ? ' + ' : ''}${order.coupon_code ? `Coupon: ${order.coupon_code}` : ''}`
                              }
                            </span>
                            <span className="ml-auto text-sm font-bold text-green-700">
                              -₹{discountAmount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Delivery Address */}
                      {(order.address || order.delivery_address) && (
                        <div className="p-3 bg-gray-50 rounded-lg mb-4">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Delivery Address</p>
                              {(order.address?.receiver_name || order.delivery_address?.receiver_name) && (
                                <p className="text-sm font-semibold text-primary">
                                  {order.address?.receiver_name || order.delivery_address?.receiver_name}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                {order.address?.address_line || order.delivery_address?.address_line}
                              </p>
                              {(order.address?.phone || order.delivery_address?.phone) && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  📞 +91 {order.address?.phone || order.delivery_address?.phone}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* View Details Button */}
                      <Button
                        variant="outline"
                        className="w-full rounded-full"
                        onClick={() => navigate(
                          isSubscription ? `/subscription/${order.id}` : `/order/${order.id}`,
                          isSubscription ? { state: { from: 'orders' } } : {}
                        )}
                      >
                        View Details
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
