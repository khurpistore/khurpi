import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Package, Search, MapPin, Calendar, CreditCard, Loader2, Phone, ChevronRight, Tag, Repeat, User, Truck } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { format } from 'date-fns';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/admin/orders`);
      // Sort by created_at descending (recent first)
      const sorted = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setOrders(sorted);
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
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
      toast.success('Status updated');
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
      <Badge className={`${statusColors[status] || 'bg-gray-100 text-gray-800'} text-xs`}>
        {status?.replace(/_/g, ' ')}
      </Badge>
    );
  };

  const getOrderTypeBadge = (orderType) => {
    const colors = {
      mixed: 'bg-purple-100 text-purple-800',
      subscription: 'bg-blue-100 text-blue-800',
      one_time: 'bg-gray-100 text-gray-800'
    };
    const labels = {
      mixed: 'Mixed',
      subscription: 'Subscription',
      one_time: 'One-time'
    };
    return <Badge className={`${colors[orderType] || colors.one_time} text-xs`}>{labels[orderType] || 'One-time'}</Badge>;
  };

  const getPlanDisplayName = (frequency) => {
    const planNames = {
      'once_week': 'Fresh Start',
      'twice_week': 'Balanced',
      'four_days_week': 'Power Greens',
      'daily': 'Daily'
    };
    return planNames[frequency] || frequency;
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.phone?.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue: orders.reduce((sum, o) => sum + (o.total || 0), 0)
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
      <div className="flex gap-6">
        {/* Left: Orders List */}
        <div className="flex-1">
          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="bg-white rounded-lg p-3 border">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border">
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border">
              <p className="text-xs text-muted-foreground">Delivered</p>
              <p className="text-xl font-bold text-green-600">{stats.delivered}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border">
              <p className="text-xs text-muted-foreground">Revenue</p>
              <p className="text-xl font-bold">₹{stats.revenue.toLocaleString()}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                data-testid="orders-search"
                placeholder="Search order ID, name, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 h-9" data-testid="status-filter">
                <SelectValue placeholder="All Status" />
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
          <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {filteredOrders.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                  <h3 className="font-semibold mb-1">No Orders Found</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Orders will appear here'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredOrders.map((order) => {
                const allItems = [
                  ...(order.subscription?.items || []),
                  ...(order.one_time_items || order.items || [])
                ];
                const discountAmount = (order.discount_amount || 0) + (order.coupon_discount || 0);
                const isSelected = selectedOrder?.id === order.id;

                return (
                  <Card 
                    key={order.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-primary shadow-md' : ''}`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        {/* Product Images */}
                        <div className="flex -space-x-2 flex-shrink-0">
                          {allItems.slice(0, 2).map((item, idx) => (
                            item.product?.image ? (
                              <img 
                                key={idx}
                                src={item.product.image} 
                                alt=""
                                className="w-10 h-10 rounded-lg object-cover border-2 border-white shadow-sm"
                              />
                            ) : (
                              <div key={idx} className="w-10 h-10 rounded-lg bg-gray-100 border-2 border-white flex items-center justify-center">
                                <Package className="w-4 h-4 text-gray-400" />
                              </div>
                            )
                          ))}
                          {allItems.length > 2 && (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium">
                              +{allItems.length - 2}
                            </div>
                          )}
                        </div>

                        {/* Order Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                            {getStatusBadge(order.status)}
                            {getOrderTypeBadge(order.order_type)}
                            {order.payment_status === 'paid' && (
                              <Badge className="bg-green-100 text-green-800 text-xs">Paid</Badge>
                            )}
                          </div>
                          <p className="text-sm font-medium truncate">
                            {order.user?.name || 'Unknown'} • {order.user?.phone || 'N/A'}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>#{order.id.slice(0, 6)}</span>
                            <span>•</span>
                            <span>{format(new Date(order.created_at), 'MMM d, h:mm a')}</span>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right flex-shrink-0">
                          {discountAmount > 0 && (
                            <p className="text-xs text-muted-foreground line-through">₹{order.subtotal?.toLocaleString()}</p>
                          )}
                          <p className="text-lg font-bold text-primary">₹{order.total?.toLocaleString()}</p>
                          {discountAmount > 0 && (
                            <p className="text-xs text-green-600 flex items-center justify-end gap-0.5">
                              <Tag className="w-3 h-3" />-₹{discountAmount}
                            </p>
                          )}
                        </div>

                        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Order Details Panel */}
        <div className="w-96 flex-shrink-0">
          {selectedOrder ? (
            <Card className="sticky top-4">
              <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-bold text-lg">#{selectedOrder.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(selectedOrder.created_at), 'MMM d, yyyy • h:mm a')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">₹{selectedOrder.total?.toLocaleString()}</p>
                    {selectedOrder.payment_status === 'paid' && (
                      <Badge className="bg-green-100 text-green-800 text-xs">Paid</Badge>
                    )}
                  </div>
                </div>

                {/* Customer Info */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-sm">Customer</span>
                  </div>
                  <p className="font-medium">{selectedOrder.user?.name || 'Unknown'}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {selectedOrder.user?.phone || 'N/A'}
                  </p>
                </div>

                {/* Delivery Address */}
                {selectedOrder.address && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-sm">Delivery Address</span>
                    </div>
                    {(selectedOrder.address.receiver_name || selectedOrder.address.name) && (
                      <p className="font-medium text-primary">{selectedOrder.address.receiver_name || selectedOrder.address.name}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{selectedOrder.address.address_line}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedOrder.address.city} - {selectedOrder.address.pincode}
                    </p>
                    {selectedOrder.address.phone && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Phone className="w-3 h-3" /> +91 {selectedOrder.address.phone}
                      </p>
                    )}
                  </div>
                )}

                {/* Order Items */}
                <div className="mb-4">
                  <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" />
                    Items
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {/* Subscription Items */}
                    {selectedOrder.subscription?.items?.map((item, idx) => (
                      <div key={`sub-${idx}`} className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg">
                        {item.product?.image ? (
                          <img src={item.product.image} alt="" className="w-10 h-10 rounded object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                            <Package className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.product?.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Repeat className="w-3 h-3" /> {item.quantity}gm
                          </p>
                        </div>
                      </div>
                    ))}
                    {/* One-time Items */}
                    {(selectedOrder.one_time_items || selectedOrder.items)?.map((item, idx) => (
                      <div key={`item-${idx}`} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                        {item.product?.image ? (
                          <img src={item.product.image} alt="" className="w-10 h-10 rounded object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                            <Package className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.product?.name}</p>
                          <p className="text-xs text-muted-foreground">{item.quantity}gm • ₹{item.price}/100gm</p>
                        </div>
                        <p className="text-sm font-medium">₹{((item.quantity / 100) * item.price).toFixed(0)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-sm">Payment</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{selectedOrder.subtotal?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery</span>
                      <span className="text-green-600">FREE</span>
                    </div>
                    {selectedOrder.discount_amount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({selectedOrder.discount_percent}%)</span>
                        <span>-₹{selectedOrder.discount_amount}</span>
                      </div>
                    )}
                    {selectedOrder.coupon_discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Coupon ({selectedOrder.coupon_code})</span>
                        <span>-₹{selectedOrder.coupon_discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold pt-2 border-t mt-2">
                      <span>Total</span>
                      <span>₹{selectedOrder.total?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Estimated Delivery */}
                {selectedOrder.estimated_delivery_date && (
                  <div className="bg-green-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-green-600" />
                      <span className="text-sm">
                        <span className="font-medium text-green-700">Est. Delivery:</span>{' '}
                        {format(new Date(selectedOrder.estimated_delivery_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                )}

                {/* Status Update */}
                <div>
                  <p className="font-semibold text-sm mb-2">Update Status</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'].map((status) => (
                      <Button
                        key={status}
                        variant={selectedOrder.status === status ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateOrderStatus(selectedOrder.id, status)}
                        disabled={updatingStatus === selectedOrder.id}
                        className="text-xs capitalize"
                        data-testid={`status-btn-${status}`}
                      >
                        {updatingStatus === selectedOrder.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          status.replace(/_/g, ' ')
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-4">
              <CardContent className="p-8 text-center">
                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-semibold mb-1">Select an Order</h3>
                <p className="text-sm text-muted-foreground">Click on an order to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
