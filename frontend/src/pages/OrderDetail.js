import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Package, MapPin, Calendar, CreditCard, Phone, Loader2, Sprout, Clock } from 'lucide-react';
import { format, addDays } from 'date-fns';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Calculate delivery date for a product
const getProductDeliveryDate = (product) => {
  const isGrowing = product?.stock_status === 'growing';
  
  if (isGrowing) {
    let deliveryDate;
    if (product.availability_date) {
      deliveryDate = addDays(new Date(product.availability_date), 1);
    } else {
      const readyDays = product.ready_in_days || product.growth_days || 7;
      deliveryDate = addDays(new Date(), readyDays + 1);
    }
    // Skip Sunday
    if (deliveryDate.getDay() === 0) {
      deliveryDate = addDays(deliveryDate, 1);
    }
    return { date: deliveryDate, isGrowing: true };
  } else {
    // In stock: next day, skip Sunday
    let deliveryDate = addDays(new Date(), 1);
    if (deliveryDate.getDay() === 0) {
      deliveryDate = addDays(deliveryDate, 1);
    }
    return { date: deliveryDate, isGrowing: false };
  }
};

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
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-purple-100 text-purple-800';
      case 'out_for_delivery': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
        <p className="text-muted-foreground mb-6">The order you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/orders')}>Back to Orders</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
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
          <h1 className="text-2xl font-bold text-primary">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
          <p className="text-sm text-muted-foreground">
            Placed on {format(new Date(order.created_at), 'PPP')}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Order Status</p>
                    <Badge className={`${getStatusColor(order.status)} mt-1`}>
                      {order.status.replace(/_/g, ' ').charAt(0).toUpperCase() + order.status.replace(/_/g, ' ').slice(1)}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Payment</p>
                  <Badge className={order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Date & Delivery Date */}
          <Card>
            <CardContent className="p-6">
              {(() => {
                // Calculate the latest delivery date from all items
                let latestDeliveryDate = addDays(new Date(), 1);
                if (latestDeliveryDate.getDay() === 0) latestDeliveryDate = addDays(latestDeliveryDate, 1);
                
                order.items?.forEach(item => {
                  const deliveryInfo = getProductDeliveryDate(item.product);
                  if (deliveryInfo.date > latestDeliveryDate) {
                    latestDeliveryDate = deliveryInfo.date;
                  }
                });
                
                return (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <Calendar className="w-5 h-5 mx-auto text-muted-foreground mb-2" />
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Order Date</p>
                      <p className="font-semibold text-primary">{format(new Date(order.created_at), 'MMM d, yyyy')}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(order.created_at), 'hh:mm a')}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <Clock className="w-5 h-5 mx-auto text-green-600 mb-2" />
                      <p className="text-xs text-green-700 uppercase tracking-wide">Delivery Date</p>
                      <p className="font-semibold text-green-800">
                        {format(latestDeliveryDate, 'MMM d, yyyy')}
                      </p>
                      <p className="text-xs text-green-600">Expected</p>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Items</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-4">
                {order.items?.map((item, idx) => {
                  const weight = item.quantity || 100;
                  const pricePerHundredGm = item.product?.price || 0;
                  const calculatedTotal = (weight / 100) * pricePerHundredGm;
                  const isGrowing = item.product?.stock_status === 'growing';
                  
                  return (
                    <div key={idx} className={`flex items-center gap-4 p-3 rounded-lg ${isGrowing ? 'bg-amber-50' : 'bg-gray-50'}`}>
                      {item.product?.image ? (
                        <img 
                          src={item.product.image} 
                          alt={item.product?.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{item.product?.name || 'Product'}</p>
                        <p className="text-sm text-muted-foreground">
                          {weight}gm × ₹{pricePerHundredGm.toFixed(0)}/100gm
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">₹{calculatedTotal.toFixed(0)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          {order.address && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">{order.address.name || 'Address'}</p>
                  <p className="text-muted-foreground">{order.address.address_line}</p>
                  {order.address.city && (
                    <p className="text-muted-foreground">{order.address.city} - {order.address.pincode}</p>
                  )}
                  {order.address.phone && (
                    <p className="text-sm mt-2 flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      +91 {order.address.phone}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{order.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
                {order.coupon_discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Coupon ({order.coupon_code})</span>
                    <span>-₹{order.coupon_discount?.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">₹{order.total?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {order.payment_id && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Payment ID</p>
                  <p className="text-sm font-mono">{order.payment_id}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
