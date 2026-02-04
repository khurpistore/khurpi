import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Package, MapPin, Calendar, CreditCard, Clock, Tag, Repeat, ShoppingBag, Truck, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrder();
  }, [user, orderId]);

  const fetchOrder = async () => {
    try {
      const response = await axios.get(`${API}/orders/${orderId}`);
      setOrder(response.data);
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'preparing': return 'bg-purple-100 text-purple-800';
      case 'out_for_delivery': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderTypeBadge = (orderType) => {
    switch (orderType) {
      case 'mixed':
        return <Badge className="bg-purple-100 text-purple-800">Mixed Order</Badge>;
      case 'subscription':
        return <Badge className="bg-blue-100 text-blue-800">Subscription</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">One-time</Badge>;
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <Package className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
        <Button onClick={() => navigate('/orders')} className="rounded-full">
          Back to Orders
        </Button>
      </div>
    );
  }

  const hasOneTimeItems = order.one_time_items?.length > 0 || order.items?.length > 0;
  const hasSubscription = order.subscription;
  const discountAmount = (order.discount_amount || 0) + (order.coupon_discount || 0);
  const address = order.address || order.delivery_address;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/orders')}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-primary">Order Details</h1>
            <p className="text-sm text-muted-foreground">Order #{order.id.slice(0, 8)}</p>
          </div>
        </div>

        {/* Order Status Card */}
        <Card className="mb-6 overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-primary/10 to-primary/5">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <Badge className={getStatusColor(order.status)}>
                    {order.status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </Badge>
                  {getOrderTypeBadge(order.order_type)}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(order.created_at), 'MMMM d, yyyy • hh:mm a')}
                </div>
              </div>
              <div className="text-right">
                {discountAmount > 0 && (
                  <p className="text-sm text-muted-foreground line-through">
                    ₹{order.subtotal?.toLocaleString()}
                  </p>
                )}
                <p className="text-3xl font-bold text-primary">
                  ₹{order.total?.toLocaleString()}
                </p>
                {discountAmount > 0 && (
                  <Badge className="bg-green-100 text-green-800 mt-1">
                    <Tag className="w-3 h-3 mr-1" />
                    Saved ₹{discountAmount.toLocaleString()}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Items */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Subscription Section */}
            {hasSubscription && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Repeat className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-primary">Subscription Items</h3>
                    <Badge variant="outline">{getPlanDisplayName(order.subscription.frequency)}</Badge>
                  </div>

                  {/* Subscription Info */}
                  <div className="p-4 bg-primary/5 rounded-lg mb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase mb-1">Delivery Days</p>
                        <p className="text-sm font-medium">
                          📅 {order.subscription.delivery_days?.join(', ') || 'Not set'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase mb-1">Monthly Total</p>
                        <p className="text-sm font-bold text-primary">
                          ₹{order.subscription.subtotal?.toLocaleString()}/mo
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Subscription Products */}
                  <div className="space-y-3">
                    {order.subscription.items?.map((item, idx) => {
                      const pricePerUnit = item.price || item.product?.price || 0;
                      const quantity = item.quantity || 100;
                      const totalPrice = (quantity / 100) * pricePerUnit;
                      return (
                        <div 
                          key={idx}
                          className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg"
                        >
                          <img 
                            src={item.product?.image} 
                            alt={item.product?.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{item.product?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {quantity}gm × ₹{pricePerUnit}/100gm
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">₹{totalPrice.toFixed(0)}</p>
                            <p className="text-xs text-muted-foreground">per delivery</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Subscription Dates */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <Clock className="w-4 h-4 mx-auto text-green-600 mb-1" />
                      <p className="text-xs text-green-700">Next Delivery</p>
                      <p className="text-sm font-bold text-green-800">
                        {order.subscription.next_delivery_date 
                          ? format(new Date(order.subscription.next_delivery_date), 'MMM d, yyyy')
                          : '-'}
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <Repeat className="w-4 h-4 mx-auto text-blue-600 mb-1" />
                      <p className="text-xs text-blue-700">Billing Cycle</p>
                      <p className="text-sm font-bold text-blue-800">Monthly</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Divider */}
            {hasSubscription && hasOneTimeItems && (
              <div className="flex items-center gap-4">
                <div className="flex-1 border-t border-dashed"></div>
                <span className="text-xs text-muted-foreground">AND</span>
                <div className="flex-1 border-t border-dashed"></div>
              </div>
            )}

            {/* One-time Items Section */}
            {hasOneTimeItems && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">One-time Items</h3>
                  </div>

                  {/* One-time Products */}
                  <div className="space-y-3">
                    {(order.one_time_items || order.items || []).map((item, idx) => {
                      const pricePerUnit = item.price || item.product?.price || 0;
                      const quantity = item.quantity || 100;
                      const totalPrice = (quantity / 100) * pricePerUnit;
                      const isGrowing = item.product?.stock_status === 'growing';
                      return (
                        <div 
                          key={idx}
                          className={`flex items-center gap-4 p-3 rounded-lg ${isGrowing ? 'bg-amber-50' : 'bg-gray-50'}`}
                        >
                          {item.product?.image ? (
                            <img 
                              src={item.product.image} 
                              alt={item.product?.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                              <Package className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{item.product?.name || 'Product'}</p>
                            <p className="text-sm text-muted-foreground">
                              {quantity}gm × ₹{pricePerUnit}/100gm
                            </p>
                          </div>
                          <p className="font-bold text-primary">₹{totalPrice.toFixed(0)}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Delivery Date */}
                  {order.estimated_delivery_date && (
                    <div className="mt-4 bg-green-50 rounded-lg p-3 flex items-center justify-center gap-2">
                      <Truck className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-700">Expected Delivery:</span>
                      <span className="text-sm font-bold text-green-800">
                        {format(new Date(order.estimated_delivery_date), 'MMMM d, yyyy')}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            
            {/* Payment Summary */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Payment Summary</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{order.subtotal?.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="text-green-600 font-medium">FREE</span>
                  </div>

                  {/* Order Discount */}
                  {order.discount_amount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({order.discount_percent}%)</span>
                      <span>-₹{order.discount_amount?.toLocaleString()}</span>
                    </div>
                  )}

                  {/* Coupon Discount */}
                  {order.coupon_discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Coupon ({order.coupon_code})</span>
                      <span>-₹{order.coupon_discount?.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total Paid</span>
                      <span className="text-primary">₹{order.total?.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Savings Banner */}
                  {discountAmount > 0 && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">
                          You saved ₹{discountAmount.toLocaleString()} on this order!
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            {address && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Delivery Address</h3>
                  </div>

                  <div className="space-y-2">
                    {(address.receiver_name || address.name) && (
                      <p className="font-semibold text-primary">{address.receiver_name || address.name}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {address.address_line}
                    </p>
                    {address.city && (
                      <p className="text-sm text-muted-foreground">
                        {address.city}{address.pincode && ` - ${address.pincode}`}
                      </p>
                    )}
                    {address.phone && (
                      <p className="text-sm text-muted-foreground">
                        📞 +91 {address.phone}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Status */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold">Payment Status</h3>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <Badge className={order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
                    </Badge>
                  </div>
                  {order.payment_id && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Payment ID</span>
                      <span className="text-xs font-mono">{order.payment_id.slice(0, 15)}...</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full rounded-full"
                onClick={() => navigate('/orders')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Orders
              </Button>
              <Button 
                className="w-full rounded-full"
                onClick={() => navigate('/products')}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
