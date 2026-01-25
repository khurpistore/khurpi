import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Calendar, Package, Clock, Truck, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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

// Get deliveries per week based on frequency
const getDeliveriesPerWeek = (frequency) => {
  const deliveries = {
    'once_week': 1,
    'twice_week': 2,
    'four_days_week': 4,
    'weekly': 1,
    'twice_weekly': 2,
    'four_days': 4
  };
  return deliveries[frequency] || 1;
};

// Get plan discount
const getPlanDiscount = (frequency) => {
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

const MySubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchSubscriptions();
  }, [user, navigate]);

  const fetchSubscriptions = async () => {
    try {
      const response = await axios.get(`${API}/subscriptions?user_id=${user.id}`);
      setSubscriptions(response.data);
    } catch (error) {
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (subscriptionId, newStatus) => {
    try {
      await axios.put(`${API}/subscriptions/${subscriptionId}`, { status: newStatus });
      toast.success(`Subscription ${newStatus}`);
      fetchSubscriptions();
    } catch (error) {
      toast.error('Failed to update subscription');
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary heading-text">My Subscriptions</h2>
          <Button
            data-testid="create-subscription-button"
            onClick={() => navigate('/subscription/create')}
            className="bg-primary hover:bg-primary/90 rounded-full"
          >
            New Subscription
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Loading subscriptions...</p>
          </div>
        ) : subscriptions.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-primary mb-2">No subscriptions yet</h3>
              <p className="text-muted-foreground mb-6">Start your healthy journey with fresh microgreens</p>
              <Button
                data-testid="start-first-subscription-button"
                onClick={() => navigate('/subscription/create')}
                className="bg-primary hover:bg-primary/90 rounded-full"
              >
                Create Your First Subscription
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6" data-testid="subscriptions-list">
            {subscriptions.map((subscription) => {
              // Calculate monthly values
              const deliveriesPerWeek = subscription.deliveries_per_week || getDeliveriesPerWeek(subscription.frequency);
              const weeksPerMonth = 4;
              const totalDeliveriesPerMonth = deliveriesPerWeek * weeksPerMonth;
              const traysPerDelivery = subscription.tray_count || 1;
              const totalTraysPerMonth = traysPerDelivery * totalDeliveriesPerMonth;
              const planDiscount = subscription.plan_discount || getPlanDiscount(subscription.frequency);
              const monthlyTotal = subscription.total_price || 0;
              
              // Calculate breakdown (estimated from stored total)
              const deliveryFee = subscription.delivery_fee || 0;
              const monthlyDeliveryFee = deliveryFee * weeksPerMonth;
              const couponDiscount = subscription.coupon_discount || 0;
              const referralDiscount = subscription.referral_discount || 0;
              
              // Estimate per tray price from total
              const estimatedSubtotal = monthlyTotal + (monthlyTotal * planDiscount / 100) - monthlyDeliveryFee + couponDiscount + referralDiscount;
              const perTrayPrice = totalTraysPerMonth > 0 ? Math.round(estimatedSubtotal / totalTraysPerMonth) : 0;
              const monthlySubtotal = perTrayPrice * totalTraysPerMonth;
              const discountAmount = Math.round(monthlySubtotal * planDiscount / 100);
              
              return (
              <Card key={subscription.id} data-testid={`subscription-card-${subscription.id}`} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Header */}
                  <div className="p-4 sm:p-6 pb-0">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg sm:text-xl font-semibold text-primary">
                            Subscription #{subscription.id.slice(0, 8)}
                          </h3>
                          {getStatusBadge(subscription.status)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Started {format(new Date(subscription.start_date || subscription.created_at), 'PP')}
                        </p>
                      </div>
                    </div>

                    {/* Subscription Info */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                          <Clock className="w-3 h-3" />
                          <span className="text-xs">Plan</span>
                        </div>
                        <p className="font-semibold text-sm">{getPlanDisplayName(subscription.frequency)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                          <Truck className="w-3 h-3" />
                          <span className="text-xs">Deliveries</span>
                        </div>
                        <p className="font-semibold text-sm">{totalDeliveriesPerMonth}/month</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                          <Package className="w-3 h-3" />
                          <span className="text-xs">Trays</span>
                        </div>
                        <p className="font-semibold text-sm">{totalTraysPerMonth}/month</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                          <Calendar className="w-3 h-3" />
                          <span className="text-xs">Day</span>
                        </div>
                        <p className="font-semibold text-sm">{subscription.delivery_day}</p>
                      </div>
                    </div>
                  </div>

                  {/* Monthly Payment Breakdown */}
                  <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 sm:p-6 border-t">
                    <h4 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Monthly Payment Breakdown
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{totalTraysPerMonth} trays × ₹{perTrayPrice}/tray</span>
                        <span>₹{monthlySubtotal}</span>
                      </div>
                      {planDiscount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Plan Discount ({planDiscount}%)</span>
                          <span>-₹{discountAmount}</span>
                        </div>
                      )}
                      {monthlyDeliveryFee > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Delivery ({totalDeliveriesPerMonth} deliveries)</span>
                          <span>₹{monthlyDeliveryFee}</span>
                        </div>
                      )}
                      {monthlyDeliveryFee === 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Delivery</span>
                          <span className="text-green-600">FREE</span>
                        </div>
                      )}
                      {couponDiscount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Coupon ({subscription.coupon_code})</span>
                          <span>-₹{couponDiscount}</span>
                        </div>
                      )}
                      {referralDiscount > 0 && (
                        <div className="flex justify-between text-blue-600">
                          <span>Referral ({subscription.referral_code})</span>
                          <span>-₹{referralDiscount}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2 border-t border-primary/20 mt-2">
                        <span className="font-bold text-primary">Monthly Total</span>
                        <span className="font-bold text-2xl text-primary">₹{monthlyTotal}<span className="text-sm font-normal">/mo</span></span>
                      </div>
                    </div>
                  </div>

                  {/* Next Delivery & Actions */}
                  <div className="p-4 sm:p-6 pt-4">
                    {/* Next Delivery */}
                    {subscription.next_delivery_date && subscription.status === 'active' && (
                      <div className="bg-primary/10 rounded-lg p-3 mb-4">
                        <p className="text-sm font-medium text-primary">
                          📦 Next Delivery: {format(new Date(subscription.next_delivery_date), 'PPPP')}
                        </p>
                      </div>
                    )}

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      data-testid={`view-details-button-${subscription.id}`}
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/subscription/${subscription.id}`)}
                      className="rounded-full"
                    >
                      View Details
                    </Button>
                    {subscription.status === 'active' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            data-testid={`pause-subscription-button-${subscription.id}`}
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                          >
                            Pause
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Pause Subscription?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Your subscription will be paused. You can resume it anytime.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleStatusChange(subscription.id, 'paused')}>
                              Confirm
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    {subscription.status === 'paused' && (
                      <Button
                        data-testid={`resume-subscription-button-${subscription.id}`}
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(subscription.id, 'active')}
                        className="rounded-full"
                      >
                        Resume
                      </Button>
                    )}
                    {subscription.status !== 'cancelled' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            data-testid={`cancel-subscription-button-${subscription.id}`}
                            variant="outline"
                            size="sm"
                            className="rounded-full text-destructive hover:text-destructive"
                          >
                            Cancel
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
                              onClick={() => handleStatusChange(subscription.id, 'cancelled')}
                              className="bg-destructive text-destructive-foreground"
                            >
                              Cancel Subscription
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
    </div>
  );
};

export default MySubscriptions;