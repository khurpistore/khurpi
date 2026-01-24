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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!subscription) return null;

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Leaf className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary heading-text">Khurpi</h1>
          </div>
          <Button
            data-testid="back-to-subscriptions-button"
            variant="ghost"
            onClick={() => navigate('/subscriptions')}
            className="rounded-full"
          >
            Back to Subscriptions
          </Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-4xl font-bold text-primary heading-text">
              Subscription #{subscription.id.slice(0, 8)}
            </h2>
            {getStatusBadge(subscription.status)}
          </div>
          <p className="text-muted-foreground">Created on {format(new Date(subscription.created_at), 'PPP')}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="heading-text">Subscription Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Frequency</p>
                      <p className="font-medium capitalize">{subscription.frequency}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Delivery Day</p>
                      <p className="font-medium">{subscription.delivery_day}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Package className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Trays</p>
                      <p className="font-medium">{subscription.tray_count} trays per delivery</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Start Date</p>
                      <p className="font-medium">{format(new Date(subscription.start_date), 'PPP')}</p>
                    </div>
                  </div>
                </div>
                {subscription.next_delivery_date && subscription.status === 'active' && (
                  <div className="bg-secondary/10 rounded-lg p-4">
                    <p className="text-sm font-medium text-primary">
                      Next Delivery: {format(new Date(subscription.next_delivery_date), 'PPP')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="heading-text">Products in Subscription</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3" data-testid="subscription-items">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-3 bg-background rounded-lg"
                      data-testid={`subscription-item-${item.product_id}`}
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-primary">{item.product.name}</h4>
                        <p className="text-sm text-muted-foreground">{item.product.benefit}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">x{item.quantity}</p>
                        <p className="text-sm text-muted-foreground">₹{item.product.price * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-3 flex justify-between text-lg font-bold">
                    <span>Total per delivery</span>
                    <span data-testid="subscription-total-price">₹{subscription.total_price}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="heading-text">Delivery History</CardTitle>
              </CardHeader>
              <CardContent>
                {deliveries.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No deliveries yet</p>
                ) : (
                  <div className="space-y-3" data-testid="delivery-history">
                    {deliveries.sort((a, b) => new Date(b.delivery_date) - new Date(a.delivery_date)).map((delivery) => (
                      <div
                        key={delivery.id}
                        data-testid={`delivery-${delivery.id}`}
                        className="flex justify-between items-center p-3 bg-background rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{format(new Date(delivery.delivery_date), 'PPP')}</p>
                          <p className="text-sm text-muted-foreground">Delivery #{delivery.id.slice(0, 8)}</p>
                        </div>
                        {getStatusBadge(delivery.status)}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="heading-text">Actions</CardTitle>
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
                          The following delivery will be automatically scheduled.
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
                          Your subscription will be paused and no deliveries will be scheduled until you resume it.
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
                    className="w-full bg-secondary hover:bg-secondary/90 rounded-full"
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDetail;