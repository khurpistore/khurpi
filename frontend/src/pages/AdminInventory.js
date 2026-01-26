import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import AdminLayout from '@/components/AdminLayout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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
    <AdminLayout active="inventory" title="Inventory Planning">
      {loading ? (
        <p className="text-muted-foreground">Loading inventory data...</p>
      ) : inventory.length === 0 ? (
        <Card>
          <CardContent className="p-8 sm:p-12 text-center">
            <p className="text-muted-foreground">No active subscriptions to plan inventory</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6" data-testid="inventory-grid">
          {inventory.map((item) => (
            <Card key={item.product_id} data-testid={`inventory-card-${item.product_id}`}>
              <CardHeader className="p-4 sm:p-6 pb-2">
                <CardTitle className="heading-text text-base sm:text-lg">{item.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-2">
                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Growth Days:</span>
                    <span className="font-semibold">{item.growth_days} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Weekly:</span>
                    <span className="font-semibold">{item.weekly_demand} packs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bi-Weekly:</span>
                    <span className="font-semibold">{item.bi_weekly_demand} packs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly:</span>
                    <span className="font-semibold">{item.monthly_demand} packs</span>
                  </div>
                  <div className="border-t pt-2 sm:pt-3 flex justify-between">
                    <span className="font-medium">Total Needed:</span>
                    <span className="text-lg sm:text-xl font-bold text-primary">{item.total_trays}</span>
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

export default AdminInventory;
