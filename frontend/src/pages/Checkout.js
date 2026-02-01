import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { MapPin, CreditCard, Plus, Loader2, AlertCircle, Truck, Tag, X, Repeat, Package, ChevronLeft, Clock, Sprout, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAnalytics } from '@/hooks/useAnalytics';
import { format, addDays } from 'date-fns';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Generate quantity options: 100-1000 (step 100), 1500-5000 (step 500)
const getQtyOptions = (maxQty) => {
  const options = [
    ...Array.from({ length: 10 }, (_, i) => (i + 1) * 100),  // 100-1000
    ...Array.from({ length: 8 }, (_, i) => 1500 + i * 500),   // 1500-5000
  ];
  return options.filter(q => q <= maxQty);
};

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart, pendingSubscription, clearSubscription, updateSelectedQty, removeFromCart } = useCart();
  const { user, addresses } = useAuth();
  const { trackPageView, trackCheckoutStarted } = useAnalytics();
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isNoidaAddress, setIsNoidaAddress] = useState(true);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const hasItems = cartItems.length > 0 || pendingSubscription;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!hasItems && !orderPlaced) {
      navigate('/cart');
      return;
    }
    loadRazorpayScript();
    trackPageView('Checkout');
    trackCheckoutStarted(getCartTotal() + (pendingSubscription?.monthlyTotal || 0));
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
        setDeliveryInfo({ fee: 0, distance: 0, label: 'Free Delivery', estimated_date: format(addDays(new Date(), 3), 'MMM d') });
      }
    }
  };

  const checkNoidaDelivery = (address) => {
    if (address?.address_line) {
      const isNoida = address.address_line.toLowerCase().includes('noida') || address.city?.toLowerCase() === 'noida';
      setIsNoidaAddress(isNoida);
    }
  };

  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId);
    const selectedAddr = addresses.find(a => a.id === addressId);
    checkNoidaDelivery(selectedAddr);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    const orderAmount = cartSubtotal + subscriptionTotal;
    setCouponLoading(true);
    try {
      const response = await axios.post(
        `${API}/coupons/validate?code=${encodeURIComponent(couponCode.trim().toUpperCase())}&order_amount=${orderAmount}`
      );
      setAppliedCoupon({ code: response.data.code, discount_amount: response.data.discount });
      toast.success(`Coupon applied! You saved ₹${response.data.discount.toFixed(0)}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedAddressId) {
      toast.error('Please select a delivery address');
      return;
    }
    if (!isNoidaAddress) {
      toast.error('We currently deliver only in Noida');
      return;
    }

    setLoading(true);
    
    const createOrderFromCart = async (paymentId, razorpayOrderId) => {
      if (cartItems.length === 0) return;
      const orderData = {
        user_id: user.id,
        address_id: selectedAddressId,
        items: cartItems.map(item => ({ product_id: item.product.id, quantity: item.quantity, price: item.product.price })),
        subtotal: cartSubtotal,
        delivery_fee: 0,
        coupon_code: appliedCoupon?.code || null,
        coupon_discount: couponDiscount,
        total: grandTotal,
        order_type: 'one_time',
        payment_id: paymentId,
        razorpay_order_id: razorpayOrderId,
        payment_status: 'paid'
      };
      await axios.post(`${API}/orders`, orderData);
    };

    const createSubscriptionFromPending = async (paymentId, razorpaySubId) => {
      if (!pendingSubscription) return;
      const items = pendingSubscription.products.map(p => ({ product_id: p.product_id || p.id, quantity: p.quantity }));
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
      const hasOnlySubscription = pendingSubscription && cartItems.length === 0;
      const hasBoth = pendingSubscription && cartItems.length > 0;
      const orderType = hasOnlySubscription ? 'subscription' : hasBoth ? 'mixed' : 'single_order';
      const description = hasOnlySubscription ? `Subscription - ${pendingSubscription.plan?.name}` : hasBoth ? 'Order + Subscription' : 'Order Payment';

      const orderResponse = await axios.post(`${API}/payments/create-order`, {
        amount: grandTotal,
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
            await axios.post(`${API}/payments/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            await createOrderFromCart(response.razorpay_payment_id, response.razorpay_order_id);
            await createSubscriptionFromPending(response.razorpay_payment_id, `sub_${response.razorpay_order_id}`);
            setOrderPlaced(true);
            clearCart();
            clearSubscription();
            toast.success(hasOnlySubscription ? 'Subscription Created!' : hasBoth ? 'Order & Subscription Created!' : 'Order Placed!');
            navigate(hasOnlySubscription ? '/subscriptions' : '/orders');
          } catch (error) {
            toast.error('Order creation failed. Please contact support.');
          }
        },
        prefill: { name: user.name, contact: user.phone },
        theme: { color: '#0d9488' },
        modal: { ondismiss: () => { setLoading(false); toast.info('Payment cancelled'); } }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      setLoading(false);
    } catch (error) {
      toast.error('Failed to initiate payment');
      setLoading(false);
    }
  };

  if (!user || !hasItems) return null;

  const cartSubtotal = getCartTotal();
  const subscriptionTotal = pendingSubscription?.monthlyTotal || 0;
  const couponDiscount = appliedCoupon?.discount_amount || 0;
  const grandTotal = Math.max(0, cartSubtotal + subscriptionTotal - couponDiscount);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/cart')} className="p-2">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold text-primary">Checkout</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Delivery Address - Compact */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold">Delivery Address</h3>
                </div>
                <Button variant="ghost" size="sm" onClick={() => {
                  localStorage.setItem('checkoutReturn', 'true');
                  navigate('/addresses');
                }} className="h-8 px-2 text-xs">
                  {addresses.length > 0 ? 'Change Address' : 'Add'}
                </Button>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <MapPin className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">No address found</p>
                  <Button size="sm" onClick={() => navigate('/addresses')} className="rounded-full">
                    <Plus className="w-3 h-3 mr-1" /> Add Address
                  </Button>
                </div>
              ) : (
                <>
                  {(() => {
                    const defaultAddr = addresses.find(a => a.is_default) || addresses.find(a => a.id === selectedAddressId) || addresses[0];
                    return (
                      <div className="p-3 rounded-lg border border-primary bg-teal-50">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{defaultAddr.name || 'Address'}</span>
                          <span className="text-xs bg-primary text-white px-1.5 py-0.5 rounded">Default</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{defaultAddr.address_line}</p>
                      </div>
                    );
                  })()}
                </>
              )}

              {!isNoidaAddress && selectedAddressId && (
                <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <p className="text-xs text-amber-700">We currently deliver only in Noida</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items - Compact */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">Order Items</h3>
              </div>

              {/* Subscription Items */}
              {pendingSubscription && (
                <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Repeat className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-sm text-green-800">Subscription</span>
                    </div>
                    <span className="text-xs font-medium bg-green-200 text-green-800 px-2 py-0.5 rounded-full">
                      {pendingSubscription.plan?.name} Plan
                    </span>
                  </div>
                  <div className="space-y-2">
                    {pendingSubscription.products?.map((product) => (
                      <div key={product.id || product.product_id} className="flex items-center gap-2">
                        <img src={product.image} alt={product.name} className="w-8 h-8 rounded object-cover" />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs truncate block">{product.name}</span>
                          <span className="text-xs text-muted-foreground">{product.weight || 100}gm</span>
                        </div>
                        <span className="text-xs bg-green-200 text-green-800 px-1.5 py-0.5 rounded font-medium">Qty: {product.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t border-green-200">
                    <div className="flex items-center gap-1 text-xs text-green-700 mb-1">
                      <Clock className="w-3 h-3" />
                      <span>Starts: {pendingSubscription.startDate}</span>
                      <span className="mx-1">•</span>
                      <span>Days: {pendingSubscription.deliveryDays?.join(', ')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700">Monthly</span>
                      <span className="font-semibold text-green-700">₹{subscriptionTotal.toFixed(0)}/mo</span>
                    </div>
                  </div>
                </div>
              )}

              {/* One-time Items */}
              {cartItems.length > 0 && (
                <div className="space-y-2">
                  {pendingSubscription && (
                    <p className="text-xs font-medium text-muted-foreground mb-1">One-time Purchase</p>
                  )}
                  {cartItems.map((item) => {
                    const isGrowing = item.product.stock_status === 'growing' || item.product.isGrowing;
                    
                    // Calculate delivery date and text
                    let estimatedDelivery;
                    let deliveryText;
                    
                    if (isGrowing) {
                      if (item.product.availability_date) {
                        estimatedDelivery = addDays(new Date(item.product.availability_date), 1);
                      } else {
                        const readyDays = item.product.ready_in_days || item.product.deliveryDays || 7;
                        estimatedDelivery = addDays(new Date(), readyDays + 1);
                      }
                      // Skip Sunday
                      if (estimatedDelivery.getDay() === 0) {
                        estimatedDelivery = addDays(estimatedDelivery, 1);
                      }
                      deliveryText = `Growing - by ${format(estimatedDelivery, 'MMM d')}`;
                    } else {
                      // In stock: delivery next day, skip Sunday
                      estimatedDelivery = addDays(new Date(), 1);
                      if (estimatedDelivery.getDay() === 0) {
                        estimatedDelivery = addDays(estimatedDelivery, 1);
                        deliveryText = 'Delivery by Monday';
                      } else {
                        deliveryText = 'Delivery by Tomorrow';
                      }
                    }
                    
                    const selectedQty = item.product.selectedQty || 100;
                    const unitPrice = (item.product.price / 100) * selectedQty;
                    return (
                      <div key={item.product.id} className={`flex items-center gap-2 p-2 rounded-lg ${isGrowing ? 'bg-amber-50' : 'bg-gray-50'}`}>
                        <div className="relative">
                          <img src={item.product.image} alt={item.product.name} className="w-10 h-10 rounded object-cover" />
                          {isGrowing && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                              <Sprout className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">{selectedQty}gm @ ₹{item.product.price}/100gm</p>
                          <p className={`text-xs flex items-center gap-1 ${isGrowing ? 'text-amber-600' : 'text-muted-foreground'}`}>
                            <Clock className="w-3 h-3" />
                            {deliveryText}
                          </p>
                        </div>
                        <span className="text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded font-medium">x{item.quantity}</span>
                        <span className="text-sm font-medium">₹{(unitPrice * item.quantity).toFixed(0)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Payment Summary */}
        <div>
          <Card className="sticky top-20">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Payment Summary</h3>
              
              <div className="space-y-2 text-sm">
                {cartItems.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">One-time purchase</span>
                    <span>₹{cartSubtotal.toFixed(0)}</span>
                  </div>
                )}
                {pendingSubscription && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subscription (1st month)</span>
                    <span>₹{subscriptionTotal.toFixed(0)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{appliedCoupon.code}</span>
                    <span>-₹{couponDiscount.toFixed(0)}</span>
                  </div>
                )}
              </div>

              {/* Apply Coupon */}
              <div className="border-t pt-3 mt-3">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">{appliedCoupon.code}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => { setAppliedCoupon(null); setCouponCode(''); }} className="h-6 px-2">
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="h-8 text-sm"
                    />
                    <Button onClick={handleApplyCoupon} disabled={couponLoading} size="sm" className="h-8 px-3">
                      {couponLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Apply'}
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-primary">₹{grandTotal.toFixed(0)}</span>
                </div>
              </div>

              <Button
                data-testid="pay-now-button"
                onClick={handlePayment}
                disabled={loading || !selectedAddressId || !isNoidaAddress}
                className="w-full mt-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 rounded-full py-5"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
                ) : (
                  <><CreditCard className="w-4 h-4 mr-2" />Pay ₹{grandTotal.toFixed(0)}</>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
