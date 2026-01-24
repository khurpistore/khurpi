import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CalendarIcon, Check, Package, ChevronLeft, ChevronRight, Sparkles, Tag, Truck, CreditCard, Gift, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const STEPS = [
  { id: 1, title: 'Select Products' },
  { id: 2, title: 'Choose Plan' },
  { id: 3, title: 'Review & Pay' }
];

const SubscriptionCreate = () => {
  const [step, setStep] = useState(1);
  const [products, setProducts] = useState([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [deliveryDay, setDeliveryDay] = useState('Monday');
  const [startDate, setStartDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stockWarning, setStockWarning] = useState(null);
  const [minStartDate, setMinStartDate] = useState(new Date());
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  
  // Coupon and Referral states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [appliedReferral, setAppliedReferral] = useState(null);
  const [referralLoading, setReferralLoading] = useState(false);
  
  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [processingPayment, setProcessingPayment] = useState(false);
  
  const navigate = useNavigate();
  const { user, addresses } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProducts();
    fetchSubscriptionPlans();
  }, [user, navigate]);

  useEffect(() => {
    // Re-fetch delivery info when addresses are loaded/changed
    fetchDeliveryInfo();
  }, [addresses]);

  useEffect(() => {
    if (selectedProducts.length > 0) {
      checkStockAvailability();
    } else {
      setStockWarning(null);
      setMinStartDate(new Date());
    }
  }, [selectedProducts]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to load products');
    }
  };

  const fetchSubscriptionPlans = async () => {
    try {
      const response = await axios.get(`${API}/settings/subscription-plans`);
      setSubscriptionPlans(response.data);
      // Select the first plan by default
      if (response.data.length > 0) {
        setSelectedPlan(response.data[0]);
      }
    } catch (error) {
      // Use default plans
      setSubscriptionPlans([
        { id: 'weekly', name: 'Weekly (1 tray/week)', frequency: 'weekly', deliveries_per_week: 1, discount: 0, trays_per_month: 4, description: 'Perfect for trying out' },
        { id: 'twice_weekly', name: 'Twice Weekly (2x/week)', frequency: 'twice_weekly', deliveries_per_week: 2, discount: 10, trays_per_month: 8, description: 'Most popular choice' },
        { id: 'four_days', name: '4 Days a Week', frequency: 'four_days', deliveries_per_week: 4, discount: 50, trays_per_month: 16, description: 'Best value - Maximum freshness' }
      ]);
    }
  };

  const fetchDeliveryInfo = async () => {
    const defaultAddress = addresses?.find(a => a.is_default);
    if (defaultAddress?.latitude && defaultAddress?.longitude) {
      try {
        const response = await axios.post(
          `${API}/settings/calculate-delivery-fee?lat=${defaultAddress.latitude}&lon=${defaultAddress.longitude}`
        );
        setDeliveryInfo(response.data);
      } catch (error) {
        console.error('Failed to calculate delivery');
      }
    }
  };

  const checkStockAvailability = async () => {
    try {
      const today = new Date();
      let maxGrowDays = 0;
      const outOfStockItems = [];

      for (const item of selectedProducts) {
        const product = products.find(p => p.id === item.product_id);
        if (product) {
          if (product.stock < item.quantity) {
            outOfStockItems.push({
              name: product.name,
              growDays: product.growth_days
            });
            if (product.growth_days > maxGrowDays) {
              maxGrowDays = product.growth_days;
            }
          }
        }
      }

      if (outOfStockItems.length > 0) {
        const earliestDate = new Date(today);
        earliestDate.setDate(earliestDate.getDate() + maxGrowDays);
        setMinStartDate(earliestDate);
        
        const productNames = outOfStockItems.map(p => `${p.name} (${p.growDays} days)`).join(', ');
        setStockWarning({
          message: `Some products are out of stock: ${productNames}`,
          earliestDate: earliestDate,
          products: outOfStockItems
        });
      } else {
        setStockWarning(null);
        setMinStartDate(new Date());
      }
    } catch (error) {
      console.error('Error checking stock:', error);
    }
  };

  const toggleProduct = (productId) => {
    if (selectedProducts.some(p => p.product_id === productId)) {
      setSelectedProducts(selectedProducts.filter(p => p.product_id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, { product_id: productId, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId, quantity) => {
    setSelectedProducts(
      selectedProducts.map(p =>
        p.product_id === productId ? { ...p, quantity: parseInt(quantity) || 1 } : p
      )
    );
  };

  const calculateSubtotal = () => {
    let total = 0;
    selectedProducts.forEach(item => {
      const product = products.find(p => p.id === item.product_id);
      if (product) {
        total += product.price * item.quantity;
      }
    });
    return total;
  };

  const calculateDiscount = () => {
    if (!selectedPlan) return 0;
    return (calculateSubtotal() * selectedPlan.discount) / 100;
  };

  const getDeliveryFee = () => {
    return deliveryInfo?.fee || 0;
  };

  const getCouponDiscount = () => {
    if (!appliedCoupon) return 0;
    return appliedCoupon.discount || 0;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const planDiscount = calculateDiscount();
    const delivery = getDeliveryFee();
    const couponDiscount = getCouponDiscount();
    return Math.max(0, subtotal - planDiscount + delivery - couponDiscount);
  };

  // Apply coupon code
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    try {
      const orderAmount = calculateSubtotal() - calculateDiscount() + getDeliveryFee();
      const response = await axios.post(`${API}/coupons/validate?code=${couponCode}&order_amount=${orderAmount}`);
      setAppliedCoupon(response.data);
      toast.success(`Coupon applied! You save ₹${response.data.discount.toFixed(2)}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid coupon code');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  // Apply referral code
  const handleApplyReferral = async () => {
    if (!referralCode.trim()) {
      toast.error('Please enter a referral code');
      return;
    }

    setReferralLoading(true);
    try {
      // Validate referral code exists
      const response = await axios.get(`${API}/admin/referrers`);
      const referrer = response.data.find(r => r.referral_code === referralCode.toUpperCase() && r.is_active);
      
      if (referrer) {
        setAppliedReferral({
          code: referrer.referral_code,
          referrer_name: referrer.name,
          referrer_id: referrer.id
        });
        toast.success(`Referral code applied! ${referrer.name} will earn commission on your order.`);
      } else {
        toast.error('Invalid or inactive referral code');
        setAppliedReferral(null);
      }
    } catch (error) {
      toast.error('Failed to validate referral code');
      setAppliedReferral(null);
    } finally {
      setReferralLoading(false);
    }
  };

  const removeReferral = () => {
    setAppliedReferral(null);
    setReferralCode('');
  };

  const handleSubmit = async () => {
    // Check if user has any addresses (new way) or legacy address
    if (addresses.length === 0 && !user?.address) {
      toast.error('Please add your address in profile before subscribing');
      navigate('/addresses');
      return;
    }

    if (selectedProducts.length === 0) {
      toast.error('Please select at least one product');
      return;
    }

    if (!startDate) {
      toast.error('Please select a start date');
      return;
    }

    if (!selectedPlan) {
      toast.error('Please select a subscription plan');
      return;
    }

    setLoading(true);
    setProcessingPayment(true);

    try {
      // Get the default address id
      const defaultAddress = addresses.find(a => a.is_default) || addresses[0];

      const subscriptionData = {
        frequency: selectedPlan.frequency,
        delivery_day: deliveryDay,
        start_date: format(startDate, 'yyyy-MM-dd'),
        tray_count: selectedProducts.reduce((sum, p) => sum + p.quantity, 0),
        items: selectedProducts,
        total_price: calculateTotal(),
        plan_id: selectedPlan.id,
        address_id: defaultAddress?.id || null,
        coupon_code: appliedCoupon?.code || null,
        coupon_discount: appliedCoupon?.discount || 0,
        referral_code: appliedReferral?.code || null,
        payment_method: paymentMethod
      };

      // Simulate payment processing for non-COD
      if (paymentMethod !== 'cod') {
        toast.info('Processing payment...');
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      const response = await axios.post(`${API}/subscriptions?user_id=${user.id}`, subscriptionData);
      
      // Apply referral if present
      if (appliedReferral) {
        try {
          await axios.post(`${API}/referrals/apply`, null, {
            params: {
              code: appliedReferral.code,
              user_id: user.id,
              order_id: response.data.id,
              order_amount: calculateTotal()
            }
          });
        } catch (err) {
          console.log('Referral application failed:', err);
        }
      }

      toast.success('Subscription created successfully! 🎉');
      navigate('/subscriptions');
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to create subscription';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
      setProcessingPayment(false);
    }
  };

  const canGoNext = () => {
    if (step === 1) return selectedProducts.length > 0;
    if (step === 2) return selectedPlan !== null;
    return true;
  };

  const goToStep = (targetStep) => {
    if (targetStep < step || canGoNext()) {
      setStep(targetStep);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Fixed Step Header */}
      <div className="sticky top-16 sm:top-20 z-40 bg-white/95 backdrop-blur-md border-b border-green-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Step Navigation Buttons at Top */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              onClick={() => goToStep(step - 1)}
              disabled={step === 1}
              className="rounded-full"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            <h2 className="text-lg sm:text-xl font-bold text-primary">
              {STEPS[step - 1].title}
            </h2>

            {step < 3 ? (
              <Button
                onClick={() => goToStep(step + 1)}
                disabled={!canGoNext()}
                className="bg-primary hover:bg-primary/90 rounded-full"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading || !startDate}
                className="bg-primary hover:bg-primary/90 rounded-full"
              >
                {loading ? 'Processing...' : 'Confirm'}
              </Button>
            )}
          </div>

          {/* Step Progress */}
          <div className="flex items-center gap-2">
            {STEPS.map((s, idx) => (
              <React.Fragment key={s.id}>
                <button
                  onClick={() => goToStep(s.id)}
                  disabled={s.id > step && !canGoNext()}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                    step === s.id 
                      ? 'bg-primary text-white' 
                      : step > s.id 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs ${
                    step === s.id 
                      ? 'bg-white/20' 
                      : step > s.id 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-200'
                  }`}>
                    {step > s.id ? <Check className="w-3 h-3" /> : s.id}
                  </span>
                  <span className="hidden sm:inline">{s.title}</span>
                </button>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 ${step > s.id ? 'bg-green-400' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Step 1: Select Products */}
        {step === 1 && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
              {products.map((product) => {
                const isSelected = selectedProducts.some(p => p.product_id === product.id);
                const selectedItem = selectedProducts.find(p => p.product_id === product.id);

                return (
                  <Card
                    key={product.id}
                    data-testid={`select-product-${product.id}`}
                    className={`cursor-pointer transition-all ${
                      isSelected ? 'border-2 border-primary shadow-md' : 'border border-border'
                    }`}
                    onClick={() => toggleProduct(product.id)}
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex gap-3 sm:gap-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 sm:w-24 sm:h-24 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-base sm:text-xl font-semibold text-primary heading-text truncate">
                              {product.name}
                            </h4>
                            {isSelected && (
                              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                              </div>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2 line-clamp-2">{product.benefit}</p>
                          <p className="text-base sm:text-lg font-bold text-primary">₹{product.price}/tray</p>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="mt-3 sm:mt-4" onClick={(e) => e.stopPropagation()}>
                          <Label className="text-xs sm:text-sm">Trays per delivery</Label>
                          <Input
                            data-testid={`quantity-input-${product.id}`}
                            type="number"
                            min="1"
                            max="10"
                            value={selectedItem?.quantity || 1}
                            onChange={(e) => updateQuantity(product.id, e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Choose Plan */}
        {step === 2 && (
          <div>
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-800">Subscription Benefits</span>
              </div>
              <ul className="text-sm text-green-700 space-y-1">
                <li>✓ Save up to 50% on every delivery</li>
                <li>✓ Free delivery on subscriptions (within 1 km)</li>
                <li>✓ Pause or skip anytime</li>
                <li>✓ Freshly harvested just for you</li>
              </ul>
            </div>

            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" />
              Select Your Plan
            </h3>

            <RadioGroup value={selectedPlan?.id} onValueChange={(id) => setSelectedPlan(subscriptionPlans.find(p => p.id === id))}>
              <div className="space-y-4">
                {subscriptionPlans.map((plan) => (
                  <Card 
                    key={plan.id}
                    className={`cursor-pointer transition-all ${
                      selectedPlan?.id === plan.id ? 'border-2 border-primary shadow-md' : 'border'
                    } ${plan.discount >= 40 ? 'bg-gradient-to-r from-green-50 to-amber-50' : ''}`}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start gap-4">
                        <RadioGroupItem value={plan.id} id={plan.id} className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <Label htmlFor={plan.id} className="text-lg font-semibold cursor-pointer">
                              {plan.name}
                            </Label>
                            <div className="flex items-center gap-2">
                              {plan.discount >= 40 && (
                                <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                                  BEST VALUE
                                </span>
                              )}
                              {plan.discount > 0 && (
                                <span className="px-3 py-1 bg-green-100 text-green-800 font-bold rounded-full">
                                  {plan.discount}% OFF
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                          <div className="flex flex-wrap gap-4 text-sm mt-2">
                            <span>
                              <span className="font-medium">{plan.deliveries_per_week}</span> {plan.deliveries_per_week > 1 ? 'deliveries' : 'delivery'}/week
                            </span>
                            {plan.trays_per_month && (
                              <span className="text-primary font-medium">
                                ~{plan.trays_per_month} trays/month
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </RadioGroup>

            {/* Price Preview */}
            {selectedPlan && selectedProducts.length > 0 && (
              <Card className="mt-6 border-primary/30">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3">Price Preview (per delivery)</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{calculateSubtotal().toFixed(2)}</span>
                    </div>
                    {selectedPlan.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({selectedPlan.discount}%)</span>
                        <span>-₹{calculateDiscount().toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1">
                        <Truck className="w-3 h-3" /> Delivery
                      </span>
                      {getDeliveryFee() === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        <span>₹{getDeliveryFee()}</span>
                      )}
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>You Pay</span>
                      <span className="text-primary">₹{calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Step 3: Schedule & Review */}
        {step === 3 && (
          <div>
            {stockWarning && (
              <Card className="mb-4 sm:mb-6 border-amber-200 bg-amber-50">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-amber-700 text-sm sm:text-lg">!</span>
                    </div>
                    <div>
                      <p className="font-semibold text-amber-900 mb-1 text-sm sm:text-base">Stock Notice</p>
                      <p className="text-xs sm:text-sm text-amber-800 mb-2">{stockWarning.message}</p>
                      <p className="text-xs sm:text-sm text-amber-900 font-medium">
                        Earliest delivery: {format(stockWarning.earliestDate, 'PPP')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Schedule */}
            <Card className="mb-6">
              <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div>
                  <Label className="text-sm">Preferred Delivery Day</Label>
                  <Select value={deliveryDay} onValueChange={setDeliveryDay}>
                    <SelectTrigger data-testid="delivery-day-select" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monday">Monday</SelectItem>
                      <SelectItem value="Tuesday">Tuesday</SelectItem>
                      <SelectItem value="Wednesday">Wednesday</SelectItem>
                      <SelectItem value="Thursday">Thursday</SelectItem>
                      <SelectItem value="Friday">Friday</SelectItem>
                      <SelectItem value="Saturday">Saturday</SelectItem>
                      <SelectItem value="Sunday">Sunday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        data-testid="start-date-button"
                        variant="outline"
                        className="w-full justify-start text-left font-normal mt-1 text-sm"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        disabled={(date) => date < minStartDate}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card className="mb-6">
              <CardContent className="p-4 sm:p-6">
                <h4 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                  Order Summary
                </h4>
                
                {/* Products */}
                <div className="space-y-2 mb-4">
                  {selectedProducts.map((item) => {
                    const product = products.find(p => p.id === item.product_id);
                    return product ? (
                      <div key={item.product_id} className="flex justify-between text-sm">
                        <span>{product.name} × {item.quantity}</span>
                        <span>₹{(product.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ) : null;
                  })}
                </div>

                {/* Plan Details */}
                {selectedPlan && (
                  <div className="border-t pt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Plan</span>
                      <span className="font-medium">{selectedPlan.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{calculateSubtotal().toFixed(2)}</span>
                    </div>
                    {selectedPlan.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Plan Discount ({selectedPlan.discount}%)</span>
                        <span>-₹{calculateDiscount().toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Truck className="w-3 h-3" /> Delivery
                      </span>
                      {getDeliveryFee() === 0 ? (
                        <span className="text-green-600 font-medium">FREE</span>
                      ) : (
                        <span>₹{getDeliveryFee()}</span>
                      )}
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between text-green-600">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3" /> Coupon ({appliedCoupon.code})
                        </span>
                        <span>-₹{getCouponDiscount().toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                      <span>Total Amount</span>
                      <span className="text-primary">₹{calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery Day</span>
                      <span className="font-medium">{deliveryDay}</span>
                    </div>
                    {startDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Start Date</span>
                        <span className="font-medium">{format(startDate, 'PPP')}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Coupon Code */}
            <Card className="mb-4">
              <CardContent className="p-4">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" />
                  Apply Coupon Code
                </h4>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                    <div>
                      <p className="font-semibold text-green-800">{appliedCoupon.code}</p>
                      <p className="text-sm text-green-600">You save ₹{appliedCoupon.discount.toFixed(2)}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={removeCoupon} className="text-red-600 hover:text-red-700">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      data-testid="coupon-input"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleApplyCoupon} 
                      disabled={couponLoading || !couponCode.trim()}
                      variant="outline"
                    >
                      {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Referral Code */}
            <Card className="mb-4">
              <CardContent className="p-4">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Gift className="w-4 h-4 text-primary" />
                  Have a Referral Code?
                </h4>
                {appliedReferral ? (
                  <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div>
                      <p className="font-semibold text-blue-800">{appliedReferral.code}</p>
                      <p className="text-sm text-blue-600">Referred by {appliedReferral.referrer_name}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={removeReferral} className="text-red-600 hover:text-red-700">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      data-testid="referral-input"
                      placeholder="Enter referral code"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleApplyReferral} 
                      disabled={referralLoading || !referralCode.trim()}
                      variant="outline"
                    >
                      {referralLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  Payment Method
                </h4>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="space-y-3">
                    <div 
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        paymentMethod === 'cod' ? 'border-primary bg-green-50' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setPaymentMethod('cod')}
                    >
                      <RadioGroupItem value="cod" id="cod" />
                      <div className="flex-1">
                        <Label htmlFor="cod" className="font-medium cursor-pointer">Cash on Delivery</Label>
                        <p className="text-xs text-muted-foreground">Pay when your order arrives</p>
                      </div>
                    </div>
                    <div 
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        paymentMethod === 'online' ? 'border-primary bg-green-50' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setPaymentMethod('online')}
                    >
                      <RadioGroupItem value="online" id="online" />
                      <div className="flex-1">
                        <Label htmlFor="online" className="font-medium cursor-pointer">Pay Online</Label>
                        <p className="text-xs text-muted-foreground">UPI, Cards, Net Banking (Razorpay)</p>
                      </div>
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">Coming Soon</span>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Savings Highlight */}
            {selectedPlan && (calculateDiscount() > 0 || getCouponDiscount() > 0) && (
              <Card className="bg-gradient-to-r from-green-100 to-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-green-800">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-bold">
                      Total Savings: ₹{(calculateDiscount() + getCouponDiscount()).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    {selectedPlan.discount > 0 && `₹${calculateDiscount().toFixed(2)} from ${selectedPlan.name}`}
                    {selectedPlan.discount > 0 && appliedCoupon && ' + '}
                    {appliedCoupon && `₹${getCouponDiscount().toFixed(2)} from coupon`}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Pay Button */}
            <div className="mt-6">
              <Button
                data-testid="pay-button"
                onClick={handleSubmit}
                disabled={loading || processingPayment || !startDate}
                className="w-full py-6 text-lg font-semibold rounded-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
              >
                {processingPayment ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    {paymentMethod === 'cod' ? `Place Order - ₹${calculateTotal().toFixed(2)}` : `Pay ₹${calculateTotal().toFixed(2)}`}
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-2">
                By placing this order, you agree to our Terms & Conditions
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionCreate;
