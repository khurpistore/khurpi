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
import { LayoutDashboard, Package, Users, TrendingUp, Download, Pencil, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminSidebar = ({ active, navigate }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { id: 'users', label: 'Users', icon: Users, path: '/admin/users' },
    { id: 'products', label: 'Products', icon: Package, path: '/admin/products' },
    { id: 'subscriptions', label: 'Subscriptions', icon: Users, path: '/admin/subscriptions' },
    { id: 'deliveries', label: 'Deliveries', icon: TrendingUp, path: '/admin/deliveries' },
    { id: 'payments', label: 'Payments', icon: CreditCard, path: '/admin/payments' },
    { id: 'inventory', label: 'Inventory', icon: Package, path: '/admin/inventory' }
  ];

  return (
    <div className="w-64 bg-primary text-white min-h-screen p-6">
      <h2 className="text-2xl font-bold mb-8 heading-text">Khurpi Admin</h2>
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                active === item.id ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

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
        <Label>Delivery Status</Label>
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

  return (
    <div className="flex min-h-screen">
      <AdminSidebar active="deliveries" navigate={navigate} />
      <div className="flex-1 p-8 bg-background">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-primary heading-text">Today's Deliveries</h1>
          <Button
            data-testid="export-deliveries-button"
            onClick={handleExport}
            className="bg-primary hover:bg-primary/90 rounded-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading deliveries...</p>
        ) : deliveries.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No deliveries scheduled for today</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4" data-testid="deliveries-list">
            {deliveries.map((delivery) => (
              <Card key={delivery.id} data-testid={`delivery-card-${delivery.id}`}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-primary">
                          {delivery.user?.name || 'Unknown'}
                        </h3>
                        <Badge className="bg-secondary/20 text-secondary">{delivery.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Phone: {delivery.user?.phone || 'N/A'}
                      </p>
                      <p className="text-sm text-muted-foreground mb-3">
                        Address: {delivery.user?.address || 'No address provided'}
                      </p>
                      <div className="bg-background rounded-lg p-3">
                        <p className="text-sm font-medium mb-2">Products:</p>
                        {delivery.products?.map((product, idx) => (
                          <p key={idx} className="text-sm text-muted-foreground">
                            {product.name} × {product.quantity}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Subscription ID</p>
                      <p className="text-sm font-mono">{delivery.subscription_id.slice(0, 8)}</p>
                    </div>
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

export default AdminDeliveries;