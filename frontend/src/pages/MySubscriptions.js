import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Calendar, Package, Clock, Truck } from 'lucide-react';
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
              const planDiscount = subscription.plan_discount || subscription.discount_percent || getPlanDiscount(subscription.frequency);
              
              // Per delivery values from subscription
              const perDeliverySubtotal = subscription.subtotal || 0;
              const perDeliveryFee = subscription.delivery_fee || 0;
              const perDeliveryTotal = subscription.total_price || 0;
              
              // Calculate per tray price from subtotal
              const perTrayPrice = traysPerDelivery > 0 ? Math.round(perDeliverySubtotal / traysPerDelivery) : 0;
              
              // Monthly calculations
              const monthlySubtotal = perDeliverySubtotal * totalDeliveriesPerMonth;
              const monthlyDeliveryFee = perDeliveryFee * totalDeliveriesPerMonth;
              const discountAmount = subscription.discount_amount ? subscription.discount_amount * totalDeliveriesPerMonth : Math.round(monthlySubtotal * planDiscount / 100);
              const couponDiscount = (subscription.coupon_discount || 0) * totalDeliveriesPerMonth;
              const referralDiscount = (subscription.referral_discount || 0) * totalDeliveriesPerMonth;
              
              // Monthly total = per delivery total × deliveries per month
              const monthlyTotal = perDeliveryTotal * totalDeliveriesPerMonth;
              
              return (
              <Card key={subscription.id} data-testid={`subscription-card-${subscription.id}`} className="overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-primary">
                          {getPlanDisplayName(subscription.frequency)}
                        </h3>
                        {getStatusBadge(subscription.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {totalTraysPerMonth} trays • {totalDeliveriesPerMonth} deliveries • {subscription.delivery_day}s
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">₹{monthlyTotal}</p>
                      <p className="text-xs text-muted-foreground">per month</p>
                    </div>
                  </div>

                  {/* Compact Breakdown */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
                      <span>{totalTraysPerMonth} trays × ₹{perTrayPrice} = ₹{monthlySubtotal}</span>
                      {discountAmount > 0 && <span className="text-green-600">-₹{discountAmount} discount</span>}
                      {monthlyDeliveryFee > 0 ? <span>+₹{monthlyDeliveryFee} delivery</span> : <span className="text-green-600">FREE delivery</span>}
                    </div>
                  </div>

                  {/* Next Delivery */}
                  {subscription.next_delivery_date && subscription.status === 'active' && (
                    <div className="bg-primary/10 rounded-lg p-3 mb-4">
                      <p className="text-sm font-medium text-primary">
                        📦 Next: {format(new Date(subscription.next_delivery_date), 'PPP')}
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