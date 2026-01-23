import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { LayoutDashboard, Package, Users, TrendingUp, Search } from 'lucide-react';
import { format } from 'date-fns';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminSidebar = ({ active, navigate }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { id: 'products', label: 'Products', icon: Package, path: '/admin/products' },
    { id: 'subscriptions', label: 'Subscriptions', icon: Users, path: '/admin/subscriptions' },
    { id: 'deliveries', label: 'Deliveries', icon: TrendingUp, path: '/admin/deliveries' },
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

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
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

  const getStatusBadge = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>{status}</Badge>;
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar active="subscriptions" navigate={navigate} />
      <div className="flex-1 p-8 bg-background">
        <h1 className="text-4xl font-bold text-primary mb-8 heading-text">Manage Subscriptions</h1>

        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              data-testid="search-subscriptions-input"
              placeholder="Search by customer name, phone, or subscription ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger data-testid="status-filter-select" className="w-48">
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

        {loading ? (
          <p className="text-muted-foreground">Loading subscriptions...</p>
        ) : filteredSubscriptions.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' ? 'No subscriptions match your filters' : 'No subscriptions found'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4" data-testid="admin-subscriptions-list">
            {filteredSubscriptions.map((subscription) => (
              <Card key={subscription.id} data-testid={`admin-subscription-card-${subscription.id}`}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-primary">
                          {subscription.user?.name || 'Unknown User'}
                        </h3>
                        {getStatusBadge(subscription.status)}
                      </div>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Phone</p>
                          <p className="font-medium">{subscription.user?.phone || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Subscription ID</p>
                          <p className="font-medium font-mono">{subscription.id.slice(0, 8)}</p>
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
                          <p className="text-muted-foreground">Total Price</p>
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
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-background rounded-lg border border-border">
          <div className="grid md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{subscriptions.length}</p>
              <p className="text-sm text-muted-foreground">Total Subscriptions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary">{subscriptions.filter(s => s.status === 'active').length}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{subscriptions.filter(s => s.status === 'paused').length}</p>
              <p className="text-sm text-muted-foreground">Paused</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{subscriptions.filter(s => s.status === 'cancelled').length}</p>
              <p className="text-sm text-muted-foreground">Cancelled</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSubscriptions;
