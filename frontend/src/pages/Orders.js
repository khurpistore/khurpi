import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { Package, ChevronRight, ShoppingBag, Repeat, Tag, Calendar } from 'lucide-react';
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
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/orders?user_id=${user.id}`);
      setOrders(response.data);
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
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderTypeLabel = (orderType) => {
    switch (orderType) {
      case 'mixed': return { label: 'Mixed', color: 'bg-purple-100 text-purple-800' };
      case 'subscription': return { label: 'Subscription', color: 'bg-blue-100 text-blue-800' };
      default: return { label: 'One-time', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const getPlanDisplayName = (frequency) => {
    const planNames = {
      'once_week': 'Fresh Start',
      'twice_week': 'Balanced',
      'four_days_week': 'Power Greens',
      'daily': 'Daily'
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-primary flex items-center gap-2">
            <ShoppingBag className="w-6 h-6" />
            My Orders
          </h1>
          <Button size="sm" onClick={() => navigate('/products')} className="rounded-full">
            Shop Now
          </Button>
        </div>

        {orders.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
              <p className="text-sm text-muted-foreground mb-3">Start shopping to see your orders here</p>
              <Button size="sm" onClick={() => navigate('/products')} className="rounded-full">
                Browse Products
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const hasOneTimeItems = order.one_time_items?.length > 0 || order.items?.length > 0;
              const hasSubscription = order.subscription;
              const discountAmount = (order.discount_amount || 0) + (order.coupon_discount || 0);
              const orderTypeInfo = getOrderTypeLabel(order.order_type);
              
              // Get all product images
              const allItems = [
                ...(order.subscription?.items || []),
                ...(order.one_time_items || order.items || [])
              ];
              
              return (
                <Card 
                  key={order.id}
                  data-testid={`order-${order.id}`}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/order/${order.id}`)}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-3">
                      {/* Product Images Stack */}
                      <div className="flex -space-x-2 flex-shrink-0">
                        {allItems.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="relative">
                            {item.product?.image ? (
                              <img 
                                src={item.product.image} 
                                alt=""
                                className="w-12 h-12 rounded-lg object-cover border-2 border-white shadow-sm"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-100 border-2 border-white flex items-center justify-center">
                                <Package className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                        ))}
                        {allItems.length > 3 && (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                            +{allItems.length - 3}
                          </div>
                        )}
                      </div>

                      {/* Order Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <Badge className={`${getStatusColor(order.status)} text-xs px-1.5 py-0`}>
                            {order.status}
                          </Badge>
                          <Badge className={`${orderTypeInfo.color} text-xs px-1.5 py-0`}>
                            {orderTypeInfo.label}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <Calendar className="w-3 h-3" />
                          <span>{format(new Date(order.created_at), 'MMM d, yyyy')}</span>
                          <span>•</span>
                          <span>#{order.id.slice(0, 6)}</span>
                        </div>

                        {/* Items summary */}
                        <div className="text-xs text-muted-foreground">
                          {hasSubscription && (
                            <span className="flex items-center gap-1">
                              <Repeat className="w-3 h-3 text-primary" />
                              {getPlanDisplayName(order.subscription.frequency)} • ₹{order.subscription.subtotal?.toLocaleString()}/mo
                            </span>
                          )}
                          {hasOneTimeItems && !hasSubscription && (
                            <span>{(order.one_time_items || order.items)?.length} item(s)</span>
                          )}
                          {hasOneTimeItems && hasSubscription && (
                            <span className="ml-1">+ {(order.one_time_items || order.items)?.length} one-time</span>
                          )}
                        </div>
                      </div>

                      {/* Price & Arrow */}
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-2">
                          <div>
                            {discountAmount > 0 && (
                              <p className="text-xs text-muted-foreground line-through">
                                ₹{order.subtotal?.toLocaleString()}
                              </p>
                            )}
                            <p className="text-lg font-bold text-primary">
                              ₹{order.total?.toLocaleString()}
                            </p>
                            {discountAmount > 0 && (
                              <div className="flex items-center gap-0.5 text-green-600">
                                <Tag className="w-3 h-3" />
                                <span className="text-xs font-medium">-₹{discountAmount.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </div>
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
