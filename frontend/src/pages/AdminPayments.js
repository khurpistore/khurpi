import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Search } from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import AdminLayout from '@/components/AdminLayout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Safe date formatter to handle invalid dates
const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr);
    return isValid(date) ? format(date, 'PP') : 'N/A';
  } catch {
    return 'N/A';
  }
};
const API = `${BACKEND_URL}/api`;

const PaymentDialog = ({ payment, onClose, onSuccess }) => {
  const [status, setStatus] = useState(payment?.status || 'success');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(`${API}/admin/payments/${payment.id}`, { status });
      toast.success('Payment updated successfully');
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
        <Label className="text-sm">Payment Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger data-testid="payment-status-select" className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        data-testid="save-payment-button"
        type="submit"
        disabled={loading}
        className="w-full bg-primary hover:bg-primary/90 rounded-full"
      >
        {loading ? 'Saving...' : 'Update Payment'}
      </Button>
    </form>
  );
};

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    fetchPayments();
  }, [user, navigate]);

  useEffect(() => {
    filterPayments();
  }, [payments, searchTerm, statusFilter]);

  const fetchPayments = async () => {
    try {
      const response = await axios.get(`${API}/admin/payments`);
      setPayments(response.data);
      setFilteredPayments(response.data);
    } catch (error) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = payments;

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.user?.phone.includes(searchTerm) ||
        p.id.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Sort by created_at descending (recent first)
    filtered = filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    setFilteredPayments(filtered);
  };

  const openDialog = (payment) => {
    setSelectedPayment(payment);
    setDialogOpen(true);
  };

  const getStatusBadge = (status) => {
    const colors = {
      success: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      refunded: 'bg-purple-100 text-purple-800'
    };
    return <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>{status}</Badge>;
  };

  const totalRevenue = filteredPayments.filter(p => p.status === 'success').reduce((sum, p) => sum + p.amount, 0);

  return (
    <AdminLayout active="payments" title="Payment Management">
      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          <Input
            data-testid="search-payments-input"
            placeholder="Search by name, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 sm:pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger data-testid="payment-status-filter" className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Summary */}
      <div className="mb-6 p-3 sm:p-4 bg-white rounded-lg border border-border">
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4 text-center">
          <div>
            <p className="text-lg sm:text-2xl font-bold text-primary">{payments.length}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Total</p>
          </div>
          <div>
            <p className="text-lg sm:text-2xl font-bold text-green-600">{payments.filter(p => p.status === 'success').length}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Success</p>
          </div>
          <div>
            <p className="text-lg sm:text-2xl font-bold text-red-600">{payments.filter(p => p.status === 'failed').length}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Failed</p>
          </div>
          <div className="hidden sm:block">
            <p className="text-lg sm:text-2xl font-bold text-yellow-600">{payments.filter(p => p.status === 'pending').length}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Pending</p>
          </div>
          <div className="col-span-3 sm:col-span-1 pt-2 sm:pt-0 border-t sm:border-t-0">
            <p className="text-lg sm:text-2xl font-bold text-primary">₹{totalRevenue}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Revenue</p>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading payments...</p>
      ) : filteredPayments.length === 0 ? (
        <Card>
          <CardContent className="p-8 sm:p-12 text-center">
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' ? 'No payments match your filters' : 'No payments found'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4" data-testid="admin-payments-list">
          {filteredPayments.map((payment) => (
            <Card key={payment.id} data-testid={`admin-payment-card-${payment.id}`}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="text-base sm:text-lg font-semibold text-primary">
                        {payment.user?.name || 'Unknown User'}
                      </h3>
                      {getStatusBadge(payment.status)}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                      <div>
                        <p className="text-muted-foreground">Amount</p>
                        <p className="font-bold text-primary text-base sm:text-lg">₹{payment.amount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Payment ID</p>
                        <p className="font-medium font-mono truncate">{payment.id.slice(0, 12)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Phone</p>
                        <p className="font-medium">{payment.user?.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Date</p>
                        <p className="font-medium">{format(new Date(payment.payment_date), 'PP')}</p>
                      </div>
                    </div>
                  </div>
                  <Dialog open={dialogOpen && selectedPayment?.id === payment.id} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        data-testid={`edit-payment-button-${payment.id}`}
                        size="sm"
                        variant="outline"
                        onClick={() => openDialog(payment)}
                        className="rounded-full text-xs sm:text-sm w-full sm:w-auto"
                      >
                        Edit Status
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg mx-4 sm:mx-auto">
                      <DialogHeader>
                        <DialogTitle className="heading-text">Update Payment Status</DialogTitle>
                      </DialogHeader>
                      {selectedPayment && (
                        <PaymentDialog
                          payment={selectedPayment}
                          onClose={() => setDialogOpen(false)}
                          onSuccess={fetchPayments}
                        />
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminPayments;
