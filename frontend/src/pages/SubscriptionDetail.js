import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Calendar, Package, Clock, MapPin, AlertTriangle, ArrowLeft, CreditCard, Tag, Truck, Sparkles, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SubscriptionDetail = () => {
  const [subscription, setSubscription] = useState(null);
  const [items, setItems] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { id } = useParams();
  
  // Check if user came from Orders page
  const cameFromOrders = location.state?.from === 'orders';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchSubscriptionDetails();
  }, [user, navigate, id]);

  const fetchSubscriptionDetails = async () => {
    try {
      const [subRes, itemsRes, deliveriesRes] = await Promise.all([
        axios.get(`${API}/subscriptions/${id}`),
        axios.get(`${API}/subscriptions/${id}/items`),
        axios.get(`${API}/deliveries?subscription_id=${id}`)
      ]);
      setSubscription(subRes.data);
      setItems(itemsRes.data);
      setDeliveries(deliveriesRes.data);
      
      // Fetch address if address_id exists
      if (subRes.data.address_id) {
        try {
          const addressRes = await axios.get(`${API}/addresses/${subRes.data.address_id}`);
          setAddress(addressRes.data);
        } catch (err) {
          console.log('Address not found');
        }
      }
    } catch (error) {
      toast.error('Failed to load subscription details');
      navigate('/subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipDelivery = async () => {
    try {
      await axios.post(`${API}/subscriptions/${id}/skip`);
      toast.success('Next delivery skipped successfully');
      fetchSubscriptionDetails();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to skip delivery');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await axios.put(`${API}/subscriptions/${id}`, { status: newStatus });
      toast.success(`Subscription ${newStatus}`);
      fetchSubscriptionDetails();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update subscription');
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      scheduled: 'bg-blue-100 text-blue-800',
      skipped: 'bg-gray-100 text-gray-800',
      delivered: 'bg-green-100 text-green-800'
    };
    return <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>{status}</Badge>;
  };

  // Format plan name for display
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

  // Get plan discount percentage
  const getPlanDiscountPercent = (frequency) => {
    const discounts = {
      'once_week': 0,
      'twice_week': 10,
      'four_days_week': 50,
      'weekly': 0,
      'twice_weekly': 10,
      'four_days': 50
    };
    return discounts[frequency] || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!subscription) return null;

  // Calculate pricing - total_price in DB is PER DELIVERY price
  const deliveriesPerWeek = subscription.delivery_days?.length || 1;
  const weeksPerMonth = 4;
  const totalDeliveriesPerMonth = deliveriesPerWeek * weeksPerMonth;
  
  // Per delivery values from subscription
  const perDeliveryTotal = subscription.total_price || 0;
  const perDeliveryFee = subscription.delivery_fee || 0;
  
  // Calculate per delivery subtotal from items using weight-based pricing
  const perDeliverySubtotal = items.reduce((sum, item) => {
    const qty = item.selected_qty || item.selectedQty || 100;
    return sum + ((item.product?.price || 0) / 100) * qty;
  }, 0) || subscription.subtotal || perDeliveryTotal;
  
  // Monthly calculations
  const monthlySubtotal = perDeliverySubtotal * totalDeliveriesPerMonth;
  const monthlyDeliveryFee = perDeliveryFee * totalDeliveriesPerMonth;
  const monthlyTotal = perDeliveryTotal * totalDeliveriesPerMonth;
  
  // Discounts
  const planDiscountPercent = subscription.discount_percent || getPlanDiscountPercent(subscription.frequency);
  const planDiscountAmount = subscription.discount_amount ? subscription.discount_amount * totalDeliveriesPerMonth : 0;
  const couponDiscount = (subscription.coupon_discount || 0) * totalDeliveriesPerMonth;
  const referralDiscount = (subscription.referral_discount || 0) * totalDeliveriesPerMonth;
  const totalSavings = planDiscountAmount + couponDiscount + referralDiscount;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Simple Back Header - Dynamic based on navigation source */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-green-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(cameFromOrders ? '/orders' : '/subscriptions')}
            className="rounded-full"
            data-testid="back-button"
          >
            {cameFromOrders ? (
              <>
                <ArrowLeft className="w-4 h-4 mr-2" />
                <ShoppingBag className="w-4 h-4 mr-1" />
                Back to Orders
              </>
            ) : (
              <>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Subscriptions
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Title Section */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary">
              Subscription
            </h2>
            {getStatusBadge(subscription.status)}
          </div>
          <p className="text-sm text-muted-foreground">
            ID: {subscription.id.slice(0, 8)} • Created {format(new Date(subscription.created_at), 'PP')}
          </p>
        </div>

        <div className="space-y-6">
          {/* Subscription Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Subscription Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Plan (Monthly)</p>
                    <p className="font-medium">{getPlanDisplayName(subscription.frequency)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Delivery Days</p>
                    <p className="font-medium">
                      {subscription.delivery_days && subscription.delivery_days.length > 0 
                        ? subscription.delivery_days.join(', ')
                        : subscription.delivery_day || 'Not set'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Quantity per Delivery</p>
                    <p className="font-medium">{subscription.tray_count}gm</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Start Date</p>
                    <p className="font-medium">{format(new Date(subscription.start_date), 'PP')}</p>
                  </div>
                </div>
              </div>
              
              {/* Important Dates Section */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Important Dates</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Created On</p>
                    <p className="font-medium text-sm">{format(new Date(subscription.created_at), 'PP')}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-green-700">Next Delivery</p>
                    <p className="font-medium text-sm text-green-800">
                      {subscription.next_delivery_date 
                        ? format(new Date(subscription.next_delivery_date), 'PP')
                        : 'Not scheduled'}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-700">Renewal Date</p>
                    <p className="font-medium text-sm text-blue-800">
                      {subscription.renewal_date 
                        ? format(new Date(subscription.renewal_date), 'PP')
                        : format(new Date(new Date(subscription.start_date).setMonth(new Date(subscription.start_date).getMonth() + 1)), 'PP')}
                    </p>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Products */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Products ({items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3" data-testid="subscription-items">
                {items.map((item) => {
                  const qty = item.selected_qty || item.selectedQty || 100;
                  const unitPrice = (item.product?.price / 100) * qty;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      data-testid={`subscription-item-${item.product_id}`}
                    >
                      <img
                        src={item.product?.image}
                        alt={item.product?.name}
                        className="w-14 h-14 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{item.product?.name}</h4>
                        <p className="text-xs text-muted-foreground">{qty}gm</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">₹{unitPrice.toFixed(0)}</p>
                        <p className="text-xs text-muted-foreground">per delivery</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Cost Summary - Clean Design */}
          <Card className="border-2 border-primary/20 overflow-hidden">
            <div className="bg-primary/5 px-4 py-3 border-b border-primary/10">
              <h3 className="font-semibold text-primary flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Monthly Cost
              </h3>
            </div>
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Summary Line */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Per delivery × {deliveriesPerWeek} day{deliveriesPerWeek > 1 ? 's' : ''}/week × 4 weeks</span>
                  <span>₹{monthlySubtotal.toFixed(0)}</span>
                </div>

                {/* Discounts */}
                {planDiscountPercent > 0 && planDiscountAmount > 0 && (
                  <div className="flex items-center justify-between text-sm text-green-600">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Plan Discount ({planDiscountPercent}%)
                    </span>
                    <span>-₹{planDiscountAmount.toFixed(0)}</span>
                  </div>
                )}

                {monthlyDeliveryFee > 0 && (
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      Delivery ({totalDeliveriesPerMonth} deliveries)
                    </span>
                    <span>+₹{monthlyDeliveryFee.toFixed(0)}</span>
                  </div>
                )}

                {couponDiscount > 0 && (
                  <div className="flex items-center justify-between text-sm text-green-600">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Coupon ({subscription.coupon_code})
                    </span>
                    <span>-₹{couponDiscount.toFixed(0)}</span>
                  </div>
                )}

                {referralDiscount > 0 && (
                  <div className="flex items-center justify-between text-sm text-green-600">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Referral
                    </span>
                    <span>-₹{referralDiscount.toFixed(0)}</span>
                  </div>
                )}

                {/* Total */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <div>
                    <p className="font-semibold text-lg">Monthly Total</p>
                    {totalSavings > 0 && (
                      <p className="text-xs text-green-600">You save ₹{totalSavings.toFixed(0)}/month</p>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    ₹{monthlyTotal.toFixed(0)}
                    <span className="text-sm font-normal text-muted-foreground">/mo</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cancel Subscription */}
          {subscription.status !== 'cancelled' && (
            <Card className="border-red-100">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">Cancel Subscription</h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      Once cancelled, your subscription will be permanently stopped. You will continue to receive deliveries until the end of your current billing cycle.
                    </p>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mb-3">
                      <p className="text-xs text-amber-800 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span className="font-medium">No refunds will be issued for the remaining period.</span>
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          data-testid="cancel-subscription-detail-button"
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 rounded-full"
                        >
                          Cancel Subscription
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                          <AlertDialogDescription>
                            <p className="mb-3">This action cannot be undone. Your subscription will be permanently cancelled.</p>
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                              <p className="text-sm text-amber-800 font-medium">
                                Please note: No refunds will be issued for any unused portion of your subscription.
                              </p>
                            </div>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleStatusChange('cancelled')}
                            className="bg-destructive text-destructive-foreground"
                          >
                            Yes, Cancel
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Delivery History */}
          {deliveries.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Delivery History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2" data-testid="delivery-history">
                  {deliveries.sort((a, b) => new Date(b.delivery_date) - new Date(a.delivery_date)).map((delivery) => (
                    <div
                      key={delivery.id}
                      data-testid={`delivery-${delivery.id}`}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">{format(new Date(delivery.delivery_date), 'PP')}</p>
                        <p className="text-xs text-muted-foreground">#{delivery.id.slice(0, 8)}</p>
                      </div>
                      {getStatusBadge(delivery.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDetail;