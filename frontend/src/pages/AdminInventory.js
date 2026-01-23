import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { LayoutDashboard, Package, Users, TrendingUp, CreditCard } from 'lucide-react';

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

const AdminInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    fetchInventory();
  }, [user, navigate]);

  const fetchInventory = async () => {
    try {
      const response = await axios.get(`${API}/admin/inventory`);
      setInventory(response.data);
    } catch (error) {
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar active="inventory" navigate={navigate} />
      <div className="flex-1 p-8 bg-background">
        <h1 className="text-4xl font-bold text-primary mb-8 heading-text">Inventory Planning</h1>

        {loading ? (
          <p className="text-muted-foreground">Loading inventory data...</p>
        ) : inventory.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No active subscriptions to plan inventory</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="inventory-grid">
            {inventory.map((item) => (
              <Card key={item.product_id} data-testid={`inventory-card-${item.product_id}`}>
                <CardHeader>
                  <CardTitle className="heading-text">{item.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Growth Days:</span>
                      <span className="font-semibold">{item.growth_days} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Weekly Demand:</span>
                      <span className="font-semibold">{item.weekly_demand} trays</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bi-Weekly:</span>
                      <span className="font-semibold">{item.bi_weekly_demand} trays</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monthly:</span>
                      <span className="font-semibold">{item.monthly_demand} trays</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between">
                      <span className="font-medium">Total Trays Needed:</span>
                      <span className="text-xl font-bold text-primary">{item.total_trays}</span>
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

export default AdminInventory;