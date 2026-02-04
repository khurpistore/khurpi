import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit2, Trash2, Tag, Percent, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_amount: '',
    max_discount: '',
    usage_limit: '',
    per_user_limit: '1',
    valid_from: '',
    valid_until: '',
    unlimited_validity: true,
    is_active: true,
    description: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    fetchCoupons();
  }, [navigate]);

  const fetchCoupons = async () => {
    try {
      const response = await axios.get(`${API}/admin/coupons`);
      // Sort by created_at descending (recent first)
      const sorted = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setCoupons(sorted);
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discount_type: 'percentage',
      discount_value: '',
      min_order_amount: '',
      max_discount: '',
      usage_limit: '',
      per_user_limit: '1',
      valid_from: '',
      valid_until: '',
      unlimited_validity: true,
      is_active: true,
      description: ''
    });
    setEditingCoupon(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      discount_value: parseFloat(formData.discount_value) || 0,
      min_order_amount: parseFloat(formData.min_order_amount) || 0,
      max_discount: parseFloat(formData.max_discount) || null,
      usage_limit: parseInt(formData.usage_limit) || null,
      per_user_limit: parseInt(formData.per_user_limit) || 1,
      valid_from: formData.unlimited_validity ? null : formData.valid_from || null,
      valid_until: formData.unlimited_validity ? null : formData.valid_until || null
    };
    delete payload.unlimited_validity;

    try {
      if (editingCoupon) {
        await axios.put(`${API}/admin/coupons/${editingCoupon.id}`, payload);
        toast.success('Coupon updated successfully');
      } else {
        await axios.post(`${API}/admin/coupons`, payload);
        toast.success('Coupon created successfully');
      }
      setIsDialogOpen(false);
      resetForm();
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save coupon');
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toString(),
      min_order_amount: coupon.min_order_amount?.toString() || '',
      max_discount: coupon.max_discount?.toString() || '',
      usage_limit: coupon.usage_limit?.toString() || '',
      valid_from: coupon.valid_from?.split('T')[0] || '',
      valid_until: coupon.valid_until?.split('T')[0] || '',
      is_active: coupon.is_active,
      description: coupon.description || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (couponId) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    
    try {
      await axios.delete(`${API}/admin/coupons/${couponId}`);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to delete coupon');
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      await axios.put(`${API}/admin/coupons/${coupon.id}`, {
        ...coupon,
        is_active: !coupon.is_active
      });
      toast.success(`Coupon ${coupon.is_active ? 'deactivated' : 'activated'}`);
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to update coupon');
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'KHURPI';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">Discount Coupons</h1>
            <p className="text-muted-foreground">Manage promotional codes and discounts</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="rounded-full">
                <Plus className="w-4 h-4 mr-2" />
                Create Coupon
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Coupon Code *</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      placeholder="e.g., SAVE20"
                      required
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" onClick={generateCode}>
                      Generate
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Discount Type *</Label>
                    <Select
                      value={formData.discount_type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, discount_type: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Discount Value *</Label>
                    <Input
                      type="number"
                      value={formData.discount_value}
                      onChange={(e) => setFormData(prev => ({ ...prev, discount_value: e.target.value }))}
                      placeholder={formData.discount_type === 'percentage' ? '10' : '100'}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Min Order Amount</Label>
                    <Input
                      type="number"
                      value={formData.min_order_amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, min_order_amount: e.target.value }))}
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Max Discount (₹)</Label>
                    <Input
                      type="number"
                      value={formData.max_discount}
                      onChange={(e) => setFormData(prev => ({ ...prev, max_discount: e.target.value }))}
                      placeholder="No limit"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Valid From</Label>
                    <Input
                      type="date"
                      value={formData.valid_from}
                      onChange={(e) => setFormData(prev => ({ ...prev, valid_from: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Valid Until</Label>
                    <Input
                      type="date"
                      value={formData.valid_until}
                      onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Usage Limit</Label>
                  <Input
                    type="number"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData(prev => ({ ...prev, usage_limit: e.target.value }))}
                    placeholder="Unlimited"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="e.g., First order discount"
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingCoupon ? 'Update' : 'Create'} Coupon
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Tag className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{coupons.length}</p>
                  <p className="text-sm text-muted-foreground">Total Coupons</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{coupons.filter(c => c.is_active).length}</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Percent className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{coupons.filter(c => c.discount_type === 'percentage').length}</p>
                  <p className="text-sm text-muted-foreground">Percentage</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Tag className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{coupons.reduce((sum, c) => sum + (c.times_used || 0), 0)}</p>
                  <p className="text-sm text-muted-foreground">Total Uses</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coupons Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading...</div>
            ) : coupons.length === 0 ? (
              <div className="p-8 text-center">
                <Tag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No coupons created yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead className="hidden sm:table-cell">Min Order</TableHead>
                      <TableHead className="hidden md:table-cell">Validity</TableHead>
                      <TableHead className="hidden sm:table-cell">Used</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coupons.map((coupon) => (
                      <TableRow key={coupon.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="bg-gray-100 px-2 py-1 rounded font-mono text-sm">
                              {coupon.code}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyCode(coupon.code)}
                              className="h-6 w-6 p-0"
                            >
                              {copiedCode === coupon.code ? (
                                <Check className="w-3 h-3 text-green-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-green-600">
                            {coupon.discount_type === 'percentage' 
                              ? `${coupon.discount_value}%` 
                              : `₹${coupon.discount_value}`}
                          </span>
                          {coupon.max_discount && (
                            <span className="text-xs text-muted-foreground block">
                              Max: ₹{coupon.max_discount}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {coupon.min_order_amount ? `₹${coupon.min_order_amount}` : '-'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">
                          {coupon.valid_from && coupon.valid_until ? (
                            <span>
                              {format(new Date(coupon.valid_from), 'dd/MM')} - {format(new Date(coupon.valid_until), 'dd/MM/yy')}
                            </span>
                          ) : coupon.valid_until ? (
                            <span>Until {format(new Date(coupon.valid_until), 'dd/MM/yy')}</span>
                          ) : (
                            'No expiry'
                          )}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {coupon.times_used || 0}
                          {coupon.usage_limit && `/${coupon.usage_limit}`}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={`cursor-pointer ${coupon.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
                            onClick={() => handleToggleActive(coupon)}
                          >
                            {coupon.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(coupon)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDelete(coupon.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminCoupons;
