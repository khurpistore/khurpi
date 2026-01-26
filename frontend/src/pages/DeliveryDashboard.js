import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Truck, Phone, MapPin, Package, CheckCircle2, XCircle, 
  SkipForward, LogOut, RefreshCw, AlertTriangle, Navigation
} from 'lucide-react';
import { format } from 'date-fns';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DeliveryDashboard = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [deliveryBoy, setDeliveryBoy] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('deliveryBoy');
    if (!stored) {
      navigate('/delivery/login');
      return;
    }
    setDeliveryBoy(JSON.parse(stored));
    fetchDeliveries();
  }, [navigate]);

  const fetchDeliveries = async () => {
    const stored = localStorage.getItem('deliveryBoy');
    if (!stored) return;
    
    const user = JSON.parse(stored);
    setLoading(true);
    try {
      const response = await axios.get(`${API}/delivery-boy/deliveries?delivery_boy_id=${user.id}`);
      setDeliveries(response.data);
    } catch (error) {
      toast.error('Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (deliveryId, status) => {
    setUpdating(deliveryId);
    try {
      await axios.put(`${API}/delivery-boy/deliveries/${deliveryId}?status=${status}`);
      toast.success(`Delivery marked as ${status}`);
      fetchDeliveries();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('deliveryBoy');
    navigate('/delivery/login');
    toast.success('Logged out successfully');
  };

  const openMaps = (address) => {
    const encoded = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, '_blank');
  };

  const getStatusConfig = (status) => {
    const config = {
      scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Pending', icon: Package },
      delivered: { color: 'bg-green-100 text-green-800', label: 'Delivered', icon: CheckCircle2 },
      failed: { color: 'bg-red-100 text-red-800', label: 'Failed', icon: XCircle },
      skipped: { color: 'bg-yellow-100 text-yellow-800', label: 'Skipped', icon: SkipForward },
      cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelled', icon: XCircle }
    };
    return config[status] || config.scheduled;
  };

  // Stats
  const pendingCount = deliveries.filter(d => d.status === 'scheduled').length;
  const deliveredCount = deliveries.filter(d => d.status === 'delivered').length;
  const failedCount = deliveries.filter(d => d.status === 'failed' || d.status === 'skipped').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">{deliveryBoy?.name || 'Delivery Partner'}</p>
              <p className="text-xs text-blue-100">{format(new Date(), 'EEEE, MMM d')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={fetchDeliveries}
              className="text-white hover:bg-white/20"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleLogout}
              className="text-white hover:bg-white/20"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{pendingCount}</p>
              <p className="text-xs text-blue-600">Pending</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{deliveredCount}</p>
              <p className="text-xs text-green-600">Delivered</p>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-red-600">{failedCount}</p>
              <p className="text-xs text-red-600">Failed/Skip</p>
            </CardContent>
          </Card>
        </div>

        {/* Deliveries List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : deliveries.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-muted-foreground">No deliveries for today</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {deliveries.map((delivery) => {
              const statusConfig = getStatusConfig(delivery.status);
              const StatusIcon = statusConfig.icon;
              const isPending = delivery.status === 'scheduled';
              
              return (
                <Card 
                  key={delivery.id} 
                  className={`overflow-hidden ${
                    delivery.is_skipped ? 'border-yellow-300 bg-yellow-50/50' : 
                    delivery.subscription_status === 'paused' ? 'border-amber-300 bg-amber-50/50' : ''
                  }`}
                >
                  <CardContent className="p-0">
                    {/* Warning Banner */}
                    {(delivery.is_skipped || delivery.subscription_status === 'paused') && (
                      <div className={`px-3 py-2 flex items-center gap-2 text-sm ${
                        delivery.subscription_status === 'paused' ? 'bg-amber-100 text-amber-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        <AlertTriangle className="w-4 h-4" />
                        <span>
                          {delivery.subscription_status === 'paused' ? 'Subscription Paused' : 'Customer Skipped'}
                        </span>
                      </div>
                    )}
                    
                    <div className="p-4">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{delivery.customer_name}</h3>
                          <a 
                            href={`tel:${delivery.customer_phone}`}
                            className="flex items-center gap-1 text-blue-600 text-sm"
                          >
                            <Phone className="w-3 h-3" />
                            {delivery.customer_phone}
                          </a>
                        </div>
                        <Badge className={statusConfig.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </div>

                      {/* Address */}
                      <div 
                        className="flex items-start gap-2 mb-3 p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                        onClick={() => openMaps(delivery.delivery_address)}
                      >
                        <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700 flex-1">{delivery.delivery_address}</p>
                        <Navigation className="w-4 h-4 text-blue-600" />
                      </div>

                      {/* Products */}
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-1">Products</p>
                        <div className="flex flex-wrap gap-1">
                          {delivery.products.map((product, idx) => (
                            <span 
                              key={idx} 
                              className="text-xs bg-gray-100 px-2 py-1 rounded"
                            >
                              {product.name} × {product.quantity}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {isPending && (
                        <div className="grid grid-cols-3 gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => updateStatus(delivery.id, 'delivered')}
                            disabled={updating === delivery.id}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Delivered
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                            onClick={() => updateStatus(delivery.id, 'skipped')}
                            disabled={updating === delivery.id}
                          >
                            <SkipForward className="w-4 h-4 mr-1" />
                            Skip
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500 text-red-600 hover:bg-red-50"
                            onClick={() => updateStatus(delivery.id, 'failed')}
                            disabled={updating === delivery.id}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Failed
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryDashboard;
