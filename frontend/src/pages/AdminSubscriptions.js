import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Search, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import AdminLayout from '@/components/AdminLayout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SubscriptionDialog = ({ subscription, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    status: subscription?.status || 'active',
    frequency: subscription?.frequency || 'weekly',
    delivery_day: subscription?.delivery_day || 'Monday'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(`${API}/admin/subscriptions/${subscription.id}`, formData);
      toast.success('Subscription updated successfully');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="text-sm">Status</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
          <SelectTrigger data-testid="subscription-status-select" className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-sm">Plan (Monthly Billing)</Label>
        <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value })}>
          <SelectTrigger data-testid="subscription-frequency-select" className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="once_week">Once a Week</SelectItem>
            <SelectItem value="twice_week">Twice a Week</SelectItem>
            <SelectItem value="four_days_week">4 Days a Week</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-sm">Delivery Day</Label>
        <Select value={formData.delivery_day} onValueChange={(value) => setFormData({ ...formData, delivery_day: value })}>
          <SelectTrigger data-testid="subscription-delivery-day-select" className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Monday">Monday</SelectItem>
            <SelectItem value="Tuesday">Tuesday</SelectItem>
            <SelectItem value="Wednesday">Wednesday</SelectItem>
            <SelectItem value="Thursday">Thursday</SelectItem>
            <SelectItem value="Friday">Friday</SelectItem>
            <SelectItem value="Saturday">Saturday</SelectItem>
            <SelectItem value="Sunday">Sunday</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        data-testid="save-subscription-button"
        type="submit"
        disabled={loading}
        className="w-full bg-primary hover:bg-primary/90 rounded-full"
      >
        {loading ? 'Saving...' : 'Update Subscription'}
      </Button>
    </form>
  );
};

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    fetchSubscriptions();
  }, [user, navigate]);

  useEffect(() => {
    filterSubscriptions();
  }, [subscriptions, searchTerm, statusFilter]);

  const fetchSubscriptions = async () => {
    try {
      const response = await axios.get(`${API}/admin/subscriptions`);
      setSubscriptions(response.data);
      setFilteredSubscriptions(response.data);
    } catch (error) {
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const filterSubscriptions = () => {
    let filtered = subscriptions;

    if (searchTerm) {
      filtered = filtered.filter(sub => 
        sub.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.user?.phone.includes(searchTerm) ||
        sub.id.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(sub => sub.status === statusFilter);
    }

    setFilteredSubscriptions(filtered);
  };

  const handleDelete = async (subscriptionId) => {
    try {
      await axios.delete(`${API}/admin/subscriptions/${subscriptionId}`);
      toast.success('Subscription deleted successfully');
      fetchSubscriptions();
    } catch (error) {
      toast.error('Failed to delete subscription');
    }
  };

  const openDialog = (subscription) => {
    setSelectedSubscription(subscription);
    setDialogOpen(true);
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
    <AdminLayout active="subscriptions" title="Manage Subscriptions">
      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          <Input
            data-testid="search-subscriptions-input"
            placeholder="Search by name, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 sm:pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger data-testid="status-filter-select" className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Summary */}
      <div className="mb-6 p-3 sm:p-4 bg-white rounded-lg border border-border">
        <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
          <div>
            <p className="text-lg sm:text-2xl font-bold text-primary">{subscriptions.length}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Total</p>
          </div>
          <div>
            <p className="text-lg sm:text-2xl font-bold text-green-600">{subscriptions.filter(s => s.status === 'active').length}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Active</p>
          </div>
          <div>
            <p className="text-lg sm:text-2xl font-bold text-amber-600">{subscriptions.filter(s => s.status === 'paused').length}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Paused</p>
          </div>
          <div>
            <p className="text-lg sm:text-2xl font-bold text-red-600">{subscriptions.filter(s => s.status === 'cancelled').length}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Cancelled</p>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading subscriptions...</p>
      ) : filteredSubscriptions.length === 0 ? (
        <Card>
          <CardContent className="p-8 sm:p-12 text-center">
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' ? 'No subscriptions match your filters' : 'No subscriptions found'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4" data-testid="admin-subscriptions-list">
          {filteredSubscriptions.map((subscription) => (
            <Card key={subscription.id} data-testid={`admin-subscription-card-${subscription.id}`}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="text-base sm:text-lg font-semibold text-primary">
                        {subscription.user?.name || 'Unknown User'}
                      </h3>
                      {getStatusBadge(subscription.status)}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                      <div>
                        <p className="text-muted-foreground">Phone</p>
                        <p className="font-medium truncate">{subscription.user?.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Frequency</p>
                        <p className="font-medium capitalize">{subscription.frequency}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Items</p>
                        <p className="font-medium">{subscription.items_count} products</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total</p>
                        <p className="font-medium text-primary">₹{subscription.total_price}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Delivery Day</p>
                        <p className="font-medium">{subscription.delivery_day}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Start Date</p>
                        <p className="font-medium">{format(new Date(subscription.start_date), 'PP')}</p>
                      </div>
                      {subscription.next_delivery_date && subscription.status === 'active' && (
                        <div>
                          <p className="text-muted-foreground">Next Delivery</p>
                          <p className="font-medium text-secondary">{format(new Date(subscription.next_delivery_date), 'PP')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-row lg:flex-col gap-2">
                    <Dialog open={dialogOpen && selectedSubscription?.id === subscription.id} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          data-testid={`edit-subscription-button-${subscription.id}`}
                          size="sm"
                          variant="outline"
                          onClick={() => openDialog(subscription)}
                          className="flex-1 lg:flex-none rounded-full text-xs sm:text-sm"
                        >
                          <Pencil className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg mx-4 sm:mx-auto">
                        <DialogHeader>
                          <DialogTitle className="heading-text">Edit Subscription</DialogTitle>
                        </DialogHeader>
                        {selectedSubscription && (
                          <SubscriptionDialog
                            subscription={selectedSubscription}
                            onClose={() => setDialogOpen(false)}
                            onSuccess={fetchSubscriptions}
                          />
                        )}
                      </DialogContent>
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          data-testid={`delete-subscription-button-${subscription.id}`}
                          size="sm"
                          variant="outline"
                          className="flex-1 lg:flex-none rounded-full text-destructive text-xs sm:text-sm"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="mx-4 sm:mx-auto">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Subscription?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this subscription and all deliveries.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(subscription.id)}
                            className="bg-destructive text-destructive-foreground"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminSubscriptions;
