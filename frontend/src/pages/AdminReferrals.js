import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit2, Trash2, Users, IndianRupee, Copy, Check, Gift, TrendingUp, UserCheck, Building } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminReferrals = () => {
  const [referrers, setReferrers] = useState([]);
  const [referralStats, setReferralStats] = useState({ total_referrers: 0, total_referrals: 0, total_commission: 0, pending_commission: 0 });
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReferrer, setEditingReferrer] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    commission_rate: '10',
    referral_code: '',
    is_active: true
  });
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    fetchReferrers();
    fetchStats();
  }, [navigate]);

  const fetchReferrers = async () => {
    try {
      const response = await axios.get(`${API}/admin/referrers`);
      // Sort by created_at descending (recent first)
      const sorted = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setReferrers(sorted);
    } catch (error) {
      console.error('Failed to fetch referrers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/admin/referral-stats`);
      setReferralStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  // Filter referrers based on tab
  const customerReferrers = referrers.filter(r => r.is_customer || r.user_id);
  const externalReferrers = referrers.filter(r => !r.is_customer && !r.user_id);
  
  const filteredReferrers = activeTab === 'all' 
    ? referrers 
    : activeTab === 'customers' 
      ? customerReferrers 
      : externalReferrers;

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      commission_rate: '10',
      referral_code: '',
      is_active: true
    });
    setEditingReferrer(null);
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'REF';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, referral_code: code }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      commission_rate: parseFloat(formData.commission_rate) || 10
    };

    try {
      if (editingReferrer) {
        await axios.put(`${API}/admin/referrers/${editingReferrer.id}`, payload);
        toast.success('Referrer updated successfully');
      } else {
        await axios.post(`${API}/admin/referrers`, payload);
        toast.success('Referrer registered successfully');
      }
      setIsDialogOpen(false);
      resetForm();
      fetchReferrers();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save referrer');
    }
  };

  const handleEdit = (referrer) => {
    setEditingReferrer(referrer);
    setFormData({
      name: referrer.name,
      phone: referrer.phone,
      email: referrer.email || '',
      commission_rate: referrer.commission_rate.toString(),
      referral_code: referrer.referral_code,
      is_active: referrer.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (referrerId) => {
    if (!window.confirm('Are you sure you want to delete this referrer? This will also remove their referral history.')) return;
    
    try {
      await axios.delete(`${API}/admin/referrers/${referrerId}`);
      toast.success('Referrer deleted');
      fetchReferrers();
      fetchStats();
    } catch (error) {
      toast.error('Failed to delete referrer');
    }
  };

  const handlePayCommission = async (referrerId) => {
    try {
      await axios.post(`${API}/admin/referrers/${referrerId}/pay-commission`);
      toast.success('Commission marked as paid');
      fetchReferrers();
      fetchStats();
    } catch (error) {
      toast.error('Failed to process payment');
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">Referral Program</h1>
            <p className="text-muted-foreground">Manage referrers and track commissions</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="rounded-full">
                <Plus className="w-4 h-4 mr-2" />
                Register Referrer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingReferrer ? 'Edit Referrer' : 'Register New Referrer'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Full Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter referrer's name"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Phone Number *</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email (optional)"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Commission Rate (%) *</Label>
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.commission_rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, commission_rate: e.target.value }))}
                    placeholder="10"
                    required
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Percentage of order value referrer earns
                  </p>
                </div>

                <div>
                  <Label>Referral Code *</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={formData.referral_code}
                      onChange={(e) => setFormData(prev => ({ ...prev, referral_code: e.target.value.toUpperCase() }))}
                      placeholder="e.g., REFABC123"
                      required
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" onClick={generateCode}>
                      Generate
                    </Button>
                  </div>
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
                    {editingReferrer ? 'Update' : 'Register'} Referrer
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
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{referralStats.total_referrers}</p>
                  <p className="text-sm text-muted-foreground">Total Referrers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Gift className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{referralStats.total_referrals}</p>
                  <p className="text-sm text-muted-foreground">Total Referrals</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <IndianRupee className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">₹{referralStats.total_commission}</p>
                  <p className="text-sm text-muted-foreground">Total Commission</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">₹{referralStats.pending_commission}</p>
                  <p className="text-sm text-muted-foreground">Pending Payout</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referrers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Referral Program Members</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  All ({referrers.length})
                </TabsTrigger>
                <TabsTrigger value="customers" className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  Customers ({customerReferrers.length})
                </TabsTrigger>
                <TabsTrigger value="external" className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  External ({externalReferrers.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading...</div>
            ) : filteredReferrers.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {activeTab === 'customers' 
                    ? 'No customers have generated referral codes yet'
                    : activeTab === 'external'
                      ? 'No external referrers registered yet'
                      : 'No referrers registered yet'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Referral Code</TableHead>
                      <TableHead className="hidden sm:table-cell">Phone</TableHead>
                      <TableHead className="hidden md:table-cell">Commission %</TableHead>
                      <TableHead>Referrals</TableHead>
                      <TableHead>Earned</TableHead>
                      <TableHead className="hidden sm:table-cell">Pending</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReferrers.map((referrer) => (
                      <TableRow key={referrer.id}>
                        <TableCell>
                          <Badge variant="outline" className={referrer.is_customer || referrer.user_id ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-purple-200 bg-purple-50 text-purple-700'}>
                            {referrer.is_customer || referrer.user_id ? (
                              <><UserCheck className="w-3 h-3 mr-1" />Customer</>
                            ) : (
                              <><Building className="w-3 h-3 mr-1" />External</>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{referrer.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="bg-green-50 text-green-700 px-2 py-1 rounded font-mono text-sm">
                              {referrer.referral_code}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyCode(referrer.referral_code)}
                              className="h-6 w-6 p-0"
                            >
                              {copiedCode === referrer.referral_code ? (
                                <Check className="w-3 h-3 text-green-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{referrer.phone}</TableCell>
                        <TableCell className="hidden md:table-cell">{referrer.commission_rate}%</TableCell>
                        <TableCell>{referrer.total_referrals || 0}</TableCell>
                        <TableCell className="font-semibold text-green-600">
                          ₹{referrer.total_earned || 0}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span className="text-amber-600 font-medium">₹{referrer.pending_amount || 0}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={referrer.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
                            {referrer.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {referrer.pending_amount > 0 && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handlePayCommission(referrer.id)}
                                className="text-green-600 border-green-200 hover:bg-green-50"
                              >
                                Pay ₹{referrer.pending_amount}
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(referrer)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDelete(referrer.id)}
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
    </>
  );
};

export default AdminReferrals;
