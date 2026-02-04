import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Search, Package, MapPin, Calendar, Phone, ChevronRight, Repeat, User, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import AdminLayout from '@/components/AdminLayout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getPlanDisplayName = (frequency) => {
  const planNames = {
    'once_week': 'Fresh Start',
    'twice_week': 'Balanced',
    'four_days_week': 'Power Greens',
    'daily': 'Daily'
  };
  return planNames[frequency] || frequency?.replace(/_/g, ' ');
};

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    fetchSubscriptions();
  }, [user, navigate]);

  const fetchSubscriptions = async () => {
    try {
      const response = await axios.get(`${API}/admin/subscriptions`);
      // Sort by created_at descending
      const sorted = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setSubscriptions(sorted);
    } catch (error) {
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const updateSubscriptionStatus = async (subId, newStatus) => {
    setUpdatingStatus(subId);
    try {
      await axios.put(`${API}/admin/subscriptions/${subId}`, { status: newStatus });
      setSubscriptions(prev => prev.map(sub => 
        sub.id === subId ? { ...sub, status: newStatus } : sub
      ));
      if (selectedSubscription?.id === subId) {
        setSelectedSubscription(prev => ({ ...prev, status: newStatus }));
      }
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800'
    };
    return (
      <Badge className={`${colors[status] || 'bg-gray-100 text-gray-800'} text-xs capitalize`}>
        {status?.replace(/_/g, ' ')}
      </Badge>
    );
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = 
      sub.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.user?.phone?.includes(searchTerm) ||
      sub.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter(s => s.status === 'active').length,
    paused: subscriptions.filter(s => s.status === 'paused').length,
    cancelled: subscriptions.filter(s => s.status === 'cancelled').length,
    expired: subscriptions.filter(s => s.status === 'expired').length
  };

  if (loading) {
    return (
      <AdminLayout active="subscriptions" title="Subscriptions">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout active="subscriptions" title="Subscriptions">
      <div className="flex gap-6">
        {/* Left: Subscriptions List */}
        <div className="flex-1">
          {/* Stats Row */}
          <div className="grid grid-cols-5 gap-3 mb-4">
            <div className="bg-white rounded-lg p-3 border">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border">
              <p className="text-xs text-muted-foreground">Active</p>
              <p className="text-xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border">
              <p className="text-xs text-muted-foreground">Paused</p>
              <p className="text-xl font-bold text-yellow-600">{stats.paused}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border">
              <p className="text-xs text-muted-foreground">Cancelled</p>
              <p className="text-xl font-bold text-red-600">{stats.cancelled}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border">
              <p className="text-xs text-muted-foreground">Expired</p>
              <p className="text-xl font-bold text-gray-600">{stats.expired}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                data-testid="search-subscriptions"
                placeholder="Search name, phone, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 h-9" data-testid="status-filter">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Subscriptions List */}
          <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {filteredSubscriptions.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Repeat className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                  <h3 className="font-semibold mb-1">No Subscriptions Found</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Subscriptions will appear here'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredSubscriptions.map((subscription) => {
                const productImages = subscription.items?.slice(0, 3).map(item => item.product?.image).filter(Boolean) || [];
                const isSelected = selectedSubscription?.id === subscription.id;

                return (
                  <Card 
                    key={subscription.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-primary shadow-md' : ''}`}
                    onClick={() => setSelectedSubscription(subscription)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        {/* Product Images */}
                        <div className="flex -space-x-2 flex-shrink-0">
                          {productImages.length > 0 ? (
                            productImages.map((img, idx) => (
                              <img 
                                key={idx}
                                src={img} 
                                alt=""
                                className="w-11 h-11 rounded-lg object-cover border-2 border-white shadow-sm"
                              />
                            ))
                          ) : (
                            <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Package className="w-5 h-5 text-primary" />
                            </div>
                          )}
                          {subscription.items?.length > 3 && (
                            <div className="w-11 h-11 rounded-lg bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium">
                              +{subscription.items.length - 3}
                            </div>
                          )}
                        </div>

                        {/* Subscription Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                            {getStatusBadge(subscription.status)}
                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                              {getPlanDisplayName(subscription.frequency)}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium truncate">
                            {subscription.user?.name || 'Unknown'} • {subscription.user?.phone || 'N/A'}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>#{subscription.id?.slice(0, 6)}</span>
                            <span>•</span>
                            <span>{subscription.delivery_days?.join(', ') || subscription.delivery_day || '-'}</span>
                          </div>
                        </div>

                        {/* Next Delivery */}
                        <div className="text-right flex-shrink-0">
                          {subscription.next_delivery_date && subscription.status !== 'cancelled' && subscription.status !== 'expired' ? (
                            <>
                              <p className="text-xs text-muted-foreground">Next Delivery</p>
                              <p className="text-sm font-semibold text-green-700">
                                {format(new Date(subscription.next_delivery_date), 'MMM d')}
                              </p>
                            </>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-600 text-xs capitalize">
                              {subscription.status?.replace(/_/g, ' ')}
                            </Badge>
                          )}
                        </div>

                        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Subscription Details Panel */}
        <div className="w-96 flex-shrink-0">
          {selectedSubscription ? (
            <Card className="sticky top-4 max-h-[calc(100vh-120px)] overflow-y-auto">
              <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-bold text-lg">#{selectedSubscription.id?.slice(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground">
                      Created {format(new Date(selectedSubscription.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                  {getStatusBadge(selectedSubscription.status)}
                </div>

                {/* Customer Info */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-sm">Customer</span>
                  </div>
                  <p className="font-medium">{selectedSubscription.user?.name || 'Unknown'}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {selectedSubscription.user?.phone || 'N/A'}
                  </p>
                </div>

                {/* Plan Details */}
                <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Repeat className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-sm text-blue-800">Plan Details</span>
                    <Badge className="bg-blue-100 text-blue-800 text-xs ml-auto">
                      {getPlanDisplayName(selectedSubscription.frequency)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-blue-600">Delivery Days</p>
                      <p className="font-medium">{selectedSubscription.delivery_days?.join(', ') || selectedSubscription.delivery_day || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600">Start Date</p>
                      <p className="font-medium">{selectedSubscription.start_date ? format(new Date(selectedSubscription.start_date), 'MMM d, yyyy') : '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600">Next Delivery</p>
                      <p className="font-medium text-green-700">
                        {selectedSubscription.next_delivery_date && selectedSubscription.status !== 'cancelled'
                          ? format(new Date(selectedSubscription.next_delivery_date), 'MMM d')
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600">Total Qty</p>
                      <p className="font-medium">{selectedSubscription.tray_count || selectedSubscription.items?.reduce((sum, item) => sum + (item.quantity || 100), 0) || 0}gm</p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="mb-4">
                  <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" />
                    Items ({selectedSubscription.items?.length || 0})
                  </p>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {selectedSubscription.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                        {item.product?.image ? (
                          <img src={item.product.image} alt="" className="w-9 h-9 rounded object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded bg-gray-200 flex items-center justify-center">
                            <Package className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.product?.name || `Product ${idx + 1}`}</p>
                          <p className="text-xs text-muted-foreground">{item.quantity}gm</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Address */}
                {selectedSubscription.address && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-sm">Delivery Address</span>
                    </div>
                    {(selectedSubscription.address.receiver_name || selectedSubscription.address.name) && (
                      <p className="font-medium text-primary">{selectedSubscription.address.receiver_name || selectedSubscription.address.name}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{selectedSubscription.address.address_line}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedSubscription.address.city} - {selectedSubscription.address.pincode}
                    </p>
                    {selectedSubscription.address.phone && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Phone className="w-3 h-3" /> +91 {selectedSubscription.address.phone}
                      </p>
                    )}
                  </div>
                )}

                {/* Status Update */}
                <div>
                  <p className="font-semibold text-sm mb-2">Update Status</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['active', 'paused', 'cancelled', 'expired'].map((status) => (
                      <Button
                        key={status}
                        variant={selectedSubscription.status === status ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateSubscriptionStatus(selectedSubscription.id, status)}
                        disabled={updatingStatus === selectedSubscription.id}
                        className="text-xs capitalize"
                        data-testid={`status-btn-${status}`}
                      >
                        {updatingStatus === selectedSubscription.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          status
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-4">
              <CardContent className="p-8 text-center">
                <Repeat className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-semibold mb-1">Select a Subscription</h3>
                <p className="text-sm text-muted-foreground">Click on a subscription to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSubscriptions;
