import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { MapPin, CreditCard, Plus, Shield, Loader2, AlertCircle, Truck, Tag, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user, addresses } = useAuth();
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isNoidaAddress, setIsNoidaAddress] = useState(true);
  const [deliveryInfo, setDeliveryInfo] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }
    loadRazorpayScript();
    // Set default address
    const defaultAddr = addresses.find(a => a.is_default);
    if (defaultAddr) {
      setSelectedAddressId(defaultAddr.id);
      checkNoidaDelivery(defaultAddr);
    } else if (addresses.length > 0) {
      setSelectedAddressId(addresses[0].id);
      checkNoidaDelivery(addresses[0]);
    }
  }, [user, cartItems, addresses, navigate]);

  useEffect(() => {
    if (selectedAddressId) {
      calculateDeliveryFee();
    }
  }, [selectedAddressId]);

  const loadRazorpayScript = () => {
    if (document.getElementById('razorpay-script')) return;
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
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
        setDeliveryInfo({ fee: 50, distance: 0, label: 'Standard Delivery' });
      }
    } else {
      setDeliveryInfo({ fee: 50, distance: 0, label: 'Standard Delivery' });
    }
  };

  const checkNoidaDelivery = (address) => {
    if (address?.address_line) {
      const isNoida = address.address_line.toLowerCase().includes('noida') || 
                      address.city?.toLowerCase() === 'noida';
      setIsNoidaAddress(isNoida);
    }
  };

  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId);
    const selectedAddr = addresses.find(a => a.id === addressId);
    checkNoidaDelivery(selectedAddr);
  };

  const handleAddAddress = () => {
    // Save cart state before navigating
    localStorage.setItem('checkoutReturn', 'true');
    navigate('/addresses');
  };

  const handlePayment = async () => {
    if (!selectedAddressId) {
      toast.error('Please select a delivery address', {
        description: 'You need to select an address to proceed with checkout'
      });
      return;
    }

    if (!isNoidaAddress) {
      toast.error('Delivery not available', {
        description: 'We currently deliver only in Noida. Please add a Noida address.'
      });
      return;
    }

    setLoading(true);
    try {
      // Create Razorpay order
      const orderResponse = await axios.post(`${API}/payments/create-order`, {
        amount: total,
        receipt: `order_${user.id}_${Date.now()}`.slice(0, 40),
        notes: { user_id: user.id, type: 'single_order' }
      });

      const { order_id, amount: orderAmount, currency, key_id } = orderResponse.data;

      const options = {
        key: key_id,
        amount: orderAmount,
        currency: currency,
        name: 'Khurpi Microgreens',
        description: 'Order Payment',
        order_id: order_id,
        handler: async function (response) {
          try {
            // Verify payment
            await axios.post(`${API}/payments/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            // Create order after successful payment
            const orderData = {
              user_id: user.id,
              address_id: selectedAddressId,
              items: cartItems.map(item => ({
                product_id: item.product.id,
                quantity: item.quantity,
                price: item.product.price
              })),
              subtotal: getCartTotal(),
              delivery_fee: deliveryFee,
              total: total,
              order_type: 'one_time',
              payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              payment_status: 'paid'
            };

            await axios.post(`${API}/orders`, orderData);
            clearCart();
            toast.success('Order Placed Successfully!', {
              description: 'Your fresh microgreens will be delivered soon.'
            });
            navigate('/orders');
          } catch (error) {
            console.error('Order creation error:', error);
            toast.error('Order creation failed', {
              description: `Payment ID: ${response.razorpay_payment_id}. Please contact support.`
            });
          }
        },
        prefill: {
          name: user.name,
          contact: user.phone
        },
        theme: {
          color: '#16a34a'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            toast.info('Payment Cancelled', {
              description: 'Your cart items are still saved.'
            });
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      setLoading(false);
    } catch (error) {
      toast.error('Payment Failed', {
        description: error.response?.data?.detail || 'Failed to initiate payment. Please try again.'
      });
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
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Delivery Address</h2>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddAddress}
                  className="rounded-full"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {addresses.length > 0 ? 'Manage' : 'Add Address'}
                </Button>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-muted-foreground mb-4">No delivery address found</p>
                  <Button onClick={handleAddAddress} className="rounded-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Address
                  </Button>
                </div>
              ) : (
                <RadioGroup value={selectedAddressId} onValueChange={handleAddressSelect}>
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedAddressId === addr.id 
                            ? 'border-primary bg-green-50 shadow-sm' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleAddressSelect(addr.id)}
                      >
                        <RadioGroupItem value={addr.id} id={addr.id} className="mt-1" />
                        <Label htmlFor={addr.id} className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{addr.name || 'Address'}</span>
                            {addr.is_default && (
                              <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">Default</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{addr.address_line}</p>
                          {addr.phone && (
                            <p className="text-xs text-muted-foreground mt-1">📞 +91 {addr.phone}</p>
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}

              {!isNoidaAddress && selectedAddressId && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Delivery Not Available</p>
                    <p className="text-sm text-amber-700">We currently deliver only in Noida. Please select or add a Noida address.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delivery Info */}
          {deliveryInfo && isNoidaAddress && (
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
                    <span>Subscribe for FREE delivery on all orders!</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Payment Information */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Payment</h2>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <img 
                      src="https://razorpay.com/assets/razorpay-logo.svg" 
                      alt="Razorpay" 
                      className="h-5"
                    />
                    <span className="font-medium text-blue-800">Online Payment</span>
                  </div>
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-sm text-blue-700 mb-3">
                  Pay securely using UPI, Cards, Net Banking, or Wallets
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-white px-2 py-1 rounded border">UPI</span>
                  <span className="text-xs bg-white px-2 py-1 rounded border">Cards</span>
                  <span className="text-xs bg-white px-2 py-1 rounded border">Net Banking</span>
                  <span className="text-xs bg-white px-2 py-1 rounded border">Wallets</span>
                </div>
              </div>
              
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>Your payment information is encrypted and secure</span>
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
                data-testid="pay-now-button"
                onClick={handlePayment}
                disabled={loading || !selectedAddressId || !isNoidaAddress}
                className="w-full bg-primary hover:bg-primary/90 rounded-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay ₹${total.toFixed(2)}`
                )}
              </Button>
              
              <p className="text-xs text-center text-muted-foreground mt-3">
                By placing this order, you agree to our{' '}
                <a href="/terms" target="_blank" className="text-primary hover:underline">Terms & Conditions</a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
