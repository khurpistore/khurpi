import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useWholesale } from '@/hooks/useWholesale';
import { MapPin, CreditCard, Plus, Loader2, AlertCircle, Truck, Tag, X, Repeat, Package, ChevronLeft, Clock, Sprout, BadgePercent, Zap, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAnalytics } from '@/hooks/useAnalytics';
import { format, addDays } from 'date-fns';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Format quantity with appropriate unit label
const formatQtyLabel = (qty, unit) => {
  if (unit === 'piece') return `${qty} pc`;
  if (unit === 'dozen') return `${qty} dz`;
  if (unit === 'bunch') return `${qty} bunch`;
  return `${qty} kg`;
};

// Format price per unit
const formatPricePerUnit = (price, unit) => {
  if (unit === 'piece') return `₹${price}/pc`;
  if (unit === 'dozen') return `₹${price}/dz`;
  if (unit === 'bunch') return `₹${price}/bunch`;
  return `₹${price}/kg`;
};

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart, pendingSubscription, clearSubscription, refreshProductData } = useCart();
  const { user, addresses } = useAuth();
  const { wholesaleEnabled, getDisplayPrice, calculatePrice, isShowingWholesale } = useWholesale();
  const { trackPageView, trackCheckoutStarted } = useAnalytics();
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [discountTiers, setDiscountTiers] = useState([]);
  const [orderDiscount, setOrderDiscount] = useState(null);
  
  // Delivery slot states
  const [storeSettings, setStoreSettings] = useState(null);
  const [deliverySlots, setDeliverySlots] = useState([]);
  const [deliveryType, setDeliveryType] = useState('slotted'); // 'instant' or 'slotted'
  const [selectedDate, setSelectedDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const hasItems = cartItems.length > 0 || pendingSubscription;

  // Refresh product data to get latest prices including wholesale_price
  useEffect(() => {
    refreshProductData();
    fetchStoreSettings();
  }, [refreshProductData]);

  // Fetch store settings
  const fetchStoreSettings = async () => {
    try {
      const response = await axios.get(`${API}/store/settings`);
      setStoreSettings(response.data);
      
      // Set default delivery type based on settings
      if (response.data.instant_delivery_enabled && !response.data.slotted_delivery_enabled) {
        setDeliveryType('instant');
      } else if (response.data.slotted_delivery_enabled) {
        setDeliveryType('slotted');
        fetchDeliverySlots(selectedDate);
      }
    } catch (error) {
      console.log('Failed to load store settings');
    }
  };

  // Fetch delivery slots for a date
  const fetchDeliverySlots = async (date) => {
    setSlotsLoading(true);
    try {
      const response = await axios.get(`${API}/delivery-slots?date=${date}`);
      setDeliverySlots(response.data);
      
      // Auto-select first available slot
      const availableSlot = response.data.find(s => s.available);
      if (availableSlot) {
        setSelectedSlotId(availableSlot.id);
      }
    } catch (error) {
      console.log('Failed to load delivery slots');
    } finally {
      setSlotsLoading(false);
    }
  };

  // Fetch slots when date changes
  useEffect(() => {
    if (deliveryType === 'slotted' && selectedDate) {
      fetchDeliverySlots(selectedDate);
    }
  }, [selectedDate, deliveryType]);

  // Calculate delivery fee
  const getDeliveryFee = () => {
    const subtotal = getWholesaleCartTotal() + getWholesaleSubscriptionTotal();
    
    // Free delivery above threshold
    if (subtotal >= (storeSettings?.min_order_for_free_delivery || 500)) {
      return 0;
    }
    
    if (deliveryType === 'instant') {
      return storeSettings?.instant_delivery_fee || 0;
    }
    
    if (deliveryType === 'slotted' && selectedSlotId) {
      const slot = deliverySlots.find(s => s.id === selectedSlotId);
      return (slot?.delivery_fee || 0) + (storeSettings?.default_delivery_fee || 0);
    }
    
    return storeSettings?.default_delivery_fee || 0;
  };

  // Calculate cart total using wholesale prices if applicable
  const getWholesaleCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const qty = item.product.selectedQty || 1;
      return total + calculatePrice(item.product, qty);
    }, 0);
  };

  // Calculate subscription total using wholesale prices if applicable
  const getWholesaleSubscriptionTotal = () => {
    if (!pendingSubscription?.products) return 0;
    return pendingSubscription.products.reduce((total, product) => {
      const qty = product.selectedQty || 1;
      return total + calculatePrice(product, qty);
    }, 0);
  };

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
    fetchDiscountTiers();
    trackPageView('Checkout');
    trackCheckoutStarted(getWholesaleCartTotal() + getWholesaleSubscriptionTotal());
    const defaultAddr = addresses.find(a => a.is_default);
    if (defaultAddr) {
      setSelectedAddressId(defaultAddr.id);
    } else if (addresses.length > 0) {
      setSelectedAddressId(addresses[0].id);
    }
  }, [user, cartItems, addresses, navigate]);

  // Fetch discount tiers
  const fetchDiscountTiers = async () => {
    try {
      const res = await axios.get(`${API}/discount-tiers`);
      setDiscountTiers(res.data);
    } catch (error) {
      console.log('No discount tiers');
    }
  };

  // Calculate order discount whenever cart total changes - skip for wholesale users
  useEffect(() => {
    // No bulk/order-value discounts for wholesale customers
    if (wholesaleEnabled) {
      setOrderDiscount(null);
      return;
    }
    
    const subtotal = getWholesaleCartTotal() + getWholesaleSubscriptionTotal();
    if (subtotal > 0 && discountTiers.length > 0) {
      // Find the highest applicable tier
      const sortedTiers = [...discountTiers].sort((a, b) => b.min_order_value - a.min_order_value);
      const applicableTier = sortedTiers.find(tier => subtotal >= tier.min_order_value);
      
      if (applicableTier) {
        const discountAmount = (subtotal * applicableTier.discount_percent) / 100;
        setOrderDiscount({
          tier: applicableTier,
          discount_amount: discountAmount
        });
      } else {
        setOrderDiscount(null);
      }
    } else {
      setOrderDiscount(null);
    }
  }, [cartItems, pendingSubscription, discountTiers, wholesaleEnabled]);

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

  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId);
  };

  const handleApplyCoupon = async () => {
    // No coupons for wholesale customers
    if (wholesaleEnabled) {
      toast.error('Coupons cannot be applied with wholesale pricing');
      return;
    }
    
    if (!couponCode.trim()) return;
    const orderAmount = getWholesaleCartTotal() + getWholesaleSubscriptionTotal();
    setCouponLoading(true);
    try {
      const response = await axios.post(
        `${API}/coupons/validate?code=${encodeURIComponent(couponCode.trim().toUpperCase())}&order_amount=${orderAmount}&user_id=${user?.id || ''}`
      );
      setAppliedCoupon({ 
        code: response.data.code, 
        discount_amount: response.data.discount,
        discount_type: response.data.discount_type,
        discount_value: response.data.discount_value
      });
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

    setLoading(true);
    
    // Create unified order with both one-time items and subscription
    const createUnifiedOrder = async (paymentId, razorpayOrderId) => {
      // Get the default address if selectedAddressId is not set
      const addressId = selectedAddressId || addresses.find(a => a.is_default)?.id || addresses[0]?.id;
      if (!addressId) {
        throw new Error('No delivery address selected');
      }
      
      // Prepare one-time items with wholesale prices if applicable
      let oneTimeItems = null;
      if (cartItems.length > 0) {
        oneTimeItems = cartItems.map(item => ({ 
          product_id: item.product.id, 
          quantity: item.product.selectedQty || 1, 
          unit: item.product.unit || 'kg',
          price: getDisplayPrice(item.product)  // Use wholesale price if applicable
        }));
      }
      
      // Prepare subscription data with wholesale prices if applicable
      let subscriptionData = null;
      if (pendingSubscription) {
        const subscriptionSubtotal = getWholesaleSubscriptionTotal();
        const bulkDiscountOnSubscription = orderDiscount ? (subscriptionSubtotal * orderDiscount.tier.discount_percent) / 100 : 0;
        const actualMonthlyPaid = subscriptionSubtotal - bulkDiscountOnSubscription;
        
        subscriptionData = {
          frequency: pendingSubscription.plan.frequency,
          delivery_days: pendingSubscription.deliveryDays,
          start_date: pendingSubscription.startDate,
          items: pendingSubscription.products.map(p => ({ 
            product_id: p.product_id || p.id, 
            quantity: p.selectedQty || 1,
            unit: p.unit || 'kg',
            price: getDisplayPrice(p)  // Use wholesale price if applicable
          })),
          subtotal: subscriptionSubtotal,
          total_price: actualMonthlyPaid,
          bulk_discount_percent: orderDiscount?.tier?.discount_percent || 0,
          bulk_discount_amount: bulkDiscountOnSubscription,
          next_delivery_date: pendingSubscription.startDate
        };
      }
      
      // Determine order type
      let orderType = 'one_time';
      if (oneTimeItems && subscriptionData) {
        orderType = 'mixed';
      } else if (subscriptionData) {
        orderType = 'subscription';
      }
      
      const orderData = {
        user_id: user.id,
        address_id: addressId,
        one_time_items: oneTimeItems,
        subscription: subscriptionData,
        subtotal: grandTotal + orderDiscountAmount + couponDiscount, // Original total before discounts
        delivery_fee: getDeliveryFee(),
        // Delivery slot info
        delivery_type: deliveryType,
        delivery_date: deliveryType === 'slotted' ? selectedDate : null,
        delivery_slot_id: deliveryType === 'slotted' ? selectedSlotId : null,
        // Automatic order-value based discount
        discount_type: orderDiscount ? 'bulk_discount' : null,
        discount_percent: orderDiscount?.tier?.discount_percent || 0,
        discount_amount: orderDiscountAmount,
        discount_min_order_value: orderDiscount?.tier?.min_order_value || null,
        // Coupon discount
        coupon_code: appliedCoupon?.code || null,
        coupon_discount: couponDiscount,
        total: grandTotal + getDeliveryFee(),
        order_type: orderType,
        payment_id: paymentId,
        razorpay_order_id: razorpayOrderId,
        payment_status: 'paid'
      };
      
      await axios.post(`${API}/orders`, orderData);
    };

    try {
      const hasOnlySubscription = pendingSubscription && cartItems.length === 0;
      const hasBoth = pendingSubscription && cartItems.length > 0;
      const orderType = hasOnlySubscription ? 'subscription' : hasBoth ? 'mixed' : 'one_time';
      const description = hasOnlySubscription ? `Subscription - ${pendingSubscription.plan?.name}` : hasBoth ? 'Order + Subscription' : 'Order Payment';

      const orderResponse = await axios.post(`${API}/payments/create-order`, {
        amount: grandTotal,
        receipt: `order_${user.id}_${Date.now()}`.slice(0, 40),
        notes: { user_id: user.id, type: orderType }
      });

      const { order_id, amount: orderAmount, currency, key_id, test_mode } = orderResponse.data;

      // Test mode - bypass Razorpay UI and simulate successful payment
      if (test_mode) {
        try {
          const mockPaymentId = `pay_test_${Date.now()}`;
          const mockSignature = 'test_signature_mock';
          
          await axios.post(`${API}/payments/verify`, {
            razorpay_order_id: order_id,
            razorpay_payment_id: mockPaymentId,
            razorpay_signature: mockSignature
          });
          
          // Create unified order
          await createUnifiedOrder(mockPaymentId, order_id);
          
          setOrderPlaced(true);
          clearCart();
          clearSubscription();
          toast.success(hasOnlySubscription ? 'Subscription Created! (Test Mode)' : hasBoth ? 'Order & Subscription Created! (Test Mode)' : 'Order Placed! (Test Mode)');
          navigate('/orders');
        } catch (error) {
          console.error('Order creation error:', error);
          const errorMsg = error.response?.data?.detail || error.message || 'Unknown error';
          toast.error(`Order creation failed: ${errorMsg}`);
        }
        setLoading(false);
        return;
      }

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
            
            // Create unified order
            await createUnifiedOrder(response.razorpay_payment_id, response.razorpay_order_id);
            
            setOrderPlaced(true);
            clearCart();
            clearSubscription();
            toast.success(hasOnlySubscription ? 'Subscription Created!' : hasBoth ? 'Order & Subscription Created!' : 'Order Placed!');
            navigate('/orders');
          } catch (error) {
            console.error('Payment verification/order creation error:', error);
            const errorMsg = error.response?.data?.detail || error.message || 'Unknown error';
            toast.error(`Order creation failed: ${errorMsg}. Please contact support.`);
          }
        },
        prefill: { name: user.name, contact: user.phone, email: user.email || '' },
        theme: { color: '#0d9488' },
        modal: { ondismiss: () => { setLoading(false); toast.info('Payment cancelled'); } }
      };

      // Check if Razorpay script is loaded
      if (!window.Razorpay) {
        toast.error('Payment gateway not loaded. Please refresh the page.');
        setLoading(false);
        return;
      }

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        toast.error(`Payment failed: ${response.error.description || 'Please try again'}`);
        setLoading(false);
      });
      razorpay.open();
      setLoading(false);
    } catch (error) {
      console.error('Payment initiation error:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Unknown error';
      toast.error(`Failed to initiate payment: ${errorMsg}`);
      setLoading(false);
    }
  };

  if (!user || !hasItems) return null;

  const cartSubtotal = getWholesaleCartTotal();
  const subscriptionTotal = getWholesaleSubscriptionTotal();
  const couponDiscount = appliedCoupon?.discount_amount || 0;
  const orderDiscountAmount = orderDiscount?.discount_amount || 0;
  const deliveryFee = getDeliveryFee();
  const grandTotal = Math.max(0, cartSubtotal + subscriptionTotal - couponDiscount - orderDiscountAmount + deliveryFee);

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
                {addresses.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => {
                    localStorage.setItem('checkoutReturn', 'true');
                    navigate('/addresses');
                  }} className="h-8 px-2 text-xs">
                    Change Address
                  </Button>
                )}
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <MapPin className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                  <p className="text-muted-foreground mb-4">Please add a delivery address to continue</p>
                  <Button onClick={() => {
                    localStorage.setItem('checkoutReturn', 'true');
                    navigate('/addresses');
                  }} className="rounded-full">
                    <Plus className="w-4 h-4 mr-2" /> Add Delivery Address
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
                        {defaultAddr.phone && (
                          <p className="text-xs text-muted-foreground mt-0.5">Phone: {defaultAddr.phone}</p>
                        )}
                      </div>
                    );
                  })()}
                </>
              )}


            </CardContent>
          </Card>

          {/* Delivery Time Selection */}
          {(storeSettings?.instant_delivery_enabled || storeSettings?.slotted_delivery_enabled) && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold">Delivery Time</h3>
                </div>

                {/* Delivery Type Selection */}
                <div className="flex gap-3 mb-4">
                  {storeSettings?.instant_delivery_enabled && (
                    <button
                      onClick={() => setDeliveryType('instant')}
                      className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                        deliveryType === 'instant' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Zap className={`w-5 h-5 ${deliveryType === 'instant' ? 'text-primary' : 'text-gray-400'}`} />
                        <div className="text-left">
                          <p className="font-medium text-sm">Instant Delivery</p>
                          <p className="text-xs text-muted-foreground">
                            Within {storeSettings?.instant_delivery_time_minutes || 60} mins
                            {storeSettings?.instant_delivery_fee > 0 && ` • +₹${storeSettings.instant_delivery_fee}`}
                          </p>
                        </div>
                      </div>
                    </button>
                  )}
                  
                  {storeSettings?.slotted_delivery_enabled && (
                    <button
                      onClick={() => setDeliveryType('slotted')}
                      className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                        deliveryType === 'slotted' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className={`w-5 h-5 ${deliveryType === 'slotted' ? 'text-primary' : 'text-gray-400'}`} />
                        <div className="text-left">
                          <p className="font-medium text-sm">Scheduled Delivery</p>
                          <p className="text-xs text-muted-foreground">Choose date & time slot</p>
                        </div>
                      </div>
                    </button>
                  )}
                </div>

                {/* Slotted Delivery Options */}
                {deliveryType === 'slotted' && (
                  <div className="space-y-3">
                    {/* Date Selection */}
                    <div>
                      <Label className="text-sm mb-2 block">Select Date</Label>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {[0, 1, 2, 3, 4, 5, 6].map(dayOffset => {
                          const date = addDays(new Date(), dayOffset);
                          const dateStr = format(date, 'yyyy-MM-dd');
                          const isSelected = selectedDate === dateStr;
                          const isToday = dayOffset === 0;
                          
                          return (
                            <button
                              key={dayOffset}
                              onClick={() => setSelectedDate(dateStr)}
                              className={`flex-shrink-0 p-2 rounded-lg border-2 text-center min-w-[70px] transition-all ${
                                isSelected 
                                  ? 'border-primary bg-primary/5' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <p className="text-xs text-muted-foreground">{format(date, 'EEE')}</p>
                              <p className="font-semibold">{format(date, 'd')}</p>
                              <p className="text-xs text-muted-foreground">{format(date, 'MMM')}</p>
                              {isToday && <p className="text-xs text-primary font-medium">Today</p>}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Time Slot Selection */}
                    <div>
                      <Label className="text-sm mb-2 block">Select Time Slot</Label>
                      {slotsLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        </div>
                      ) : deliverySlots.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No delivery slots available for this date
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {deliverySlots.map(slot => (
                            <button
                              key={slot.id}
                              onClick={() => slot.available && setSelectedSlotId(slot.id)}
                              disabled={!slot.available}
                              className={`p-3 rounded-lg border-2 text-left transition-all ${
                                !slot.available 
                                  ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                                  : selectedSlotId === slot.id
                                    ? 'border-primary bg-primary/5'
                                    : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <p className="font-medium text-sm">{slot.name}</p>
                              <p className="text-xs text-muted-foreground">{slot.display_text}</p>
                              {slot.delivery_fee > 0 && (
                                <p className="text-xs text-primary mt-1">+₹{slot.delivery_fee}</p>
                              )}
                              {!slot.available && (
                                <p className="text-xs text-red-500 mt-1">Full</p>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Instant Delivery Info */}
                {deliveryType === 'instant' && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-800">
                        Your order will be delivered within {storeSettings?.instant_delivery_time_minutes || 60} minutes
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

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
                      <span className="text-xs text-green-600">({pendingSubscription.products?.length || 0} items)</span>
                    </div>
                    <span className="text-xs font-medium bg-green-200 text-green-800 px-2 py-0.5 rounded-full">
                      {pendingSubscription.plan?.name}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {pendingSubscription.products?.map((product) => {
                      const qty = product.selectedQty || 1;
                      const unit = product.unit || 'kg';
                      const price = product.price * qty;
                      return (
                        <div key={product.id || product.product_id} className="flex items-center gap-2 p-2 bg-white rounded-lg">
                          <img src={product.image} alt={product.name} className="w-10 h-10 rounded object-cover" />
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-medium truncate block">{product.name}</span>
                            <span className="text-xs text-muted-foreground">{formatPricePerUnit(product.price, unit)} • {formatQtyLabel(qty, unit)} - ₹{price.toFixed(0)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-2 pt-2 border-t border-green-200 space-y-1">
                    <div className="flex items-center gap-1 text-xs text-green-700">
                      <Clock className="w-3 h-3" />
                      <span>Starts: {pendingSubscription.startDate}</span>
                      <span className="mx-1">•</span>
                      <span>Days: {pendingSubscription.deliveryDays?.join(', ')}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-green-700">Per Delivery</span>
                      <span className="font-medium text-green-700">₹{pendingSubscription.perDeliveryTotal?.toFixed(0)}</span>
                    </div>
                    {pendingSubscription.plan?.discount > 0 && (
                      <>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Subtotal ({pendingSubscription.deliveriesPerWeek || 1} day/week × 4 weeks)</span>
                          <span className="text-muted-foreground line-through">
                            ₹{(pendingSubscription.perDeliveryTotal * (pendingSubscription.deliveriesPerWeek || 1) * 4).toFixed(0)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-green-600">
                          <span>Plan Discount ({pendingSubscription.plan.discount}% OFF)</span>
                          <span>-₹{pendingSubscription.discount?.toFixed(0)}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700 font-medium">Monthly Total</span>
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
                    const selectedQty = item.product.selectedQty || 1;
                    const unit = item.product.unit || 'kg';
                    const displayPrice = getDisplayPrice(item.product);
                    const unitPrice = displayPrice * selectedQty;
                    const showingWholesale = isShowingWholesale(item.product);
                    
                    return (
                      <div key={item.product.id} className={`flex items-center gap-2 p-2 rounded-lg ${isGrowing ? 'bg-amber-50' : 'bg-gray-50'}`}>
                        <div className="relative">
                          <img src={item.product.image} alt={item.product.name} className="w-12 h-12 rounded object-cover" />
                          {isGrowing && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                              <Sprout className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <p className="text-xs font-medium truncate">{item.product.name}</p>
                            {showingWholesale && (
                              <BadgePercent className="w-3 h-3 text-orange-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{formatPricePerUnit(displayPrice, unit)}</p>
                        </div>
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded font-medium">{formatQtyLabel(selectedQty, unit)}</span>
                        <span className="text-sm font-medium">₹{unitPrice.toFixed(0)}</span>
                      </div>
                    );
                  })}
                  
                  {/* Show overall delivery date for one-time items */}
                  {(() => {
                    let latestDeliveryDate = addDays(new Date(), 1);
                    if (latestDeliveryDate.getDay() === 0) latestDeliveryDate = addDays(latestDeliveryDate, 1);
                    
                    cartItems.forEach(item => {
                      const isGrowing = item.product.stock_status === 'growing' || item.product.isGrowing;
                      let itemDelivery;
                      
                      if (isGrowing) {
                        if (item.product.availability_date) {
                          // availability_date + 1 day, skip Sunday
                          itemDelivery = addDays(new Date(item.product.availability_date), 1);
                        } else {
                          const readyDays = item.product.ready_in_days || item.product.deliveryDays || 7;
                          itemDelivery = addDays(new Date(), readyDays + 1);
                        }
                        // Skip Sunday
                        if (itemDelivery.getDay() === 0) itemDelivery = addDays(itemDelivery, 1);
                      } else {
                        // In-stock: next day delivery, skip Sunday
                        itemDelivery = addDays(new Date(), 1);
                        if (itemDelivery.getDay() === 0) itemDelivery = addDays(itemDelivery, 1);
                      }
                      
                      if (itemDelivery > latestDeliveryDate) {
                        latestDeliveryDate = itemDelivery;
                      }
                    });
                    
                    return (
                      <div className="mt-3 p-2 bg-green-50 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-medium text-green-700">Estimated Delivery</span>
                        </div>
                        <span className="text-xs font-semibold text-green-800">{format(latestDeliveryDate, 'MMM d, yyyy')}</span>
                      </div>
                    );
                  })()}
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
                  <span className="text-muted-foreground">
                    Delivery
                    {deliveryType === 'instant' && ' (Instant)'}
                    {deliveryType === 'slotted' && selectedSlotId && ` (${deliverySlots.find(s => s.id === selectedSlotId)?.name || 'Scheduled'})`}
                  </span>
                  {deliveryFee > 0 ? (
                    <span>₹{deliveryFee.toFixed(0)}</span>
                  ) : (
                    <span className="text-green-600 font-medium">FREE</span>
                  )}
                </div>
                {orderDiscount && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Discount ({orderDiscount.tier.discount_percent}% off)
                    </span>
                    <span>-₹{orderDiscountAmount.toFixed(0)}</span>
                  </div>
                )}
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {appliedCoupon.code} ({appliedCoupon.discount_type === 'percentage' ? `${appliedCoupon.discount_value}% off` : `₹${appliedCoupon.discount_value} off`})
                    </span>
                    <span>-₹{couponDiscount.toFixed(0)}</span>
                  </div>
                )}
              </div>

              {/* Order Discount Banner - not shown for wholesale users */}
              {orderDiscount && !wholesaleEnabled && (
                <div className="mt-3 p-2.5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎉</span>
                    <span className="text-sm font-medium text-green-700">
                      You saved {orderDiscount.tier.discount_percent}% on orders above ₹{orderDiscount.tier.min_order_value.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Show next tier hint - not shown for wholesale users */}
              {!orderDiscount && discountTiers.length > 0 && !wholesaleEnabled && (
                <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-700">
                    💡 Add ₹{(discountTiers[0]?.min_order_value - (cartSubtotal + subscriptionTotal)).toFixed(0)} more to get {discountTiers[0]?.discount_percent}% off!
                  </p>
                </div>
              )}

              {/* Wholesale pricing notice */}
              {wholesaleEnabled && (
                <div className="mt-3 p-2.5 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <BadgePercent className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-700">
                      Wholesale prices applied (offers not applicable)
                    </span>
                  </div>
                </div>
              )}

              {/* Apply Coupon - not shown for wholesale users */}
              {!wholesaleEnabled && (
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
              )}
              
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-primary">₹{grandTotal.toFixed(0)}</span>
                </div>
              </div>

              <Button
                data-testid="pay-now-button"
                onClick={handlePayment}
                disabled={loading || !selectedAddressId}
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
