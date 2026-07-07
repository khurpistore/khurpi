import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Percent, IndianRupee, Tag, TrendingUp, ShoppingCart, Sparkles, Gift, ArrowRight } from 'lucide-react';

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

  const getTierColor = (index) => {
    const colors = [
      { bg: 'from-blue-500 to-blue-600', light: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
      { bg: 'from-purple-500 to-purple-600', light: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
      { bg: 'from-amber-500 to-orange-500', light: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
      { bg: 'from-emerald-500 to-green-600', light: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
      {/* Header with gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-6 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Percent className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Order Discounts</h1>
                <p className="text-green-100">Automatic discounts based on order value</p>
              </div>
            </div>
          </div>
          <Button 
            onClick={() => { handleDialogClose(); setIsDialogOpen(true); }}
            className="bg-white text-green-600 hover:bg-green-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Tier
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-green-100 text-sm">Active Tiers</p>
            <p className="text-3xl font-bold">{tiers.filter(t => t.active).length}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-green-100 text-sm">Max Discount</p>
            <p className="text-3xl font-bold">{Math.max(...tiers.map(t => t.discount_percent), 0)}%</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-green-100 text-sm">Highest Threshold</p>
            <p className="text-3xl font-bold">₹{Math.max(...tiers.map(t => t.min_order_value), 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <Card className="border-dashed border-2">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">How Order Discounts Work</h3>
              <p className="text-sm text-muted-foreground">Customers automatically get discounts at checkout</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
              <ShoppingCart className="w-4 h-4 text-gray-600" />
              <span>Cart Total</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
              <TrendingUp className="w-4 h-4 text-gray-600" />
              <span>Meets Threshold</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <div className="flex items-center gap-2 px-3 py-2 bg-green-100 rounded-lg">
              <Gift className="w-4 h-4 text-green-600" />
              <span className="text-green-700 font-medium">Auto Discount Applied!</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Discount Tiers */}
      {tiers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Tag className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Discount Tiers Yet</h3>
            <p className="text-muted-foreground mb-4">Create your first discount tier to encourage larger orders.</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Tier
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Discount Tiers ({tiers.length})
          </h2>
          
          <div className="grid gap-4">
            {tiers.map((tier, index) => {
              const color = getTierColor(index);
              const savings = (tier.min_order_value * tier.discount_percent) / 100;
              
              return (
                <Card 
                  key={tier.id} 
                  className={`relative overflow-hidden transition-all hover:shadow-lg ${!tier.active ? 'opacity-60' : ''}`}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b ${color.bg}`}></div>
                  
                  <CardContent className="p-0">
                    <div className="flex items-stretch">
                      {/* Discount Badge */}
                      <div className={`w-32 flex flex-col items-center justify-center p-6 bg-gradient-to-br ${color.bg} text-white`}>
                        <span className="text-4xl font-bold">{tier.discount_percent}%</span>
                        <span className="text-sm opacity-90">OFF</span>
                      </div>
                      
                      {/* Details */}
                      <div className="flex-1 p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge variant={tier.active ? 'default' : 'secondary'} className="px-3">
                            {tier.active ? '● Active' : '○ Inactive'}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Created {new Date(tier.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-6">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Min. Order Value</p>
                            <p className="text-2xl font-bold flex items-center">
                              <IndianRupee className="w-5 h-5" />
                              {tier.min_order_value.toLocaleString()}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Customer Saves</p>
                            <p className={`text-2xl font-bold ${color.text}`}>
                              ₹{savings.toLocaleString()}+
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Example</p>
                            <div className={`p-2 rounded-lg ${color.light} ${color.border} border`}>
                              <p className="text-xs">₹{tier.min_order_value.toLocaleString()} order</p>
                              <p className={`text-sm font-semibold ${color.text}`}>
                                Pay only ₹{(tier.min_order_value - savings).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex flex-col justify-center gap-2 p-4 bg-gray-50 border-l">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(tier)}
                          className="w-full"
                        >
                          <Pencil className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(tier.id)}
                          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Percent className="w-4 h-4 text-primary" />
              </div>
              {editingTier ? 'Edit Discount Tier' : 'Create New Discount Tier'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-5 pt-4">
            <div className="space-y-2">
              <Label htmlFor="min_order_value" className="text-sm font-medium">
                Minimum Order Value
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</div>
                <Input
                  id="min_order_value"
                  type="number"
                  placeholder="1500"
                  value={formData.min_order_value}
                  onChange={(e) => setFormData({ ...formData, min_order_value: e.target.value })}
                  className="pl-8 h-12 text-lg"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Customers must spend at least this amount to qualify
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="discount_percent" className="text-sm font-medium">
                Discount Percentage
              </Label>
              <div className="relative">
                <Input
                  id="discount_percent"
                  type="number"
                  placeholder="10"
                  min="1"
                  max="100"
                  value={formData.discount_percent}
                  onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                  className="pr-8 h-12 text-lg"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</div>
              </div>
            </div>

            {/* Preview */}
            {formData.min_order_value && formData.discount_percent && (
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <p className="text-xs text-green-700 uppercase tracking-wide mb-2">Preview</p>
                <p className="text-sm text-green-800">
                  On a <span className="font-bold">₹{parseFloat(formData.min_order_value).toLocaleString()}</span> order, 
                  customer saves <span className="font-bold text-green-600">
                    ₹{((parseFloat(formData.min_order_value) * parseFloat(formData.discount_percent)) / 100).toLocaleString()}
                  </span>
                </p>
              </div>
            )}
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <Label htmlFor="active" className="text-sm font-medium">Active Status</Label>
                <p className="text-xs text-muted-foreground">Enable to apply this discount</p>
              </div>
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={handleDialogClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600">
                {editingTier ? 'Update Tier' : 'Create Tier'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      </div>
    </>
  );
};

export default AdminDiscountTiers;
