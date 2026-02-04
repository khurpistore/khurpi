import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Package, MapPin, Calendar, Clock, Repeat, CheckCircle2, Circle, Truck } from 'lucide-react';
import { format, addDays, isBefore, isAfter, startOfDay, isSameDay } from 'date-fns';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SubscriptionDetail = () => {
  const { subscriptionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [items, setItems] = useState([]);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchSubscription();
  }, [user, subscriptionId]);

  const fetchSubscription = async () => {
    try {
      // Check if subscription data was passed from MySubscriptions (for order-based subscriptions)
      const passedData = location.state?.subscriptionData;
      const source = location.state?.source;
      
      if (source === 'order' && passedData) {
        // Use passed subscription data from order
        setSubscription({
          ...passedData,
          status: passedData.status || 'active'
        });
        setItems(passedData.items || []);
        setAddress(passedData.address);
        setLoading(false);
        return;
      }
      
      // Try to fetch from subscriptions collection first
      try {
        const subRes = await axios.get(`${API}/subscriptions/${subscriptionId}`);
        setSubscription(subRes.data);
        setItems(subRes.data.items || []);
        
        // Fetch address if address_id exists
        if (subRes.data.address_id) {
          const addrRes = await axios.get(`${API}/addresses/${subRes.data.address_id}`);
          setAddress(addrRes.data);
        } else if (subRes.data.address) {
          setAddress(subRes.data.address);
        }
      } catch (subError) {
        // If not found in subscriptions, try to fetch from orders
        const orderRes = await axios.get(`${API}/orders/${subscriptionId}`);
        if (orderRes.data && orderRes.data.subscription) {
          const order = orderRes.data;
          setSubscription({
            id: order.id,
            frequency: order.subscription.frequency,
            delivery_days: order.subscription.delivery_days,
            start_date: order.subscription.start_date,
            next_delivery_date: order.subscription.next_delivery_date,
            subtotal: order.subscription.subtotal,
            total_price: order.subscription.total_price,
            bulk_discount_percent: order.subscription.bulk_discount_percent,
            bulk_discount_amount: order.subscription.bulk_discount_amount,
            status: order.status === 'confirmed' ? 'active' : order.status,
            created_at: order.created_at,
            tray_count: order.subscription.items?.reduce((sum, item) => sum + (item.quantity || 100), 0) || 0
          });
          setItems(order.subscription.items || []);
          setAddress(order.address || order.delivery_address);
        }
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format plan name for display
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Generate delivery dates for the next 4 weeks
  const generateDeliveryDates = () => {
    if (!subscription || !subscription.delivery_days || subscription.delivery_days.length === 0) return [];
    
    const dayMap = {
      'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
      'Thursday': 4, 'Friday': 5, 'Saturday': 6
    };
    
    const deliveryDayNumbers = subscription.delivery_days.map(day => dayMap[day]).filter(d => d !== undefined);
    if (deliveryDayNumbers.length === 0) return [];
    
    const dates = [];
    const today = startOfDay(new Date());
    const startDate = subscription.start_date ? startOfDay(new Date(subscription.start_date)) : today;
    
    // Generate dates for next 8 weeks (to show past and upcoming)
    for (let week = -2; week < 6; week++) {
      for (const dayNum of deliveryDayNumbers) {
        const weekStart = addDays(startDate, week * 7);
        const daysUntilDelivery = (dayNum - weekStart.getDay() + 7) % 7;
        const deliveryDate = addDays(weekStart, daysUntilDelivery);
        
        // Only include dates after subscription start
        if (isAfter(deliveryDate, addDays(startDate, -1)) || isSameDay(deliveryDate, startDate)) {
          let status = 'scheduled';
          if (isBefore(deliveryDate, today)) {
            status = 'delivered';
          } else if (isSameDay(deliveryDate, today)) {
            status = 'out_for_delivery';
          }
          
          // Check if subscription is cancelled/paused
          if (subscription.status === 'cancelled' || subscription.status === 'expired') {
            if (!isBefore(deliveryDate, today)) {
              status = 'cancelled';
            }
          } else if (subscription.status === 'paused') {
            if (!isBefore(deliveryDate, today)) {
              status = 'paused';
            }
          }
          
          dates.push({
            date: deliveryDate,
            status: status
          });
        }
      }
    }
    
    // Sort by date and remove duplicates
    const uniqueDates = dates
      .sort((a, b) => a.date - b.date)
      .filter((item, index, self) => 
        index === self.findIndex(t => isSameDay(t.date, item.date))
      );
    
    return uniqueDates.slice(0, 12); // Return max 12 dates
  };

  const getDeliveryStatusBadge = (status) => {
    const statusConfig = {
      delivered: { color: 'bg-green-100 text-green-800', label: 'Delivered', icon: CheckCircle2 },
      out_for_delivery: { color: 'bg-orange-100 text-orange-800', label: 'Out for Delivery', icon: Truck },
      scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Scheduled', icon: Circle },
      paused: { color: 'bg-yellow-100 text-yellow-800', label: 'Paused', icon: Circle },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled', icon: Circle }
    };
    const config = statusConfig[status] || statusConfig.scheduled;
    const Icon = config.icon;
    return (
      <div className="flex items-center gap-1.5">
        <Icon className={`w-3.5 h-3.5 ${status === 'delivered' ? 'text-green-600' : status === 'out_for_delivery' ? 'text-orange-600' : 'text-gray-400'}`} />
        <Badge className={`${config.color} text-xs`}>{config.label}</Badge>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <Package className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Subscription Not Found</h2>
        <Button onClick={() => navigate('/subscriptions')} className="rounded-full">
          Back to Subscriptions
        </Button>
      </div>
    );
  }

  // Calculate values
  const deliveriesPerWeek = subscription.delivery_days?.length || 1;
  const totalDeliveriesPerMonth = deliveriesPerWeek * 4;
  const deliveryDates = generateDeliveryDates();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/subscriptions')}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-primary">Subscription Details</h1>
            <p className="text-sm text-muted-foreground">#{subscription.id?.slice(0, 8)}</p>
          </div>
        </div>

        {/* Subscription Status Card */}
        <Card className="mb-6 overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-primary/10 to-primary/5">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <Repeat className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold text-primary">
                    {getPlanDisplayName(subscription.frequency)}
                  </h2>
                  <Badge className={getStatusColor(subscription.status)}>
                    {subscription.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {subscription.tray_count || items.reduce((sum, i) => sum + (i.quantity || 100), 0)}gm • {totalDeliveriesPerMonth} deliveries/month
                </p>
                <p className="text-sm text-muted-foreground">
                  📅 {subscription.delivery_days?.join(', ') || 'Not set'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Products */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Products ({items.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {items.map((item, idx) => {
                    const qty = item.quantity || 100;
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
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
                          <h4 className="font-medium">{item.product?.name || 'Product'}</h4>
                          <p className="text-sm text-muted-foreground">
                            {qty}gm
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Schedule */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Delivery Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <Clock className="w-6 h-6 mx-auto text-green-600 mb-2" />
                    <p className="text-sm text-green-700">Next Delivery</p>
                    <p className="text-lg font-bold text-green-800">
                      {subscription.next_delivery_date 
                        ? format(new Date(subscription.next_delivery_date), 'MMM d, yyyy')
                        : '-'}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <Repeat className="w-6 h-6 mx-auto text-blue-600 mb-2" />
                    <p className="text-sm text-blue-700">Billing Cycle</p>
                    <p className="text-lg font-bold text-blue-800">Monthly</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Delivery Days:</span> {subscription.delivery_days?.join(', ') || 'Not set'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="font-medium">Started:</span> {subscription.start_date ? format(new Date(subscription.start_date), 'MMMM d, yyyy') : '-'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* All Delivery Dates */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Delivery History & Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {deliveryDates.length > 0 ? (
                    deliveryDates.map((delivery, idx) => (
                      <div 
                        key={idx} 
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          delivery.status === 'out_for_delivery' 
                            ? 'bg-orange-50 border border-orange-200' 
                            : delivery.status === 'delivered' 
                              ? 'bg-gray-50' 
                              : 'bg-blue-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-center min-w-[50px]">
                            <p className="text-lg font-bold text-primary">{format(delivery.date, 'd')}</p>
                            <p className="text-xs text-muted-foreground">{format(delivery.date, 'MMM')}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{format(delivery.date, 'EEEE')}</p>
                            <p className="text-xs text-muted-foreground">{format(delivery.date, 'yyyy')}</p>
                          </div>
                        </div>
                        {getDeliveryStatusBadge(delivery.status)}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No delivery dates scheduled</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">

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

            {/* Actions */}
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full rounded-full"
                onClick={() => navigate('/subscriptions')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Subscriptions
              </Button>
              <Button 
                className="w-full rounded-full"
                onClick={() => navigate('/products')}
              >
                Add More Products
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDetail;
