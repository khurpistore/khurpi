import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { MapPin, CreditCard, Plus, Shield, Loader2, AlertCircle, Truck, Tag, X, FlaskConical, Repeat, Package, ChevronLeft, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useAnalytics } from '@/hooks/useAnalytics';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart, pendingSubscription, clearSubscription } = useCart();
  const { user, addresses } = useAuth();
  const { trackPageView, trackCheckoutStarted, trackPurchase, trackSubscription } = useAnalytics();
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isNoidaAddress, setIsNoidaAddress] = useState(true);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(1000);
  const [testMode, setTestMode] = useState(false); // Test mode to bypass Razorpay
  const [orderPlaced, setOrderPlaced] = useState(false); // Flag to prevent redirect after order

  const hasItems = cartItems.length > 0 || pendingSubscription;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Don't redirect to cart if order was just placed or has subscription
    if (!hasItems && !orderPlaced) {
      navigate('/cart');
      return;
    }
    loadRazorpayScript();
    fetchSettings();
    // Track checkout started
    trackPageView('Checkout');
    trackCheckoutStarted(getCartTotal() + (pendingSubscription?.monthlyTotal || 0));
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

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/admin/settings/all`);
      const threshold = response.data?.shop_config?.free_delivery_threshold || 1000;
      setFreeDeliveryThreshold(threshold);
    } catch (error) {
      console.error('Failed to fetch settings');
    }
  };

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

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }
    
    setCouponLoading(true);
    try {
      const response = await axios.post(
        `${API}/coupons/validate?code=${encodeURIComponent(couponCode.trim().toUpperCase())}&order_amount=${subtotal}`
      );
      
      setAppliedCoupon({
        code: response.data.code,
        discount_amount: response.data.discount
      });
      toast.success('Coupon applied!', {
        description: `You saved ₹${response.data.discount.toFixed(2)}`
      });
    } catch (error) {
      toast.error('Invalid coupon', {
        description: error.response?.data?.detail || 'This coupon is not valid'
      });
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.info('Coupon removed');
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
    
    // Helper function to create order from cart items
    const createOrderFromCart = async (paymentId, razorpayOrderId) => {
      if (cartItems.length === 0) return;
      
      const orderData = {
        user_id: user.id,
        address_id: selectedAddressId,
        items: cartItems.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.price
        })),
        subtotal: subtotal,
        delivery_fee: deliveryFee,
        coupon_code: appliedCoupon?.code || null,
        coupon_discount: couponDiscount,
        total: total,
        order_type: 'one_time',
        payment_id: paymentId,
        razorpay_order_id: razorpayOrderId,
        payment_status: 'paid'
      };

      await axios.post(`${API}/orders`, orderData);
    };

    // Helper function to create subscription
    const createSubscriptionFromPending = async (paymentId, razorpaySubId) => {
      if (!pendingSubscription) return;
      
      // Extract only product_id and quantity for backend API
      const items = pendingSubscription.products.map(p => ({
        product_id: p.product_id || p.id,
        quantity: p.quantity
      }));
      
      const subscriptionData = {
        frequency: pendingSubscription.plan.frequency,
        delivery_days: pendingSubscription.deliveryDays,
        delivery_day: pendingSubscription.deliveryDays[0],
        deliveries_per_week: pendingSubscription.deliveriesPerWeek,
        start_date: pendingSubscription.startDate,
        tray_count: pendingSubscription.products.reduce((sum, p) => sum + p.quantity, 0),
        items: items,
        total_price: pendingSubscription.monthlyTotal,
        subtotal: pendingSubscription.perDeliveryTotal,
        delivery_fee: 0,
        monthly_delivery_fee: 0,
        plan_discount: pendingSubscription.plan.discount,
        discount_amount: pendingSubscription.discount,
        plan_id: pendingSubscription.plan.id,
        address_id: selectedAddressId,
        payment_method: 'online',
        payment_status: 'paid',
        razorpay_payment_id: paymentId,
        razorpay_subscription_id: razorpaySubId
      };

      await axios.post(`${API}/subscriptions?user_id=${user.id}`, subscriptionData);
    };

    try {
      // TEST MODE: Bypass Razorpay and create order/subscription directly
      if (testMode) {
        const testPaymentId = `test_pay_${Date.now()}`;
        const testOrderId = `test_order_${Date.now()}`;
        
        // Create one-time order if cart has items
        await createOrderFromCart(testPaymentId, testOrderId);

        // Create subscription if pending
        await createSubscriptionFromPending(`test_pay_sub_${Date.now()}`, `test_sub_${Date.now()}`);

        // Track successful purchase/subscription
        if (cartItems.length > 0) {
          trackPurchase(testOrderId, total, cartItems);
        }
        if (pendingSubscription) {
          trackSubscription(pendingSubscription.plan, subscriptionTotal);
        }

        setOrderPlaced(true);
        clearCart();
        clearSubscription();
        toast.success('Test Order Placed Successfully!', {
          description: 'Order created in test mode (no actual payment).'
        });
        
        // Navigate to appropriate page
        if (pendingSubscription && cartItems.length === 0) {
          navigate('/subscriptions');
        } else {
          navigate('/orders');
        }
        return;
      }

      // PRODUCTION MODE: Create Razorpay order
      // Determine the order type and description
      const hasOnlySubscription = pendingSubscription && cartItems.length === 0;
      const hasBoth = pendingSubscription && cartItems.length > 0;
      const orderType = hasOnlySubscription ? 'subscription' : hasBoth ? 'mixed' : 'single_order';
      const description = hasOnlySubscription 
        ? `Monthly Subscription - ${pendingSubscription.plan?.name || 'Plan'}`
        : hasBoth 
          ? 'Order + Subscription Payment'
          : 'Order Payment';

      const orderResponse = await axios.post(`${API}/payments/create-order`, {
        amount: grandTotal, // Use grandTotal to include subscription
        receipt: `order_${user.id}_${Date.now()}`.slice(0, 40),
        notes: { user_id: user.id, type: orderType }
      });

      const { order_id, amount: orderAmount, currency, key_id } = orderResponse.data;

      const options = {
        key: key_id,
        amount: orderAmount,
        currency: currency,
        name: 'Khurpi Microgreens',
        description: description,
        order_id: order_id,
        handler: async function (response) {
          try {
            // Verify payment
            await axios.post(`${API}/payments/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            // Create order if cart has items
            await createOrderFromCart(response.razorpay_payment_id, response.razorpay_order_id);

            // Create subscription if pending
            await createSubscriptionFromPending(response.razorpay_payment_id, `sub_${response.razorpay_order_id}`);

            setOrderPlaced(true);
            clearCart();
            clearSubscription();
            
            // Show appropriate success message and navigate
            if (hasOnlySubscription) {
              toast.success('Subscription Created Successfully!', {
                description: 'Your subscription is now active. Fresh microgreens coming soon!'
              });
              navigate('/subscriptions');
            } else if (hasBoth) {
              toast.success('Order & Subscription Created!', {
                description: 'Your order and subscription are confirmed.'
              });
              navigate('/orders');
            } else {
              toast.success('Order Placed Successfully!', {
                description: 'Your fresh microgreens will be delivered soon.'
              });
              navigate('/orders');
            }
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

  if (!user || !hasItems) {
    return null;
  }

  const cartSubtotal = getCartTotal();
  const subscriptionTotal = pendingSubscription?.monthlyTotal || 0;
  const subtotal = cartSubtotal; // Only cart items for one-time payment
  // Free delivery if subtotal >= threshold (subscriptions always have free delivery)
  const qualifiesForFreeDelivery = subtotal >= freeDeliveryThreshold || pendingSubscription;
  const baseDeliveryFee = deliveryInfo?.fee || 0;
  const deliveryFee = qualifiesForFreeDelivery ? 0 : baseDeliveryFee;
  const couponDiscount = appliedCoupon?.discount_amount || 0;
  const total = Math.max(0, subtotal + deliveryFee - couponDiscount);
  const grandTotal = total + subscriptionTotal;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
      {/* Back to Cart Link */}
      <Button
        variant="ghost"
        onClick={() => navigate('/cart')}
        className="mb-4 text-muted-foreground hover:text-primary"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Cart
      </Button>
      
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
                {deliveryFee > 0 && !qualifiesForFreeDelivery && (
                  <div className="mt-3 p-2 bg-amber-50 rounded text-xs text-amber-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Add ₹{(freeDeliveryThreshold - subtotal).toFixed(0)} more for FREE delivery!</span>
                  </div>
                )}
                {qualifiesForFreeDelivery && baseDeliveryFee > 0 && (
                  <div className="mt-3 p-2 bg-green-50 rounded text-xs text-green-700 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    <span>🎉 You saved ₹{baseDeliveryFee} on delivery!</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Coupon Code */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Have a Coupon?</h2>
              </div>
              
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <p className="font-medium text-green-800">{appliedCoupon.code}</p>
                    <p className="text-sm text-green-600">You save ₹{appliedCoupon.discount_amount.toFixed(2)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeCoupon}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="flex-1"
                    data-testid="coupon-input"
                  />
                  <Button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    variant="outline"
                    data-testid="apply-coupon-btn"
                  >
                    {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Payment</h2>
              </div>
              
              {/* Test Mode Toggle */}
              <div className="flex items-center justify-between p-3 mb-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-amber-600" />
                  <div>
                    <span className="font-medium text-amber-800">Test Mode</span>
                    <p className="text-xs text-amber-600">Bypass payment for testing</p>
                  </div>
                </div>
                <Switch 
                  checked={testMode} 
                  onCheckedChange={setTestMode}
                  data-testid="test-mode-toggle"
                />
              </div>
              
              <div className={`p-4 rounded-lg border ${testMode ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {testMode ? (
                      <>
                        <FlaskConical className="w-5 h-5 text-amber-600" />
                        <span className="font-medium text-amber-800">Test Payment (No Charge)</span>
                      </>
                    ) : (
                      <>
                        <img 
                          src="https://razorpay.com/assets/razorpay-logo.svg" 
                          alt="Razorpay" 
                          className="h-5"
                        />
                        <span className="font-medium text-blue-800">Online Payment</span>
                      </>
                    )}
                  </div>
                  <Shield className={`w-5 h-5 ${testMode ? 'text-amber-600' : 'text-blue-600'}`} />
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
              
              {/* Monthly Order Summary for Subscription */}
              {pendingSubscription && (
                <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Repeat className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-800">Monthly Subscription</span>
                  </div>
                  
                  {/* Products */}
                  <div className="space-y-1 text-sm mb-3">
                    <p className="text-xs text-muted-foreground mb-1">Products per delivery:</p>
                    {pendingSubscription.products?.map((product) => (
                      <div key={product.id || product.product_id} className="flex justify-between text-muted-foreground">
                        <span>{product.name} × {product.quantity}</span>
                        <span>₹{(product.price * product.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Plan Details */}
                  <div className="space-y-1 text-sm border-t border-green-200 pt-2">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Plan</span>
                      <span className="font-medium text-green-700">{pendingSubscription.plan?.name}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Frequency</span>
                      <span>{pendingSubscription.deliveriesPerWeek}×/week</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Delivery Days
                      </span>
                      <span>{pendingSubscription.deliveryDays?.join(', ')}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Start Date</span>
                      <span>{pendingSubscription.startDate}</span>
                    </div>
                    {pendingSubscription.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Plan Discount ({pendingSubscription.plan?.discount}%)</span>
                        <span>-₹{pendingSubscription.discount?.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-green-600">
                      <span className="flex items-center gap-1">
                        <Truck className="w-3 h-3" /> Delivery
                      </span>
                      <span className="font-medium">FREE</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between font-bold text-green-800 pt-2 border-t border-green-200 mt-2">
                    <span>Monthly Total</span>
                    <span>₹{subscriptionTotal.toFixed(2)}/mo</span>
                  </div>
                </div>
              )}

              {/* One-time Items */}
              {cartItems.length > 0 && (
                <>
                  {pendingSubscription && (
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm">One-time Purchase</span>
                    </div>
                  )}
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
                    {appliedCoupon && (
                      <div className="flex justify-between text-green-600">
                        <span>Coupon ({appliedCoupon.code})</span>
                        <span>-₹{couponDiscount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
              
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">
                    ₹{grandTotal.toFixed(2)}
                    {pendingSubscription && !cartItems.length && <span className="text-sm font-normal">/mo</span>}
                  </span>
                </div>
                {pendingSubscription && cartItems.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Includes ₹{subscriptionTotal.toFixed(2)}/mo subscription
                  </p>
                )}
              </div>

              <Button
                data-testid="pay-now-button"
                onClick={handlePayment}
                disabled={loading || !selectedAddressId || !isNoidaAddress}
                className={`w-full rounded-full ${testMode ? 'bg-amber-600 hover:bg-amber-700' : 'bg-primary hover:bg-primary/90'}`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : testMode ? (
                  `Place Test Order ₹${grandTotal.toFixed(2)}`
                ) : (
                  `Pay ₹${grandTotal.toFixed(2)}`
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
