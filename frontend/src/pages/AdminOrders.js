import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Package, Search, ChevronDown, ChevronUp, MapPin, Calendar, CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/admin/orders`);
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingStatus(orderId);
    try {
      await axios.put(`${API}/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      toast.success('Order status updated');
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      out_for_delivery: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return (
      <Badge className={`${statusColors[status] || 'bg-gray-100 text-gray-800'} capitalize`}>
        {status?.replace(/_/g, ' ')}
      </Badge>
    );
  };

  const getPaymentBadge = (paymentStatus) => {
    return paymentStatus === 'paid' 
      ? <Badge className="bg-green-100 text-green-800">Paid</Badge>
      : <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.phone?.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <AdminLayout active="orders" title="Orders">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout active="orders" title="Orders">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Orders</div>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">
              {orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Delivered</div>
            <div className="text-2xl font-bold text-green-600">
              {orders.filter(o => o.status === 'delivered').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Revenue</div>
            <div className="text-2xl font-bold">
              ₹{orders.reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-testid="orders-search"
            placeholder="Search by order ID, customer name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48" data-testid="status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="preparing">Preparing</SelectItem>
            <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Orders will appear here once customers place them'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Order Header */}
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">#{order.id?.slice(-8).toUpperCase()}</span>
                          {getStatusBadge(order.status)}
                          {getPaymentBadge(order.payment_status)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {order.user?.name || 'Unknown'} • {order.user?.phone || 'N/A'}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(order.created_at)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">₹{order.total?.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                          {order.items?.length || 0} item(s)
                        </div>
                      </div>
                      {expandedOrder === order.id ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedOrder === order.id && (
                  <div className="border-t bg-gray-50 p-4 space-y-4">
                    {/* Order Items */}
                    <div>
                      <h4 className="font-semibold mb-2">Order Items</h4>
                      <div className="space-y-2">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg">
                            <div className="flex items-center gap-3">
                              {item.product?.image && (
                                <img 
                                  src={item.product.image} 
                                  alt={item.product?.name} 
                                  className="w-10 h-10 object-cover rounded"
                                />
                              )}
                              <div>
                                <div className="font-medium">{item.product?.name || 'Product'}</div>
                                <div className="text-sm text-muted-foreground">
                                  ₹{item.price} × {item.quantity}
                                </div>
                              </div>
                            </div>
                            <div className="font-semibold">₹{(item.price * item.quantity).toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Address */}
                    {order.address && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Delivery Address
                        </h4>
                        <div className="bg-white p-3 rounded-lg text-sm">
                          <div className="font-medium">{order.address.name || 'Address'}</div>
                          <div className="text-muted-foreground">{order.address.address_line}</div>
                          {order.address.phone && (
                            <div className="text-muted-foreground font-medium">📞 +91 {order.address.phone}</div>
                          )}
                          {order.address.city && (
                            <div className="text-muted-foreground">{order.address.city} - {order.address.pincode}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Payment Info */}
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Payment Details
                      </h4>
                      <div className="bg-white p-3 rounded-lg text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span>₹{order.subtotal?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Delivery Fee</span>
                          <span>{order.delivery_fee === 0 ? 'FREE' : `₹${order.delivery_fee}`}</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                          <span>Total</span>
                          <span>₹{order.total?.toLocaleString()}</span>
                        </div>
                        {order.payment_id && (
                          <div className="text-xs text-muted-foreground mt-2">
                            Payment ID: {order.payment_id}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Update Status */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center pt-2">
                      <span className="font-semibold">Update Status:</span>
                      <div className="flex flex-wrap gap-2">
                        {['confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'].map((status) => (
                          <Button
                            key={status}
                            variant={order.status === status ? 'default' : 'outline'}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateOrderStatus(order.id, status);
                            }}
                            disabled={updatingStatus === order.id}
                            className="capitalize"
                            data-testid={`status-btn-${status}`}
                          >
                            {updatingStatus === order.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              status.replace(/_/g, ' ')
                            )}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrders;
