import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { 
  Receipt, Plus, Search, Edit2, Trash2, Loader2, 
  IndianRupee, Calendar, Store, Phone, Package,
  TrendingUp, TrendingDown, Filter, X, FileText, Download
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { format } from 'date-fns';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleting, setDeleting] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    item_type: '',
    item_name: '',
    description: '',
    vendor_name: '',
    vendor_location: '',
    vendor_phone: '',
    quantity: 1,
    unit_price: 0,
    total_price: 0,
    paid_status: 'pending',
    paid_amount: 0,
    payment_method: '',
    order_date: format(new Date(), 'yyyy-MM-dd'),
    delivery_date: '',
    invoice_number: '',
    notes: ''
  });

  useEffect(() => {
    fetchExpenses();
    fetchExpenseTypes();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await axios.get(`${API}/admin/expenses`);
      setExpenses(response.data.expenses || []);
      setSummary(response.data.summary || {});
    } catch (error) {
      toast.error('Failed to fetch expenses');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenseTypes = async () => {
    try {
      const response = await axios.get(`${API}/admin/expense-types`);
      setExpenseTypes(response.data || []);
    } catch (error) {
      console.error('Failed to fetch expense types:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      item_type: '',
      item_name: '',
      description: '',
      vendor_name: '',
      vendor_location: '',
      vendor_phone: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      paid_status: 'pending',
      paid_amount: 0,
      payment_method: '',
      order_date: format(new Date(), 'yyyy-MM-dd'),
      delivery_date: '',
      invoice_number: '',
      notes: ''
    });
    setEditingExpense(null);
  };

  const handleOpenDialog = (expense = null) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        item_type: expense.item_type || '',
        item_name: expense.item_name || '',
        description: expense.description || '',
        vendor_name: expense.vendor_name || '',
        vendor_location: expense.vendor_location || '',
        vendor_phone: expense.vendor_phone || '',
        quantity: expense.quantity || 1,
        unit_price: expense.unit_price || 0,
        total_price: expense.total_price || 0,
        paid_status: expense.paid_status || 'pending',
        paid_amount: expense.paid_amount || 0,
        payment_method: expense.payment_method || '',
        order_date: expense.order_date || format(new Date(), 'yyyy-MM-dd'),
        delivery_date: expense.delivery_date || '',
        invoice_number: expense.invoice_number || '',
        notes: expense.notes || ''
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      // Auto-calculate total price when quantity or unit_price changes
      if (field === 'quantity' || field === 'unit_price') {
        const qty = field === 'quantity' ? value : prev.quantity;
        const price = field === 'unit_price' ? value : prev.unit_price;
        updated.total_price = Math.round((qty * price) * 100) / 100;
      }
      // Auto-set paid_amount when status changes to paid
      if (field === 'paid_status' && value === 'paid') {
        updated.paid_amount = updated.total_price;
      }
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (!formData.item_type || !formData.item_name || !formData.vendor_name) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      if (editingExpense) {
        await axios.put(`${API}/admin/expenses/${editingExpense.id}`, formData);
        toast.success('Expense updated');
      } else {
        await axios.post(`${API}/admin/expenses`, formData);
        toast.success('Expense added');
      }
      setDialogOpen(false);
      resetForm();
      fetchExpenses();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save expense');
    }
  };

  const handleDelete = async (expenseId) => {
    setDeleting(expenseId);
    try {
      await axios.delete(`${API}/admin/expenses/${expenseId}`);
      toast.success('Expense deleted');
      fetchExpenses();
    } catch (error) {
      toast.error('Failed to delete expense');
    } finally {
      setDeleting(null);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      paid: { color: 'bg-green-100 text-green-800', label: 'Paid' },
      partial: { color: 'bg-yellow-100 text-yellow-800', label: 'Partial' },
      pending: { color: 'bg-red-100 text-red-800', label: 'Pending' }
    };
    const { color, label } = config[status] || config.pending;
    return <Badge className={`${color} text-xs`}>{label}</Badge>;
  };

  const getTypeLabel = (typeName) => {
    const type = expenseTypes.find(t => t.name === typeName);
    return type?.label || typeName;
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = 
      expense.item_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.vendor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || expense.item_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || expense.paid_status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Item', 'Vendor', 'Qty', 'Unit Price', 'Total', 'Paid', 'Status', 'Invoice'];
    const rows = filteredExpenses.map(e => [
      e.order_date,
      getTypeLabel(e.item_type),
      e.item_name,
      e.vendor_name,
      e.quantity,
      e.unit_price,
      e.total_price,
      e.paid_amount,
      e.paid_status,
      e.invoice_number || ''
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Exported to CSV');
  };

  if (loading) {
    return (
      <AdminLayout active="expenses" title="Expenses">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout active="expenses" title="Expense Tracker">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Receipt className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Expenses</p>
                <p className="text-xl font-bold">{summary.total_expenses || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <IndianRupee className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Amount</p>
                <p className="text-xl font-bold">₹{(summary.total_amount || 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Paid</p>
                <p className="text-xl font-bold text-green-600">₹{(summary.total_paid || 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-xl font-bold text-red-600">₹{(summary.pending_amount || 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-testid="expense-search"
            placeholder="Search item, vendor, invoice..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40 h-9" data-testid="type-filter">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {expenseTypes.map(type => (
              <SelectItem key={type.name} value={type.name}>{type.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 h-9" data-testid="status-filter">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="h-9" onClick={exportToCSV}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-9" onClick={() => handleOpenDialog()} data-testid="add-expense-btn">
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Type & Item */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="item_type">Expense Type *</Label>
                  <Select value={formData.item_type} onValueChange={(v) => handleInputChange('item_type', v)}>
                    <SelectTrigger data-testid="expense-type-select">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseTypes.map(type => (
                        <SelectItem key={type.name} value={type.name}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="item_name">Item Name *</Label>
                  <Input
                    id="item_name"
                    data-testid="expense-item-name"
                    value={formData.item_name}
                    onChange={(e) => handleInputChange('item_name', e.target.value)}
                    placeholder="e.g., Sunflower Seeds 1kg"
                  />
                </div>
              </div>

              {/* Vendor Info */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="vendor_name">Vendor Name *</Label>
                  <Input
                    id="vendor_name"
                    data-testid="expense-vendor"
                    value={formData.vendor_name}
                    onChange={(e) => handleInputChange('vendor_name', e.target.value)}
                    placeholder="Vendor/Supplier name"
                  />
                </div>
                <div>
                  <Label htmlFor="vendor_location">Location</Label>
                  <Input
                    id="vendor_location"
                    value={formData.vendor_location}
                    onChange={(e) => handleInputChange('vendor_location', e.target.value)}
                    placeholder="City/Area"
                  />
                </div>
                <div>
                  <Label htmlFor="vendor_phone">Phone</Label>
                  <Input
                    id="vendor_phone"
                    value={formData.vendor_phone}
                    onChange={(e) => handleInputChange('vendor_phone', e.target.value)}
                    placeholder="Contact number"
                  />
                </div>
              </div>

              {/* Quantity & Pricing */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <Label htmlFor="unit_price">Unit Price (₹)</Label>
                  <Input
                    id="unit_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.unit_price}
                    onChange={(e) => handleInputChange('unit_price', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="total_price">Total Price (₹)</Label>
                  <Input
                    id="total_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.total_price}
                    onChange={(e) => handleInputChange('total_price', parseFloat(e.target.value) || 0)}
                    data-testid="expense-total"
                  />
                </div>
              </div>

              {/* Payment Status */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="paid_status">Payment Status</Label>
                  <Select value={formData.paid_status} onValueChange={(v) => handleInputChange('paid_status', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="paid_amount">Paid Amount (₹)</Label>
                  <Input
                    id="paid_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.paid_amount}
                    onChange={(e) => handleInputChange('paid_amount', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="payment_method">Payment Method</Label>
                  <Select value={formData.payment_method} onValueChange={(v) => handleInputChange('payment_method', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="credit">Credit/Due</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="order_date">Order/Purchase Date *</Label>
                  <Input
                    id="order_date"
                    type="date"
                    value={formData.order_date}
                    onChange={(e) => handleInputChange('order_date', e.target.value)}
                    data-testid="expense-date"
                  />
                </div>
                <div>
                  <Label htmlFor="delivery_date">Delivery Date</Label>
                  <Input
                    id="delivery_date"
                    type="date"
                    value={formData.delivery_date}
                    onChange={(e) => handleInputChange('delivery_date', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="invoice_number">Invoice Number</Label>
                  <Input
                    id="invoice_number"
                    value={formData.invoice_number}
                    onChange={(e) => handleInputChange('invoice_number', e.target.value)}
                    placeholder="INV-001"
                  />
                </div>
              </div>

              {/* Description & Notes */}
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes or details..."
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleSubmit} data-testid="save-expense-btn">
                {editingExpense ? 'Update' : 'Add'} Expense
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Expenses Table - Desktop */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      <Receipt className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p>No expenses found</p>
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        {expense.order_date ? format(new Date(expense.order_date), 'MMM d, yyyy') : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-xs">
                          {getTypeLabel(expense.item_type)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-sm">{expense.item_name}</p>
                        {expense.quantity > 1 && (
                          <p className="text-xs text-muted-foreground">Qty: {expense.quantity}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm">{expense.vendor_name}</p>
                        {expense.vendor_location && (
                          <p className="text-xs text-muted-foreground">{expense.vendor_location}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="font-semibold">₹{expense.total_price?.toLocaleString()}</p>
                        {expense.paid_status === 'partial' && (
                          <p className="text-xs text-green-600">Paid: ₹{expense.paid_amount}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getStatusBadge(expense.paid_status)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(expense)}
                            data-testid={`edit-expense-${expense.id}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(expense.id)}
                            disabled={deleting === expense.id}
                            data-testid={`delete-expense-${expense.id}`}
                          >
                            {deleting === expense.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {filteredExpenses.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Receipt className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">No expenses found</p>
            </CardContent>
          </Card>
        ) : (
          filteredExpenses.map((expense) => (
            <Card key={expense.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">{expense.item_name}</p>
                    <p className="text-xs text-muted-foreground">{expense.vendor_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">₹{expense.total_price?.toLocaleString()}</p>
                    {getStatusBadge(expense.paid_status)}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{getTypeLabel(expense.item_type)}</Badge>
                    <span>{expense.order_date ? format(new Date(expense.order_date), 'MMM d') : '-'}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(expense)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                      onClick={() => handleDelete(expense.id)}
                      disabled={deleting === expense.id}
                    >
                      {deleting === expense.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminExpenses;
