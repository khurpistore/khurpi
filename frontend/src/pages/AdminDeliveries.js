import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Download, Pencil, Phone, MapPin, Package, Calendar, AlertTriangle, PauseCircle } from 'lucide-react';
import { format } from 'date-fns';
import AdminLayout from '@/components/AdminLayout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DeliveryDialog = ({ delivery, onClose, onSuccess }) => {
  const [status, setStatus] = useState(delivery?.status || 'scheduled');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(`${API}/admin/deliveries/${delivery.id}`, { status });
      toast.success('Delivery status updated successfully');
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
        <Label className="text-sm">Delivery Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger data-testid="delivery-status-select" className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="skipped">Skipped</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        data-testid="save-delivery-button"
        type="submit"
        disabled={loading}
        className="w-full bg-primary hover:bg-primary/90 rounded-full"
      >
        {loading ? 'Saving...' : 'Update Status'}
      </Button>
    </form>
  );
};

const AdminDeliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const response = await axios.get(`${API}/admin/deliveries/today`);
      setDeliveries(response.data);
    } catch (error) {
      toast.error('Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.get(`${API}/admin/deliveries/export`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `deliveries_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Delivery list exported successfully');
    } catch (error) {
      toast.error('Failed to export delivery list');
    }
  };

  const openDialog = (delivery) => {
    setSelectedDelivery(delivery);
    setDialogOpen(true);
  };

  const getStatusBadge = (status) => {
    const config = {
      scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Scheduled' },
      delivered: { color: 'bg-green-100 text-green-800', label: 'Delivered' },
      skipped: { color: 'bg-yellow-100 text-yellow-800', label: 'Skipped' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Failed' },
      cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelled' }
    };
    const { color, label } = config[status] || config.cancelled;
    return <Badge className={color}>{label}</Badge>;
  };

  const getSubscriptionStatusBadge = (status) => {
    const config = {
      active: { color: 'bg-green-50 text-green-700 border-green-200', label: 'Active Sub' },
      paused: { color: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Paused Sub' },
      cancelled: { color: 'bg-red-50 text-red-700 border-red-200', label: 'Cancelled Sub' }
    };
    const { color, label } = config[status] || config.active;
    return <Badge variant="outline" className={`${color} text-xs`}>{label}</Badge>;
  };

  const formatFrequency = (frequency) => {
    const map = {
      'once_week': '1x/week',
      'twice_week': '2x/week',
      'four_days_week': '4x/week'
    };
    return map[frequency] || frequency;
  };

  // Count stats
  const scheduledCount = deliveries.filter(d => d.status === 'scheduled').length;
  const deliveredCount = deliveries.filter(d => d.status === 'delivered').length;
  const skippedCount = deliveries.filter(d => d.status === 'skipped' || d.is_skipped).length;
  const pausedSubCount = deliveries.filter(d => d.subscription_status === 'paused').length;

  return (
    <AdminLayout active="deliveries" title="Today's Deliveries">
      {/* Header with Export */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <p className="text-lg font-medium">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
          <p className="text-sm text-muted-foreground">
            {deliveries.length} total deliveries
          </p>
        </div>
        <Button
          data-testid="export-deliveries-button"
          onClick={handleExport}
          className="bg-primary hover:bg-primary/90 rounded-full w-full sm:w-auto"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="mb-6 p-4 bg-white rounded-lg border border-border">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">{scheduledCount}</p>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{deliveredCount}</p>
            <p className="text-xs text-muted-foreground">Delivered</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600">{skippedCount}</p>
            <p className="text-xs text-muted-foreground">Skipped</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-600">{pausedSubCount}</p>
            <p className="text-xs text-muted-foreground">Paused Subs</p>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading deliveries...</p>
      ) : deliveries.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No deliveries scheduled for today</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4" data-testid="deliveries-list">
          {deliveries.map((delivery) => (
            <Card 
              key={delivery.id} 
              data-testid={`delivery-card-${delivery.id}`}
              className={`${delivery.subscription_status === 'paused' ? 'border-amber-300 bg-amber-50/30' : ''} 
                         ${delivery.is_skipped || delivery.status === 'skipped' ? 'border-yellow-300 bg-yellow-50/30' : ''}`}
            >
              <CardContent className="p-5">
                {/* Alerts for paused/skipped */}
                {(delivery.subscription_status === 'paused' || delivery.is_skipped) && (
                  <div className={`flex items-center gap-2 mb-3 p-2 rounded-lg text-sm
                    ${delivery.subscription_status === 'paused' ? 'bg-amber-100 text-amber-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {delivery.subscription_status === 'paused' ? (
                      <>
                        <PauseCircle className="w-4 h-4" />
                        <span>Subscription is PAUSED - Confirm before delivery</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4" />
                        <span>Customer requested to SKIP this delivery</span>
                      </>
                    )}
                  </div>
                )}

                <div className="flex flex-col lg:flex-row lg:justify-between gap-4">
                  {/* Customer Info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <h3 className="text-lg font-semibold text-primary">
                        {delivery.user?.name || 'Unknown'}
                      </h3>
                      {getStatusBadge(delivery.status)}
                      {getSubscriptionStatusBadge(delivery.subscription_status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      {/* Contact */}
                      <div className="flex items-start gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">{delivery.user?.phone || 'N/A'}</p>
                        </div>
                      </div>
                      
                      {/* Plan */}
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm">
                            <span className="font-medium">{formatFrequency(delivery.subscription_frequency)}</span>
                            {delivery.delivery_days?.length > 0 && (
                              <span className="text-muted-foreground"> • {delivery.delivery_days.join(', ')}</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-2 mb-4">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">{delivery.delivery_address}</p>
                    </div>

                    {/* Products */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-4 h-4 text-primary" />
                        <p className="text-sm font-medium">Products ({delivery.total_items} items)</p>
                        {delivery.delivery_time && (
                          <Badge variant="outline" className="ml-auto text-xs">
                            🕐 {delivery.delivery_time}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {delivery.products?.map((product, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm bg-white rounded-lg px-3 py-2 border">
                            {product.image && (
                              <img 
                                src={product.image} 
                                alt={product.name} 
                                className="w-8 h-8 rounded object-cover"
                              />
                            )}
                            <div>
                              <span className="font-medium">{product.name}</span>
                              <span className="text-muted-foreground ml-1">
                                {product.weight ? `${product.weight}g` : `× ${product.quantity}`}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Total Weight */}
                      {delivery.products?.some(p => p.weight) && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          Total: <span className="font-medium text-primary">
                            {delivery.products.reduce((sum, p) => sum + (p.weight || 0), 0)}g
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row lg:flex-col gap-2 lg:min-w-[140px]">
                    <div className="text-sm mb-2 hidden lg:block">
                      <p className="text-muted-foreground text-xs">Monthly Value</p>
                      <p className="font-semibold text-primary">₹{delivery.monthly_total}</p>
                    </div>
                    <Dialog open={dialogOpen && selectedDelivery?.id === delivery.id} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          data-testid={`edit-delivery-button-${delivery.id}`}
                          size="sm"
                          variant="outline"
                          onClick={() => openDialog(delivery)}
                          className="flex-1 lg:w-full rounded-full"
                        >
                          <Pencil className="w-4 h-4 mr-1" />
                          Update Status
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg mx-4 sm:mx-auto">
                        <DialogHeader>
                          <DialogTitle>Update Delivery Status</DialogTitle>
                        </DialogHeader>
                        {selectedDelivery && (
                          <DeliveryDialog
                            delivery={selectedDelivery}
                            onClose={() => setDialogOpen(false)}
                            onSuccess={fetchDeliveries}
                          />
                        )}
                      </DialogContent>
                    </Dialog>
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

export default AdminDeliveries;
