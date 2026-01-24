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
import { Download, Pencil } from 'lucide-react';
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
  const { user } = useAuth();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    fetchDeliveries();
  }, [user, navigate]);

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

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      skipped: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <AdminLayout active="deliveries" title="Today's Deliveries">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <p className="text-sm text-muted-foreground">
          {deliveries.length} deliveries scheduled for today
        </p>
        <Button
          data-testid="export-deliveries-button"
          onClick={handleExport}
          className="bg-primary hover:bg-primary/90 rounded-full w-full sm:w-auto"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading deliveries...</p>
      ) : deliveries.length === 0 ? (
        <Card>
          <CardContent className="p-8 sm:p-12 text-center">
            <p className="text-muted-foreground">No deliveries scheduled for today</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4" data-testid="deliveries-list">
          {deliveries.map((delivery) => (
            <Card key={delivery.id} data-testid={`delivery-card-${delivery.id}`}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="text-base sm:text-lg font-semibold text-primary">
                        {delivery.user?.name || 'Unknown'}
                      </h3>
                      <Badge className={getStatusColor(delivery.status)}>{delivery.status}</Badge>
                    </div>
                    <div className="space-y-1 text-xs sm:text-sm mb-3">
                      <p className="text-muted-foreground">
                        <span className="font-medium">Phone:</span> {delivery.user?.phone || 'N/A'}
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium">Address:</span> {delivery.user?.address || 'No address provided'}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs sm:text-sm font-medium mb-2">Products:</p>
                      <div className="space-y-1">
                        {delivery.products?.map((product, idx) => (
                          <p key={idx} className="text-xs sm:text-sm text-muted-foreground">
                            {product.name} × {product.quantity}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="text-xs sm:text-sm text-right lg:text-left mb-2">
                      <p className="text-muted-foreground">Subscription ID</p>
                      <p className="font-mono">{delivery.subscription_id.slice(0, 8)}</p>
                    </div>
                    <Dialog open={dialogOpen && selectedDelivery?.id === delivery.id} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          data-testid={`edit-delivery-button-${delivery.id}`}
                          size="sm"
                          variant="outline"
                          onClick={() => openDialog(delivery)}
                          className="rounded-full text-xs sm:text-sm"
                        >
                          <Pencil className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Update Status
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg mx-4 sm:mx-auto">
                        <DialogHeader>
                          <DialogTitle className="heading-text">Update Delivery Status</DialogTitle>
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
