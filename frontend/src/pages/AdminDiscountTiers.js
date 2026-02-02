import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Percent, IndianRupee, Tag } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDiscountTiers = () => {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [formData, setFormData] = useState({
    min_order_value: '',
    discount_percent: '',
    active: true
  });

  useEffect(() => {
    fetchTiers();
  }, []);

  const fetchTiers = async () => {
    try {
      const res = await axios.get(`${API}/admin/discount-tiers`);
      setTiers(res.data);
    } catch (error) {
      toast.error('Failed to fetch discount tiers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.min_order_value || !formData.discount_percent) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      if (editingTier) {
        await axios.put(`${API}/admin/discount-tiers/${editingTier.id}`, {
          min_order_value: parseFloat(formData.min_order_value),
          discount_percent: parseFloat(formData.discount_percent),
          active: formData.active
        });
        toast.success('Discount tier updated');
      } else {
        await axios.post(`${API}/admin/discount-tiers`, {
          min_order_value: parseFloat(formData.min_order_value),
          discount_percent: parseFloat(formData.discount_percent),
          active: formData.active
        });
        toast.success('Discount tier created');
      }
      
      setIsDialogOpen(false);
      setEditingTier(null);
      setFormData({ min_order_value: '', discount_percent: '', active: true });
      fetchTiers();
    } catch (error) {
      toast.error('Failed to save discount tier');
    }
  };

  const handleEdit = (tier) => {
    setEditingTier(tier);
    setFormData({
      min_order_value: tier.min_order_value.toString(),
      discount_percent: tier.discount_percent.toString(),
      active: tier.active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (tierId) => {
    if (!window.confirm('Are you sure you want to delete this discount tier?')) return;
    
    try {
      await axios.delete(`${API}/admin/discount-tiers/${tierId}`);
      toast.success('Discount tier deleted');
      fetchTiers();
    } catch (error) {
      toast.error('Failed to delete discount tier');
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingTier(null);
    setFormData({ min_order_value: '', discount_percent: '', active: true });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Order Discount Tiers</h1>
          <p className="text-muted-foreground">Manage automatic discounts based on order value</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleDialogClose()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Tier
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTier ? 'Edit Discount Tier' : 'Add Discount Tier'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="min_order_value">Minimum Order Value (₹)</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="min_order_value"
                    type="number"
                    placeholder="e.g., 1500"
                    value={formData.min_order_value}
                    onChange={(e) => setFormData({ ...formData, min_order_value: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount_percent">Discount Percentage (%)</Label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="discount_percent"
                    type="number"
                    placeholder="e.g., 10"
                    value={formData.discount_percent}
                    onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="active">Active</Label>
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleDialogClose} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingTier ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Tag className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-green-800">How it works</p>
              <p className="text-sm text-green-700">
                Customers automatically get a discount when their order subtotal reaches the minimum value. 
                The highest applicable tier is applied.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tiers List */}
      {tiers.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Percent className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No discount tiers configured yet.</p>
            <p className="text-sm text-muted-foreground">Click "Add Tier" to create your first discount tier.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tiers.map((tier) => (
            <Card key={tier.id} className={`relative ${!tier.active ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Percent className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">{tier.discount_percent}%</p>
                      <p className="text-xs text-muted-foreground">OFF</p>
                    </div>
                  </div>
                  <Badge variant={tier.active ? 'default' : 'secondary'}>
                    {tier.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <IndianRupee className="w-4 h-4" />
                    <span className="text-sm">Min. Order: <span className="font-semibold text-foreground">₹{tier.min_order_value.toLocaleString()}</span></span>
                  </div>
                  
                  <div className="p-2 bg-gray-50 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Example: ₹{tier.min_order_value.toLocaleString()} order</p>
                    <p className="text-sm font-medium text-green-600">
                      Saves ₹{((tier.min_order_value * tier.discount_percent) / 100).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(tier)}
                      className="flex-1"
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(tier.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDiscountTiers;
