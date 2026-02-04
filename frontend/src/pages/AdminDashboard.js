import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import AdminLayout from '@/components/AdminLayout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API}/admin/dashboard`);
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout active="dashboard" title="Dashboard">
      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6" data-testid="admin-dashboard-stats">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Total Subs
              </CardTitle>
              <Users className="w-4 h-4 text-muted-foreground hidden sm:block" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary" data-testid="total-subscriptions">
                {stats?.total_subscriptions || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Active
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground hidden sm:block" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-secondary" data-testid="active-subscriptions">
                {stats?.active_subscriptions || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Today
              </CardTitle>
              <Package className="w-4 h-4 text-muted-foreground hidden sm:block" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary" data-testid="today-deliveries">
                {stats?.today_deliveries || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Revenue
              </CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground hidden sm:block" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary" data-testid="total-revenue">
                ₹{stats?.total_revenue || 0}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mt-6 sm:mt-8">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="heading-text text-base sm:text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-4 sm:p-6 pt-0">
            <Button
              data-testid="view-deliveries-button"
              onClick={() => navigate('/admin/deliveries')}
              className="bg-primary hover:bg-primary/90 rounded-full w-full sm:w-auto"
            >
              View Today's Deliveries
            </Button>
            <Button
              data-testid="manage-products-button"
              onClick={() => navigate('/admin/products')}
              variant="outline"
              className="rounded-full w-full sm:w-auto"
            >
              Manage Products
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
