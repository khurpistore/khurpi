import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Package, Clock, Truck, Sprout, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Format plan name for display
const getPlanDisplayName = (frequency) => {
  const planNames = {
    'once_week': 'Fresh Start Plan',
    'twice_week': 'Balanced Nutrition Plan',
    'four_days_week': 'Power Greens Plan',
    'weekly': 'Fresh Start Plan',
    'twice_weekly': 'Balanced Nutrition Plan',
    'four_days': 'Power Greens Plan'
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
            {[...subscriptions].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map((subscription) => {
              // Calculate monthly values - use delivery_days array if available
              const deliveriesPerWeek = subscription.delivery_days?.length || subscription.deliveries_per_week || getDeliveriesPerWeek(subscription.frequency);
              const weeksPerMonth = 4;
              const totalDeliveriesPerMonth = deliveriesPerWeek * weeksPerMonth;
              const packsPerDelivery = subscription.tray_count || 1;
              const totalPacksPerMonth = packsPerDelivery * totalDeliveriesPerMonth;
              
              // Get discount percentage from subscription data or plan
              const discountPercent = subscription.discount_percent || subscription.plan_discount || subscription.discount || getPlanDiscount(subscription.frequency);
              
              // total_price stored in DB is the MONTHLY total (what user paid)
              // For older subscriptions, total_price might be per-delivery, so we need to handle both cases
              const storedTotalPrice = subscription.total_price || 0;
              
              // If subtotal is stored, we can calculate properly
              // subtotal is per-delivery amount before discount
              const perDeliverySubtotal = subscription.subtotal || 0;
              
              // Determine if total_price is monthly or per-delivery
              // If discount_amount is stored, total_price is likely monthly
              const hasMonthlyTotal = subscription.discount_amount !== undefined || subscription.plan_discount !== undefined;
              
              let monthlyTotal, originalMonthlyTotal;
              
              if (hasMonthlyTotal) {
                // New format: total_price is the monthly paid amount
                monthlyTotal = Math.round(storedTotalPrice);
                // Calculate original from subtotal × deliveries
                originalMonthlyTotal = perDeliverySubtotal > 0 
                  ? Math.round(perDeliverySubtotal * totalDeliveriesPerMonth)
                  : Math.round(monthlyTotal / (1 - discountPercent / 100));
              } else {
                // Old format: total_price is per-delivery
                const perDeliveryTotal = storedTotalPrice;
                monthlyTotal = Math.round(perDeliveryTotal * totalDeliveriesPerMonth);
                originalMonthlyTotal = discountPercent > 0
                  ? Math.round(monthlyTotal / (1 - discountPercent / 100))
                  : monthlyTotal;
              }
              
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
                        {subscription.tray_count}gm • {totalDeliveriesPerMonth} deliveries/month
                      </p>
                      <p className="text-sm text-muted-foreground">
                        📅 {subscription.delivery_days && subscription.delivery_days.length > 0 
                          ? subscription.delivery_days.join(', ')
                          : subscription.delivery_day || 'Not set'}
                      </p>
                    </div>
                    <div className="text-right">
                      {discountPercent > 0 && (
                        <p className="text-sm text-muted-foreground line-through">₹{originalMonthlyTotal}</p>
                      )}
                      <p className="text-2xl font-bold text-primary">₹{monthlyTotal}</p>
                      <p className="text-xs text-muted-foreground">per month</p>
                      {discountPercent > 0 && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">{discountPercent}% OFF</span>
                      )}
                    </div>
                  </div>

                  {/* Products in Subscription */}
                  {subscription.items && subscription.items.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Products</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {subscription.items.map((item) => (
                          <div 
                            key={item.id} 
                            className="flex items-center gap-2 p-2 rounded-lg bg-gray-50"
                          >
                            <img 
                              src={item.product?.image} 
                              alt={item.product?.name} 
                              className="w-10 h-10 rounded object-cover" 
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{item.product?.name}</p>
                              <p className="text-xs text-muted-foreground">{item.quantity}gm</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Delivery Address */}
                  {subscription.address && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Delivery Address</p>
                            {subscription.address.name && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                {subscription.address.name}
                              </span>
                            )}
                          </div>
                          {subscription.address.receiver_name && (
                            <p className="text-sm font-semibold text-primary">{subscription.address.receiver_name}</p>
                          )}
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {[
                              subscription.address.address_line || subscription.address.address_line_1,
                              subscription.address.landmark,
                              subscription.address.area,
                              subscription.address.city
                            ].filter(Boolean).join(', ')}
                            {subscription.address.pincode && ` - ${subscription.address.pincode}`}
                          </p>
                          {subscription.address.phone && (
                            <p className="text-xs text-muted-foreground mt-1">📞 +91 {subscription.address.phone}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Important Dates */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <p className="text-xs text-muted-foreground">Created</p>
                      <p className="text-xs font-medium">{format(new Date(subscription.created_at), 'MMM d, yyyy')}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2 text-center">
                      <p className="text-xs text-green-700">Next Delivery</p>
                      <p className="text-xs font-medium text-green-800">
                        {subscription.next_delivery_date 
                          ? format(new Date(subscription.next_delivery_date), 'MMM d')
                          : '-'}
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-2 text-center">
                      <p className="text-xs text-blue-700">Renews On</p>
                      <p className="text-xs font-medium text-blue-800">
                        {subscription.renewal_date 
                          ? format(new Date(subscription.renewal_date), 'MMM d')
                          : format(new Date(new Date(subscription.start_date).setMonth(new Date(subscription.start_date).getMonth() + 1)), 'MMM d')}
                      </p>
                    </div>
                  </div>

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