import React, { useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Search, User, Phone, Mail, Calendar, MapPin, ShoppingBag, 
  Repeat, Gift, Package, ChevronRight, Loader2, Tag, Home, Building2,
  Copy, CreditCard, ArrowLeft, Clock, Truck, CheckCircle, CheckCircle2, Circle, X,
  ShoppingCart, Receipt, AlertCircle, Info
} from 'lucide-react';
import { format, addDays, isBefore, isAfter, startOfDay, isSameDay } from 'date-fns';
import AdminLayout from '@/components/AdminLayout';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Plan display names (same as customer pages)
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

const AdminCustomerView = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [referralData, setReferralData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');
  
  // Detail view state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [subscriptionDeliveries, setSubscriptionDeliveries] = useState([]);

  const searchCustomer = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      const usersRes = await axios.get(`${API}/admin/users`);
      const foundCustomer = usersRes.data.find(u => u.phone === phoneNumber);
      
      if (!foundCustomer) {
        toast.error('Customer not found');
        setCustomer(null);
        setOrders([]);
        setSubscriptions([]);
        setAddresses([]);
        setReferralData(null);
        setLoading(false);
        return;
      }

      setCustomer(foundCustomer);
      toast.success(`Found customer: ${foundCustomer.name}`);

      // Fetch customer's orders
      const ordersRes = await axios.get(`${API}/admin/orders`);
      const customerOrders = ordersRes.data.filter(o => o.user_id === foundCustomer.id);
      setOrders(customerOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));

      // Fetch customer's subscriptions
      const subsRes = await axios.get(`${API}/admin/subscriptions`);
      const customerSubs = subsRes.data.filter(s => s.user_id === foundCustomer.id);
      setSubscriptions(customerSubs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));

      // Fetch customer's addresses
      const addressesRes = await axios.get(`${API}/users/${foundCustomer.id}/addresses`);
      setAddresses(addressesRes.data || []);

      // Fetch referral data
      try {
        const referralRes = await axios.get(`${API}/referral/${foundCustomer.id}`);
        setReferralData(referralRes.data);
      } catch (e) {
        setReferralData(null);
      }

    } catch (error) {
      console.error('Error searching customer:', error);
      toast.error('Failed to search customer');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'delivered': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      case 'out_for_delivery': return 'bg-orange-100 text-orange-800';
      case 'preparing': return 'bg-purple-100 text-purple-800';
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

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return format(new Date(dateStr), 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  // Fetch deliveries for a subscription
  const fetchSubscriptionDeliveries = async (subId) => {
    try {
      const response = await axios.get(`${API}/subscriptions/${subId}/deliveries`);
      setSubscriptionDeliveries(response.data);
    } catch (error) {
      console.error('Failed to fetch deliveries:', error);
      setSubscriptionDeliveries([]);
    }
  };

  // Open subscription detail
  const openSubscriptionDetail = async (sub) => {
    setSelectedSubscription(sub);
    await fetchSubscriptionDeliveries(sub.id);
  };

  // Generate delivery dates for subscription
  const generateDeliveryDates = (subscription) => {
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
    
    for (let week = -2; week < 6; week++) {
      for (const dayNum of deliveryDayNumbers) {
        const weekStart = addDays(startDate, week * 7);
        const daysUntilDelivery = (dayNum - weekStart.getDay() + 7) % 7;
        const deliveryDate = addDays(weekStart, daysUntilDelivery);
        
        if (isAfter(deliveryDate, addDays(startDate, -1)) || isSameDay(deliveryDate, startDate)) {
          let status = 'scheduled';
          if (isBefore(deliveryDate, today)) {
            status = 'delivered';
          } else if (isSameDay(deliveryDate, today)) {
            status = 'out_for_delivery';
          }
          
          dates.push({ date: deliveryDate, status });
        }
      }
    }
    
    const uniqueDates = dates
      .sort((a, b) => a.date - b.date)
      .filter((item, index, self) => 
        index === self.findIndex(t => isSameDay(t.date, item.date))
      );
    
    const deliveriesPerMonth = deliveryDayNumbers.length * 4;
    return uniqueDates.slice(0, deliveriesPerMonth);
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

  return (
    <AdminLayout active="customer-view" title="View as Customer">
      {/* Search Section */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Enter customer phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="pl-10"
                onKeyDown={(e) => e.key === 'Enter' && searchCustomer()}
                data-testid="customer-phone-input"
              />
            </div>
            <Button onClick={searchCustomer} disabled={loading} className="gap-2" data-testid="search-customer-btn">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customer Profile Card */}
      {customer && (
        <Card className="mb-6 border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-primary">{customer.name}</h2>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" /> {customer.phone}
                  </span>
                  {customer.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" /> {customer.email}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> Joined {formatDate(customer.created_at)}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-sm">
                  {orders.length} Orders
                </Badge>
                <Badge variant="outline" className="text-sm">
                  {subscriptions.length} Subscriptions
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for different sections */}
      {customer && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingBag className="w-4 h-4 hidden sm:block" />
              Orders ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="gap-2">
              <Repeat className="w-4 h-4 hidden sm:block" />
              Subscriptions ({subscriptions.length})
            </TabsTrigger>
            <TabsTrigger value="addresses" className="gap-2">
              <MapPin className="w-4 h-4 hidden sm:block" />
              Addresses ({addresses.length})
            </TabsTrigger>
            <TabsTrigger value="referrals" className="gap-2">
              <Gift className="w-4 h-4 hidden sm:block" />
              Refer & Earn
            </TabsTrigger>
          </TabsList>

          {/* ==================== ORDERS TAB ==================== */}
          <TabsContent value="orders">
            <div className="bg-gradient-to-b from-green-50 to-white rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag className="w-6 h-6 text-primary" />
                <h2 className="text-xl sm:text-2xl font-bold text-primary">My Orders</h2>
                <Badge variant="outline" className="ml-2">{orders.length} orders</Badge>
              </div>

              {orders.length === 0 ? (
                <Card className="text-center py-8">
                  <CardContent>
                    <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
                    <p className="text-sm text-muted-foreground">This customer hasn't placed any orders</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => {
                    const hasOneTimeItems = order.one_time_items?.length > 0 || order.items?.length > 0;
                    const hasSubscription = order.subscription;
                    const discountAmount = (order.discount_amount || 0) + (order.coupon_discount || 0);
                    const orderTypeInfo = getOrderTypeLabel(order.order_type);
                    
                    const allItems = [
                      ...(order.subscription?.items || []),
                      ...(order.one_time_items || order.items || [])
                    ];
                    
                    return (
                      <Card 
                        key={order.id}
                        data-testid={`order-${order.id}`}
                        className="hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setSelectedOrder(order)}
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
                                <Badge className={`${getStatusColor(order.status)} text-xs px-1.5 py-0 capitalize`}>
                                  {order.status?.replace(/_/g, ' ')}
                                </Badge>
                                <Badge className={`${orderTypeInfo.color} text-xs px-1.5 py-0`}>
                                  {orderTypeInfo.label}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDate(order.created_at)}</span>
                                <span>•</span>
                                <span>#{order.id.slice(0, 6)}</span>
                              </div>

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

                            {/* Price */}
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
          </TabsContent>

          {/* ==================== SUBSCRIPTIONS TAB ==================== */}
          <TabsContent value="subscriptions">
            <div className="bg-gradient-to-b from-green-50 to-white rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Repeat className="w-6 h-6 text-primary" />
                <h2 className="text-xl sm:text-2xl font-bold text-primary">My Subscriptions</h2>
                <Badge variant="outline" className="ml-2">{subscriptions.length} subscriptions</Badge>
              </div>

              {subscriptions.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-primary mb-2">No subscriptions yet</h3>
                    <p className="text-muted-foreground">This customer hasn't created any subscriptions</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3" data-testid="subscriptions-list">
                  {subscriptions.map((subscription) => {
                    const productImages = subscription.items?.slice(0, 3).map(item => item.product?.image).filter(Boolean) || [];
                    const productNames = subscription.items?.map(item => item.product?.name).filter(Boolean) || [];
                    
                    return (
                      <Card 
                        key={subscription.id} 
                        data-testid={`subscription-card-${subscription.id}`} 
                        className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => openSubscriptionDetail(subscription)}
                      >
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex items-center gap-3">
                            {/* Product Images Stack */}
                            <div className="flex -space-x-2 flex-shrink-0">
                              {productImages.length > 0 ? (
                                productImages.map((img, idx) => (
                                  <img 
                                    key={idx}
                                    src={img} 
                                    alt="Product" 
                                    className="w-10 h-10 rounded-lg object-cover border-2 border-white shadow-sm" 
                                  />
                                ))
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                  <Package className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                              {subscription.items?.length > 3 && (
                                <div className="w-10 h-10 rounded-lg bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                                  +{subscription.items.length - 3}
                                </div>
                              )}
                            </div>

                            {/* Main Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <h3 className="text-sm font-semibold text-primary truncate">
                                  {getPlanDisplayName(subscription.frequency)}
                                </h3>
                                <Badge className={`${getStatusColor(subscription.status)} capitalize`}>
                                  {subscription.status?.replace(/_/g, ' ')}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {productNames.join(', ') || 'No products'} • {subscription.tray_count}gm
                              </p>
                              <p className="text-xs text-muted-foreground">
                                📅 {subscription.delivery_days?.join(', ') || 'Not set'}
                              </p>
                            </div>

                            {/* Next Delivery */}
                            <div className="flex items-center gap-3 flex-shrink-0">
                              {subscription.status !== 'expired' && subscription.status !== 'cancelled' && (
                                <div className="text-right hidden sm:block">
                                  <p className="text-xs text-muted-foreground">Next Delivery</p>
                                  <p className="text-sm font-semibold text-green-700">
                                    {subscription.next_delivery_date 
                                      ? format(new Date(subscription.next_delivery_date), 'MMM d')
                                      : '-'}
                                  </p>
                                </div>
                              )}
                              <ChevronRight className="w-5 h-5 text-muted-foreground" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ==================== ADDRESSES TAB ==================== */}
          <TabsContent value="addresses">
            <div className="bg-gradient-to-b from-green-50 to-white rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-6 h-6 text-primary" />
                <h2 className="text-xl sm:text-2xl font-bold text-primary">My Addresses</h2>
                <Badge variant="outline" className="ml-2">{addresses.length} addresses</Badge>
              </div>

              {addresses.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <MapPin className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Addresses Yet</h3>
                    <p className="text-muted-foreground">This customer hasn't added any addresses</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[...addresses]
                    .sort((a, b) => {
                      if (a.is_default && !b.is_default) return -1;
                      if (!a.is_default && b.is_default) return 1;
                      return 0;
                    })
                    .map((address) => {
                      const AddressTypeIcon = address.address_type === 'office' ? Building2 : address.address_type === 'other' ? MapPin : Home;
                      const addressTypeLabel = address.address_type === 'office' ? 'Office' : address.address_type === 'other' ? 'Other' : 'Home';
                      
                      return (
                        <Card 
                          key={address.id} 
                          data-testid={`address-card-${address.id}`}
                          className={`transition-all ${address.is_default ? 'border-primary border-2 bg-primary/5' : ''}`}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                {/* Address Type & Default Badge */}
                                <div className="flex items-center gap-2 mb-2">
                                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                    address.is_default ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    <AddressTypeIcon className="w-4 h-4" />
                                  </div>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-medium text-muted-foreground uppercase">{addressTypeLabel}</span>
                                    {address.is_default && (
                                      <Badge className="bg-primary text-white text-xs px-1.5 py-0">
                                        Default
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Receiver Name */}
                                <p className="font-semibold text-sm mb-0.5">{address.name || 'Receiver'}</p>
                                
                                {/* Phone */}
                                {address.phone && (
                                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                                    <Phone className="w-3 h-3" />
                                    +91 {address.phone}
                                  </p>
                                )}
                                
                                {/* Address */}
                                <p className="text-xs text-gray-600 line-clamp-2">{address.address_line}</p>
                                
                                {/* Landmark if available */}
                                {address.landmark && (
                                  <p className="text-xs text-muted-foreground mt-0.5 italic">
                                    Near: {address.landmark}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ==================== REFER & EARN TAB ==================== */}
          <TabsContent value="referrals">
            <div className="bg-gradient-to-b from-green-50 to-white rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Gift className="w-6 h-6 text-primary" />
                <h2 className="text-xl sm:text-2xl font-bold text-primary">Refer & Earn</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Referral Code Card */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Gift className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold">Referral Code</h3>
                    </div>
                    {referralData?.referral_code ? (
                      <div className="bg-primary/5 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold font-mono tracking-wider text-primary">
                            {referralData.referral_code}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(referralData.referral_code)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Customer's referral code
                        </p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No referral code generated yet</p>
                    )}
                  </CardContent>
                </Card>

                {/* Stats Card */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CreditCard className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold">Referral Stats</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {referralData?.successful_referrals || 0}
                        </p>
                        <p className="text-sm text-muted-foreground">Successful Referrals</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          ₹{referralData?.total_earnings || 0}
                        </p>
                        <p className="text-sm text-muted-foreground">Total Earnings</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Empty State */}
      {!customer && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              Search for a Customer
            </h3>
            <p className="text-sm text-muted-foreground">
              Enter a customer's phone number to view their account details, orders, subscriptions, and more.
            </p>
          </CardContent>
        </Card>
      )}

      {/* ==================== ORDER DETAIL DIALOG ==================== */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                  Order Details - #{selectedOrder.id.slice(0, 8)}
                </DialogTitle>
              </DialogHeader>

              <div className="bg-gradient-to-b from-green-50 to-white rounded-xl">
                {/* Order Status Card */}
                <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <Badge className={getStatusColor(selectedOrder.status)}>
                          {selectedOrder.status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </Badge>
                        <Badge className={getOrderTypeLabel(selectedOrder.order_type).color}>
                          {getOrderTypeLabel(selectedOrder.order_type).label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(selectedOrder.created_at), 'MMMM d, yyyy • hh:mm a')}
                      </div>
                    </div>
                    <div className="text-right">
                      {((selectedOrder.discount_amount || 0) + (selectedOrder.coupon_discount || 0)) > 0 && (
                        <p className="text-sm text-muted-foreground line-through">
                          ₹{selectedOrder.subtotal?.toLocaleString()}
                        </p>
                      )}
                      <p className="text-3xl font-bold text-primary">
                        ₹{selectedOrder.total?.toLocaleString()}
                      </p>
                      {((selectedOrder.discount_amount || 0) + (selectedOrder.coupon_discount || 0)) > 0 && (
                        <Badge className="bg-green-100 text-green-800 mt-1">
                          <Tag className="w-3 h-3 mr-1" />
                          Saved ₹{((selectedOrder.discount_amount || 0) + (selectedOrder.coupon_discount || 0)).toLocaleString()}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Left Column - Items */}
                  <div className="lg:col-span-2 space-y-4">
                    {/* Subscription Items */}
                    {selectedOrder.subscription && (
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Repeat className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold text-primary">Subscription Items</h3>
                            <Badge variant="outline">{getPlanDisplayName(selectedOrder.subscription.frequency)}</Badge>
                          </div>

                          <div className="p-3 bg-primary/5 rounded-lg mb-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-xs text-muted-foreground uppercase mb-1">Delivery Days</p>
                                <p className="text-sm font-medium">
                                  📅 {selectedOrder.subscription.delivery_days?.join(', ') || 'Not set'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground uppercase mb-1">Monthly Total</p>
                                <p className="text-sm font-bold text-primary">
                                  ₹{selectedOrder.subscription.subtotal?.toLocaleString()}/mo
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {selectedOrder.subscription.items?.map((item, idx) => {
                              const pricePerUnit = item.price || item.product?.price || 0;
                              const quantity = item.quantity || 100;
                              const totalPrice = (quantity / 100) * pricePerUnit;
                              return (
                                <div key={idx} className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                                  <img 
                                    src={item.product?.image} 
                                    alt={item.product?.name}
                                    className="w-12 h-12 rounded-lg object-cover"
                                  />
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{item.product?.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {quantity}gm × ₹{pricePerUnit}/100gm
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold text-primary text-sm">₹{totalPrice.toFixed(0)}</p>
                                    <p className="text-xs text-muted-foreground">per delivery</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* One-time Items */}
                    {(selectedOrder.one_time_items?.length > 0 || selectedOrder.items?.length > 0) && (
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                            <h3 className="font-semibold">One-time Items</h3>
                          </div>

                          <div className="space-y-2">
                            {(selectedOrder.one_time_items || selectedOrder.items || []).map((item, idx) => {
                              const pricePerUnit = item.price || item.product?.price || 0;
                              const quantity = item.quantity || 100;
                              const totalPrice = (quantity / 100) * pricePerUnit;
                              return (
                                <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
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
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{item.product?.name || 'Product'}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {quantity}gm × ₹{pricePerUnit}/100gm
                                    </p>
                                  </div>
                                  <p className="font-bold text-primary text-sm">₹{totalPrice.toFixed(0)}</p>
                                </div>
                              );
                            })}
                          </div>

                          {selectedOrder.estimated_delivery_date && (
                            <div className="mt-3 bg-green-50 rounded-lg p-2 flex items-center justify-center gap-2">
                              <Truck className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-green-700">Expected:</span>
                              <span className="text-sm font-bold text-green-800">
                                {format(new Date(selectedOrder.estimated_delivery_date), 'MMMM d, yyyy')}
                              </span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Right Column - Summary */}
                  <div className="space-y-4">
                    {/* Payment Summary */}
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <CreditCard className="w-5 h-5 text-primary" />
                          <h3 className="font-semibold">Payment Summary</h3>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>₹{selectedOrder.subtotal?.toLocaleString()}</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Delivery</span>
                            <span className="text-green-600 font-medium">FREE</span>
                          </div>

                          {selectedOrder.discount_amount > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Discount ({selectedOrder.discount_percent}%)</span>
                              <span>-₹{selectedOrder.discount_amount?.toLocaleString()}</span>
                            </div>
                          )}

                          {selectedOrder.coupon_discount > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Coupon ({selectedOrder.coupon_code})</span>
                              <span>-₹{selectedOrder.coupon_discount?.toLocaleString()}</span>
                            </div>
                          )}

                          <div className="border-t pt-2 mt-2">
                            <div className="flex justify-between font-bold">
                              <span>Total Paid</span>
                              <span className="text-primary">₹{selectedOrder.total?.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Delivery Address */}
                    {(selectedOrder.address || selectedOrder.delivery_address) && (
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <MapPin className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold">Delivery Address</h3>
                          </div>

                          <div className="space-y-1 text-sm">
                            {((selectedOrder.address || selectedOrder.delivery_address)?.receiver_name || (selectedOrder.address || selectedOrder.delivery_address)?.name) && (
                              <p className="font-semibold text-primary">
                                {(selectedOrder.address || selectedOrder.delivery_address)?.receiver_name || (selectedOrder.address || selectedOrder.delivery_address)?.name}
                              </p>
                            )}
                            <p className="text-muted-foreground">
                              {(selectedOrder.address || selectedOrder.delivery_address)?.address_line}
                            </p>
                            {(selectedOrder.address || selectedOrder.delivery_address)?.phone && (
                              <p className="text-muted-foreground">
                                📞 +91 {(selectedOrder.address || selectedOrder.delivery_address)?.phone}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Payment Status */}
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <h3 className="font-semibold">Payment Status</h3>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Status</span>
                          <Badge className={selectedOrder.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {selectedOrder.payment_status === 'paid' ? 'Paid' : 'Pending'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ==================== SUBSCRIPTION DETAIL DIALOG ==================== */}
      <Dialog open={!!selectedSubscription} onOpenChange={() => { setSelectedSubscription(null); setSubscriptionDeliveries([]); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedSubscription && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Repeat className="w-5 h-5 text-primary" />
                  Subscription Details - #{selectedSubscription.id?.slice(0, 8)}
                </DialogTitle>
              </DialogHeader>

              <div className="bg-gradient-to-b from-green-50 to-white rounded-xl">
                {/* Subscription Status Card */}
                <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <Repeat className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-bold text-primary">
                          {getPlanDisplayName(selectedSubscription.frequency)}
                        </h2>
                        <Badge className={getStatusColor(selectedSubscription.status)}>
                          {selectedSubscription.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {selectedSubscription.tray_count || selectedSubscription.items?.reduce((sum, i) => sum + (i.quantity || 100), 0)}gm • {(selectedSubscription.delivery_days?.length || 1) * 4} deliveries/month
                      </p>
                      <p className="text-sm text-muted-foreground">
                        📅 {selectedSubscription.delivery_days?.join(', ') || 'Not set'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Left Column */}
                  <div className="lg:col-span-2 space-y-4">
                    {/* Products */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Package className="w-5 h-5" />
                          Products ({selectedSubscription.items?.length || 0})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {selectedSubscription.items?.map((item, idx) => {
                            const qty = item.quantity || 100;
                            return (
                              <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
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
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm">{item.product?.name || 'Product'}</h4>
                                  <p className="text-xs text-muted-foreground">{qty}gm</p>
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
                        <CardTitle className="text-base flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          Delivery Schedule
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-green-50 rounded-lg p-3 text-center">
                            <Clock className="w-5 h-5 mx-auto text-green-600 mb-1" />
                            <p className="text-xs text-green-700">Next Delivery</p>
                            <p className="text-sm font-bold text-green-800">
                              {selectedSubscription.next_delivery_date 
                                ? format(new Date(selectedSubscription.next_delivery_date), 'MMM d, yyyy')
                                : '-'}
                            </p>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-3 text-center">
                            <Repeat className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                            <p className="text-xs text-blue-700">Billing Cycle</p>
                            <p className="text-sm font-bold text-blue-800">Monthly</p>
                          </div>
                        </div>
                        <div className="mt-3 p-2 bg-gray-50 rounded-lg text-xs">
                          <p className="text-muted-foreground">
                            <span className="font-medium">Delivery Days:</span> {selectedSubscription.delivery_days?.join(', ') || 'Not set'}
                          </p>
                          <p className="text-muted-foreground mt-1">
                            <span className="font-medium">Started:</span> {selectedSubscription.start_date ? format(new Date(selectedSubscription.start_date), 'MMMM d, yyyy') : '-'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Delivery History */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                          <Truck className="w-5 h-5" />
                          <span>Delivery History & Schedule</span>
                          <Badge className="bg-blue-100 text-blue-800 text-xs">
                            {subscriptionDeliveries.length > 0 ? subscriptionDeliveries.length : (selectedSubscription.delivery_days?.length || 1) * 4} this month
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {subscriptionDeliveries.length > 0 ? (
                            subscriptionDeliveries.map((delivery, idx) => {
                              const deliveryDate = new Date(delivery.delivery_date);
                              return (
                                <div 
                                  key={idx} 
                                  className={`flex items-center justify-between p-2 rounded-lg ${
                                    delivery.status === 'out_for_delivery' 
                                      ? 'bg-orange-50 border border-orange-200' 
                                      : delivery.status === 'delivered' 
                                        ? 'bg-gray-50' 
                                        : 'bg-blue-50/50'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="text-center min-w-[40px]">
                                      <p className="text-base font-bold text-primary">{format(deliveryDate, 'd')}</p>
                                      <p className="text-xs text-muted-foreground">{format(deliveryDate, 'MMM')}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">{format(deliveryDate, 'EEEE')}</p>
                                      <div className="flex items-center gap-2">
                                        <p className="text-xs text-muted-foreground">{format(deliveryDate, 'yyyy')}</p>
                                        {delivery.delivery_time && (
                                          <span className="text-xs bg-primary/10 text-primary px-1 py-0.5 rounded flex items-center gap-0.5">
                                            <Clock className="w-3 h-3" />
                                            {delivery.delivery_time}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  {getDeliveryStatusBadge(delivery.status)}
                                </div>
                              );
                            })
                          ) : (
                            generateDeliveryDates(selectedSubscription).map((delivery, idx) => (
                              <div 
                                key={idx} 
                                className={`flex items-center justify-between p-2 rounded-lg ${
                                  delivery.status === 'out_for_delivery' 
                                    ? 'bg-orange-50 border border-orange-200' 
                                    : delivery.status === 'delivered' 
                                      ? 'bg-gray-50' 
                                      : 'bg-blue-50/50'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <div className="text-center min-w-[40px]">
                                    <p className="text-base font-bold text-primary">{format(delivery.date, 'd')}</p>
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
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Delivery Address */}
                    {selectedSubscription.address && (
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <MapPin className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold">Delivery Address</h3>
                          </div>

                          <div className="space-y-1 text-sm">
                            {(selectedSubscription.address?.receiver_name || selectedSubscription.address?.name) && (
                              <p className="font-semibold text-primary">
                                {selectedSubscription.address?.receiver_name || selectedSubscription.address?.name}
                              </p>
                            )}
                            <p className="text-muted-foreground">
                              {selectedSubscription.address?.address_line}
                            </p>
                            {selectedSubscription.address?.city && (
                              <p className="text-muted-foreground">
                                {selectedSubscription.address?.city}{selectedSubscription.address?.pincode && ` - ${selectedSubscription.address?.pincode}`}
                              </p>
                            )}
                            {selectedSubscription.address?.phone && (
                              <p className="text-muted-foreground">
                                📞 +91 {selectedSubscription.address?.phone}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCustomerView;
