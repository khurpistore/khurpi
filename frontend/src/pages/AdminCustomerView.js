import React, { useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Search, User, Phone, Mail, Calendar, MapPin, ShoppingBag, 
  Repeat, Gift, Package, ChevronRight, Loader2, Tag, Home, Building2,
  Copy, CreditCard
} from 'lucide-react';
import { format } from 'date-fns';
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
          {/* Styled exactly like customer's Orders.js page */}
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
                        className="hover:shadow-md transition-shadow"
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
          {/* Styled exactly like customer's MySubscriptions.js page */}
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
                        className="overflow-hidden hover:shadow-md transition-shadow"
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
          {/* Styled exactly like customer's Addresses.js page */}
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

                {/* Referred By */}
                {referralData?.referred_by && (
                  <Card className="md:col-span-2">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-3">Referred By</h3>
                      <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                        <User className="w-8 h-8 text-primary" />
                        <div>
                          <p className="font-medium">{referralData.referred_by.name || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">{referralData.referred_by.phone}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recent Referrals */}
                {referralData?.referrals && referralData.referrals.length > 0 && (
                  <Card className="md:col-span-2">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-3">Recent Referrals</h3>
                      <div className="space-y-3">
                        {referralData.referrals.map((ref, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center gap-3">
                              <User className="w-6 h-6 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{ref.name || 'User'}</p>
                                <p className="text-sm text-muted-foreground">{ref.phone}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className={getStatusColor(ref.status || 'pending')}>
                                {ref.status || 'pending'}
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDate(ref.created_at)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
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
    </AdminLayout>
  );
};

export default AdminCustomerView;
