import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Leaf, Calendar, Package, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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
            {subscriptions.map((subscription) => (
              <Card key={subscription.id} data-testid={`subscription-card-${subscription.id}`}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-primary heading-text">
                          Subscription #{subscription.id.slice(0, 8)}
                        </h3>
                        {getStatusBadge(subscription.status)}
                      </div>
                      <div className="flex gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span className="capitalize">{subscription.frequency}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{subscription.delivery_day}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">₹{subscription.total_price}</p>
                      <p className="text-sm text-muted-foreground">per delivery</p>
                    </div>
                  </div>

                  {subscription.next_delivery_date && (
                    <div className="bg-secondary/10 rounded-lg p-4 mb-4">
                      <p className="text-sm font-medium text-primary">
                        Next Delivery: {format(new Date(subscription.next_delivery_date), 'PPP')}
                      </p>
                    </div>
                  )}

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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MySubscriptions;