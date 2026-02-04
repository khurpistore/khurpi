import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';
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
    'four_days': 'Power Greens Plan',
    'daily': 'Daily Plan'
  };
  return planNames[frequency] || frequency;
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
      // Fetch from both subscriptions collection and orders with subscriptions
      const [subsResponse, ordersResponse] = await Promise.all([
        axios.get(`${API}/subscriptions?user_id=${user.id}`),
        axios.get(`${API}/orders?user_id=${user.id}`)
      ]);
      
      // Get standalone subscriptions
      const standaloneSubscriptions = subsResponse.data.map(sub => ({
        ...sub,
        source: 'subscription'
      }));
      
      // Get subscriptions from orders (order_type = 'subscription' or 'mixed')
      const orderSubscriptions = ordersResponse.data
        .filter(order => order.subscription && (order.order_type === 'subscription' || order.order_type === 'mixed'))
        .map(order => ({
          id: order.id,
          order_id: order.id,
          frequency: order.subscription.frequency,
          delivery_days: order.subscription.delivery_days,
          start_date: order.subscription.start_date,
          next_delivery_date: order.subscription.next_delivery_date,
          items: order.subscription.items,
          subtotal: order.subscription.subtotal,
          total_price: order.subscription.total_price,
          bulk_discount_percent: order.subscription.bulk_discount_percent,
          bulk_discount_amount: order.subscription.bulk_discount_amount,
          status: order.status === 'confirmed' ? 'active' : order.status,
          address: order.address || order.delivery_address,
          created_at: order.created_at,
          tray_count: order.subscription.items?.reduce((sum, item) => sum + (item.quantity || 100), 0) || 0,
          source: 'order'
        }));
      
      // Combine and sort by created_at
      const allSubscriptions = [...standaloneSubscriptions, ...orderSubscriptions]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      setSubscriptions(allSubscriptions);
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
      cancelled: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800'
    };
    return <Badge className={`${colors[status] || 'bg-gray-100 text-gray-800'} capitalize`}>{status?.replace(/_/g, ' ')}</Badge>;
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
          <div className="space-y-3" data-testid="subscriptions-list">
            {[...subscriptions].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map((subscription) => {
              // Delivery info
              const deliveriesPerWeek = subscription.delivery_days?.length || 1;
              const totalDeliveriesPerMonth = deliveriesPerWeek * 4;
              // Product images (max 3)
              const productImages = subscription.items?.slice(0, 3).map(item => item.product?.image).filter(Boolean) || [];
              const productNames = subscription.items?.map(item => item.product?.name).filter(Boolean) || [];
              
              return (
              <Card 
                key={subscription.id} 
                data-testid={`subscription-card-${subscription.id}`} 
                className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  navigate(`/subscription/${subscription.id}`, { 
                    state: { 
                      source: subscription.source,
                      subscriptionData: subscription.source === 'order' ? subscription : null
                    } 
                  });
                }}
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
                        {getStatusBadge(subscription.status)}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {productNames.join(', ') || 'No products'} • {subscription.tray_count}gm
                      </p>
                      <p className="text-xs text-muted-foreground">
                        📅 {subscription.delivery_days?.join(', ') || 'Not set'}
                      </p>
                    </div>

                    {/* Next Delivery & Action */}
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
                      <Button
                        data-testid={`view-details-button-${subscription.id}`}
                        variant="ghost"
                        size="sm"
                        className="rounded-full text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/subscription/${subscription.id}`, { 
                            state: { 
                              source: subscription.source,
                              subscriptionData: subscription.source === 'order' ? subscription : null
                            } 
                          });
                        }}
                      >
                        →
                      </Button>
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