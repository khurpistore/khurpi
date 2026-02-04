import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Search, User, Phone, Mail, Calendar, MapPin, ShoppingBag, 
  Repeat, Gift, Package, Truck, Clock, CreditCard, ChevronRight,
  Copy, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import AdminLayout from '@/components/AdminLayout';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

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
      // Search for customer by phone
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
      setOrders(customerOrders);

      // Fetch customer's subscriptions
      const subsRes = await axios.get(`${API}/admin/subscriptions`);
      const customerSubs = subsRes.data.filter(s => s.user_id === foundCustomer.id);
      setSubscriptions(customerSubs);

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

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: 'bg-green-100 text-green-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-yellow-100 text-yellow-800',
      out_for_delivery: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      paused: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      success: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };
    return (
      <Badge className={`${statusConfig[status] || 'bg-gray-100 text-gray-800'} capitalize text-xs`}>
        {status?.replace(/_/g, ' ')}
      </Badge>
    );
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
    <AdminLayout active="customer-view" title="Customer View">
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
              />
            </div>
            <Button onClick={searchCustomer} disabled={loading} className="gap-2">
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

          {/* Orders Tab */}
          <TabsContent value="orders">
            <div className="space-y-4">
              {orders.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No orders found for this customer</p>
                  </CardContent>
                </Card>
              ) : (
                orders.map((order) => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Order Info */}
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="font-mono text-sm text-muted-foreground">
                              #{order.id.slice(0, 8)}
                            </span>
                            {getStatusBadge(order.status)}
                            <Badge variant="outline" className="text-xs">
                              {order.order_type || 'one_time'}
                            </Badge>
                          </div>
                          
                          {/* Products */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {order.one_time_items?.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded px-2 py-1">
                                {item.image && (
                                  <img src={item.image} alt={item.name} className="w-6 h-6 rounded object-cover" />
                                )}
                                <span className="text-sm">{item.name} × {item.quantity}</span>
                              </div>
                            ))}
                            {order.subscription?.items?.map((item, idx) => (
                              <div key={`sub-${idx}`} className="flex items-center gap-2 bg-blue-50 rounded px-2 py-1">
                                {item.image && (
                                  <img src={item.image} alt={item.name} className="w-6 h-6 rounded object-cover" />
                                )}
                                <span className="text-sm">{item.name} × {item.quantity}g</span>
                                <Badge className="bg-blue-100 text-blue-700 text-xs">Sub</Badge>
                              </div>
                            ))}
                          </div>

                          {/* Order Details */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                            <div>
                              <p className="text-muted-foreground">Total</p>
                              <p className="font-bold text-primary">₹{order.total_amount || order.subtotal}</p>
                            </div>
                            {order.discount_amount > 0 && (
                              <div>
                                <p className="text-muted-foreground">Discount</p>
                                <p className="font-medium text-green-600">-₹{order.discount_amount}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-muted-foreground">Date</p>
                              <p className="font-medium">{formatDate(order.created_at)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Delivery</p>
                              <p className="font-medium">{formatDate(order.estimated_delivery_date)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions">
            <div className="space-y-4">
              {subscriptions.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Repeat className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No subscriptions found for this customer</p>
                  </CardContent>
                </Card>
              ) : (
                subscriptions.map((sub) => (
                  <Card key={sub.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                        {/* Subscription Info */}
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="font-mono text-sm text-muted-foreground">
                              #{sub.id.slice(0, 8)}
                            </span>
                            {getStatusBadge(sub.status)}
                            <Badge variant="outline" className="text-xs capitalize">
                              {sub.frequency?.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          
                          {/* Products */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {sub.items?.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded px-2 py-1">
                                {item.image && (
                                  <img src={item.image} alt={item.name} className="w-6 h-6 rounded object-cover" />
                                )}
                                <span className="text-sm">{item.name} × {item.quantity || item.weight}g</span>
                              </div>
                            ))}
                          </div>

                          {/* Subscription Details */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                            <div>
                              <p className="text-muted-foreground">Delivery Days</p>
                              <p className="font-medium">{sub.delivery_days?.join(', ') || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Next Delivery</p>
                              <p className="font-medium">{formatDate(sub.next_delivery_date)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Started</p>
                              <p className="font-medium">{formatDate(sub.start_date || sub.created_at)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Tray Count</p>
                              <p className="font-medium">{sub.tray_count || 0}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.length === 0 ? (
                <Card className="md:col-span-2">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No addresses found for this customer</p>
                  </CardContent>
                </Card>
              ) : (
                addresses.map((address) => (
                  <Card key={address.id} className={`hover:shadow-md transition-shadow ${address.is_default ? 'border-l-4 border-l-primary' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-primary mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{address.receiver_name || address.name || customer.name}</span>
                            {address.is_default && (
                              <Badge className="bg-primary/10 text-primary text-xs">Default</Badge>
                            )}
                            {address.label && (
                              <Badge variant="outline" className="text-xs capitalize">{address.label}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {address.address_line || address.address_line_1}
                          </p>
                          {address.address_line_2 && (
                            <p className="text-sm text-muted-foreground mb-1">{address.address_line_2}</p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            {address.area && `${address.area}, `}
                            {address.city} - {address.pincode}
                          </p>
                          {address.phone && (
                            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                              <Phone className="w-3 h-3" /> +91 {address.phone}
                            </p>
                          )}
                          {address.distance && (
                            <p className="text-xs text-muted-foreground mt-2">
                              📍 {address.distance.toFixed(1)} km from store
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Refer & Earn Tab */}
          <TabsContent value="referrals">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Referral Code Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Gift className="w-5 h-5 text-primary" />
                    Referral Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                        Share this code with friends
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No referral code generated yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Stats Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Referral Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                  <CardHeader>
                    <CardTitle className="text-lg">Referred By</CardTitle>
                  </CardHeader>
                  <CardContent>
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
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Referrals</CardTitle>
                  </CardHeader>
                  <CardContent>
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
                            {getStatusBadge(ref.status || 'pending')}
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
