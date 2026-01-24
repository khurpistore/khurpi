import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { MapPin, CreditCard, Check, Plus, Truck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user, addresses, addAddress } = useAuth();
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [shopConfig, setShopConfig] = useState(null);
  const [newAddress, setNewAddress] = useState({
    address_line1: '',
    address_line2: '',
    city: 'NOIDA',
    pincode: '',
    landmark: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }
    fetchShopConfig();
    // Set default address
    const defaultAddr = addresses.find(a => a.is_default);
    if (defaultAddr) {
      setSelectedAddressId(defaultAddr.id);
    } else if (addresses.length > 0) {
      setSelectedAddressId(addresses[0].id);
    }
  }, [user, cartItems, addresses, navigate]);

  useEffect(() => {
    if (selectedAddressId) {
      calculateDeliveryFee();
    }
  }, [selectedAddressId]);

  const fetchShopConfig = async () => {
    try {
      const response = await axios.get(`${API}/settings/shop`);
      setShopConfig(response.data);
    } catch (error) {
      console.error('Failed to fetch shop config');
    }
  };

  const calculateDeliveryFee = async () => {
    const selectedAddress = addresses.find(a => a.id === selectedAddressId);
    if (selectedAddress?.latitude && selectedAddress?.longitude) {
      try {
        const response = await axios.post(
          `${API}/settings/calculate-delivery-fee?lat=${selectedAddress.latitude}&lon=${selectedAddress.longitude}`
        );
        setDeliveryInfo(response.data);
      } catch (error) {
        console.error('Failed to calculate delivery fee');
        setDeliveryInfo({ fee: 150, distance: 0, label: 'Standard Delivery' });
      }
    } else {
      // Default fee if no coordinates
      setDeliveryInfo({ fee: 150, distance: 0, label: 'Standard Delivery' });
    }
  };

  const handleAddNewAddress = async () => {
    if (!newAddress.address_line1 || !newAddress.pincode) {
      toast.error('Please fill in required address fields');
      return;
    }

    const fullAddress = [
      newAddress.address_line1,
      newAddress.address_line2,
      newAddress.landmark,
      newAddress.city,
      `UP ${newAddress.pincode}`
    ].filter(Boolean).join(', ');

    try {
      const response = await addAddress({
        address_line: fullAddress,
        latitude: 28.5355,
        longitude: 77.3910,
        is_default: addresses.length === 0
      });
      setSelectedAddressId(response.id);
      setShowNewAddress(false);
      setNewAddress({ address_line1: '', address_line2: '', city: 'NOIDA', pincode: '', landmark: '' });
      toast.success('Address added successfully');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select a delivery address');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        user_id: user.id,
        address_id: selectedAddressId,
        items: cartItems.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.price
        })),
        subtotal: getCartTotal(),
        delivery_fee: deliveryInfo?.fee || 0,
        total: getCartTotal() + (deliveryInfo?.fee || 0),
        order_type: 'one_time'
      };

      await axios.post(`${API}/orders`, orderData);
      
      clearCart();
      toast.success('Order placed successfully!');
      navigate('/profile');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!user || cartItems.length === 0) {
    return null;
  }

  const subtotal = getCartTotal();
  const deliveryFee = deliveryInfo?.fee || 0;
  const total = subtotal + deliveryFee;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
      <h1 className="text-2xl sm:text-4xl font-bold text-primary mb-6 sm:mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Delivery Address */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Delivery Address</h2>
              </div>

              {shopConfig && (
                <div className="mb-4 p-3 bg-green-50 rounded-lg text-sm">
                  <p className="font-medium text-green-800">Delivering from:</p>
                  <p className="text-green-700">{shopConfig.address}</p>
                </div>
              )}

              {addresses.length > 0 && !showNewAddress && (
                <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId}>
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedAddressId === addr.id ? 'border-primary bg-green-50' : 'border-gray-200'
                        }`}
                        onClick={() => setSelectedAddressId(addr.id)}
                      >
                        <RadioGroupItem value={addr.id} id={addr.id} className="mt-1" />
                        <Label htmlFor={addr.id} className="flex-1 cursor-pointer">
                          <p className="text-sm">{addr.address_line}</p>
                          {addr.is_default && (
                            <span className="text-xs text-primary font-medium">Default</span>
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}

              {!showNewAddress && (
                <Button
                  variant="outline"
                  onClick={() => setShowNewAddress(true)}
                  className="mt-4 w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Address
                </Button>
              )}

              {showNewAddress && (
                <div className="space-y-4 mt-4 p-4 border rounded-lg bg-gray-50">
                  <h3 className="font-medium">New Address</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Label htmlFor="address_line1">Address Line 1 *</Label>
                      <Input
                        id="address_line1"
                        placeholder="House/Flat No., Building Name"
                        value={newAddress.address_line1}
                        onChange={(e) => setNewAddress({...newAddress, address_line1: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="address_line2">Address Line 2</Label>
                      <Input
                        id="address_line2"
                        placeholder="Street, Area, Sector"
                        value={newAddress.address_line2}
                        onChange={(e) => setNewAddress({...newAddress, address_line2: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value="NOIDA"
                        disabled
                        className="mt-1 bg-gray-100"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Currently serving NOIDA only</p>
                    </div>
                    <div>
                      <Label htmlFor="pincode">Pincode *</Label>
                      <Input
                        id="pincode"
                        placeholder="201301"
                        value={newAddress.pincode}
                        onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="landmark">Landmark</Label>
                      <Input
                        id="landmark"
                        placeholder="Near School, Behind Mall, etc."
                        value={newAddress.landmark}
                        onChange={(e) => setNewAddress({...newAddress, landmark: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={handleAddNewAddress} className="bg-primary hover:bg-primary/90">
                      Save Address
                    </Button>
                    <Button variant="outline" onClick={() => setShowNewAddress(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delivery Info */}
          {deliveryInfo && (
            <Card className={deliveryInfo.fee === 0 ? 'border-green-200 bg-green-50' : ''}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Truck className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Delivery Information</h2>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{deliveryInfo.label}</p>
                    {deliveryInfo.distance > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Distance: {deliveryInfo.distance.toFixed(1)} km from shop
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    {deliveryInfo.fee === 0 ? (
                      <span className="text-lg font-bold text-green-600">FREE</span>
                    ) : (
                      <span className="text-lg font-bold">₹{deliveryInfo.fee}</span>
                    )}
                  </div>
                </div>
                {deliveryInfo.fee > 0 && (
                  <div className="mt-3 p-2 bg-amber-50 rounded text-xs text-amber-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Move closer to our shop (within 1 km) to get free delivery!</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Payment - Mocked */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Payment Method</h2>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">Cash on Delivery</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Pay when your order arrives
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-4">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.product.name} × {item.quantity}
                    </span>
                    <span>₹{(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-sm border-t pt-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  {deliveryFee === 0 ? (
                    <span className="text-green-600 font-medium">FREE</span>
                  ) : (
                    <span>₹{deliveryFee}</span>
                  )}
                </div>
              </div>
              
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                data-testid="place-order-button"
                onClick={handlePlaceOrder}
                disabled={loading || !selectedAddressId}
                className="w-full bg-primary hover:bg-primary/90 rounded-full"
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
