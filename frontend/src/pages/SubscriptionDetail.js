import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Calendar, Package, Clock, MapPin, AlertTriangle, ArrowLeft, CreditCard, Tag, Truck, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SubscriptionDetail = () => {
  const [subscription, setSubscription] = useState(null);
  const [items, setItems] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams();

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!subscription) return null;

  // Calculate pricing breakdown
  const itemsTotal = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  const deliveriesPerWeek = subscription.deliveries_per_week || 1;
  const weeksPerMonth = 4;
  
  // Use stored total_price if available, otherwise calculate
  const storedMonthlyTotal = subscription.total_price || 0;
  const monthlySubtotal = itemsTotal > 0 ? itemsTotal * deliveriesPerWeek * weeksPerMonth : storedMonthlyTotal;
  
  const planDiscount = subscription.plan_discount || 0;
  const planDiscountAmount = (monthlySubtotal * planDiscount) / 100;
  const deliveryFee = subscription.delivery_fee || 0;
  const monthlyDeliveryFee = deliveryFee * weeksPerMonth;
  const couponDiscount = subscription.coupon_discount || 0;
  const referralDiscount = subscription.referral_discount || 0;
  const totalDiscount = planDiscountAmount + couponDiscount + referralDiscount;
  
  // Final monthly total
  const monthlyTotal = storedMonthlyTotal > 0 ? storedMonthlyTotal : Math.max(0, monthlySubtotal - planDiscountAmount + monthlyDeliveryFee - couponDiscount - referralDiscount);
  
  // Per tray cost (for display)
  const perTrayPrice = itemsTotal > 0 ? itemsTotal : (storedMonthlyTotal / (deliveriesPerWeek * weeksPerMonth));

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Simple Back Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-green-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/subscriptions')}
            className="rounded-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Subscriptions
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
          {/* Monthly Cost Breakdown Card */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-green-50/50 to-white overflow-hidden">
            <div className="bg-primary/10 px-4 py-3 border-b border-primary/20">
              <h3 className="font-semibold text-primary flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Monthly Subscription Cost
              </h3>
            </div>
            <CardContent className="p-4">
              {/* Calculation Formula */}
              <div className="bg-white rounded-lg p-3 border border-gray-100 mb-4">
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Price Calculation</p>
                <div className="flex items-center justify-center gap-2 text-sm flex-wrap">
                  <div className="text-center px-3 py-2 bg-gray-50 rounded-lg">
                    <p className="font-bold text-primary">₹{perTrayPrice.toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">per tray</p>
                  </div>
                  <span className="text-muted-foreground font-bold">×</span>
                  <div className="text-center px-3 py-2 bg-gray-50 rounded-lg">
                    <p className="font-bold text-primary">{deliveriesPerWeek}</p>
                    <p className="text-xs text-muted-foreground">days/week</p>
                  </div>
                  <span className="text-muted-foreground font-bold">×</span>
                  <div className="text-center px-3 py-2 bg-gray-50 rounded-lg">
                    <p className="font-bold text-primary">4</p>
                    <p className="text-xs text-muted-foreground">weeks</p>
                  </div>
                  <span className="text-muted-foreground font-bold">=</span>
                  <div className="text-center px-3 py-2 bg-primary/10 rounded-lg">
                    <p className="font-bold text-primary">₹{monthlySubtotal.toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">subtotal</p>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Monthly Subtotal ({deliveriesPerWeek}×/week × 4 weeks)</span>
                  <span className="font-medium">₹{monthlySubtotal.toFixed(2)}</span>
                </div>
                
                {planDiscount > 0 && (
                  <div className="flex justify-between py-1 text-green-600 bg-green-50 px-2 -mx-2 rounded">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Plan Discount ({planDiscount}%)
                    </span>
                    <span className="font-medium">-₹{planDiscountAmount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Truck className="w-3 h-3" /> Delivery (4 weeks)
                  </span>
                  {monthlyDeliveryFee === 0 ? (
                    <span className="text-green-600 font-medium">FREE</span>
                  ) : (
                    <span className="font-medium">₹{monthlyDeliveryFee.toFixed(2)}</span>
                  )}
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between py-1 text-green-600 bg-green-50 px-2 -mx-2 rounded">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Coupon ({subscription.coupon_code})
                    </span>
                    <span className="font-medium">-₹{couponDiscount.toFixed(2)}</span>
                  </div>
                )}

                {referralDiscount > 0 && (
                  <div className="flex justify-between py-1 text-blue-600 bg-blue-50 px-2 -mx-2 rounded">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Referral ({subscription.referral_code})
                    </span>
                    <span className="font-medium">-₹{referralDiscount.toFixed(2)}</span>
                  </div>
                )}
                
                {/* Total */}
                <div className="flex justify-between items-center pt-3 mt-2 border-t-2 border-dashed border-primary/30">
                  <div>
                    <span className="font-bold text-lg">Monthly Total</span>
                    {totalDiscount > 0 && (
                      <p className="text-xs text-green-600">You save ₹{totalDiscount.toFixed(0)}/month!</p>
                    )}
                  </div>
                  <span className="font-bold text-2xl text-primary">₹{monthlyTotal.toFixed(0)}<span className="text-sm font-normal text-muted-foreground">/mo</span></span>
                </div>
              </div>
            </CardContent>
          </Card>

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
                    <p className="text-xs text-muted-foreground">Trays per Delivery</p>
                    <p className="font-medium">{subscription.tray_count} trays</p>
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
              {subscription.next_delivery_date && subscription.status === 'active' && (
                <div className="mt-4 bg-primary/10 rounded-lg p-3">
                  <p className="text-sm font-medium text-primary">
                    📦 Next Delivery: {format(new Date(subscription.next_delivery_date), 'PPPP')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Products */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Products ({items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3" data-testid="subscription-items">
                {items.map((item) => (
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
                      <p className="text-xs text-muted-foreground">₹{item.product?.price}/tray</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">×{item.quantity}</p>
                      <p className="text-sm text-primary">₹{(item.product?.price || 0) * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Manage Subscription</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {subscription.status === 'active' && subscription.next_delivery_date && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      data-testid="skip-delivery-button"
                      variant="outline"
                      className="w-full rounded-full"
                    >
                      Skip Next Delivery
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Skip Next Delivery?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Your next delivery on {format(new Date(subscription.next_delivery_date), 'PPP')} will be skipped.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleSkipDelivery}>Confirm Skip</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {subscription.status === 'active' && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      data-testid="pause-subscription-detail-button"
                      variant="outline"
                      className="w-full rounded-full"
                    >
                      Pause Subscription
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Pause Subscription?</AlertDialogTitle>
                      <AlertDialogDescription>
                        <div className="flex items-start gap-2 text-amber-600 mb-2">
                          <AlertTriangle className="w-5 h-5 mt-0.5" />
                          <span>Cannot pause within 24 hours of next delivery</span>
                        </div>
                        Your subscription will be paused until you resume it.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleStatusChange('paused')}>Confirm Pause</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {subscription.status === 'paused' && (
                <Button
                  data-testid="resume-subscription-detail-button"
                  onClick={() => handleStatusChange('active')}
                  className="w-full bg-primary hover:bg-primary/90 rounded-full"
                >
                  Resume Subscription
                </Button>
              )}

              {subscription.status !== 'cancelled' && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      data-testid="cancel-subscription-detail-button"
                      variant="destructive"
                      className="w-full rounded-full"
                    >
                      Cancel Subscription
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. Your subscription will be permanently cancelled.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleStatusChange('cancelled')}
                        className="bg-destructive text-destructive-foreground"
                      >
                        Cancel Subscription
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </CardContent>
          </Card>

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