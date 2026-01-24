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
import { CalendarIcon, Check, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const STEPS = [
  { id: 1, title: 'Select Products' },
  { id: 2, title: 'Schedule' },
  { id: 3, title: 'Review & Confirm' }
];

const SubscriptionCreate = () => {
  const [step, setStep] = useState(1);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [trayCount, setTrayCount] = useState(1);
  const [frequency, setFrequency] = useState('weekly');
  const [deliveryDay, setDeliveryDay] = useState('Monday');
  const [startDate, setStartDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stockWarning, setStockWarning] = useState(null);
  const [minStartDate, setMinStartDate] = useState(new Date());
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProducts();
  }, [user, navigate]);

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
        p.product_id === productId ? { ...p, quantity: parseInt(quantity) } : p
      )
    );
  };

  const calculateTotal = () => {
    let total = 0;
    selectedProducts.forEach(item => {
      const product = products.find(p => p.id === item.product_id);
      if (product) {
        total += product.price * item.quantity;
      }
    });
    return total;
  };

  const handleSubmit = async () => {
    if (!user?.address) {
      toast.error('Please add your address in profile before subscribing');
      navigate('/profile');
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

    setLoading(true);

    try {
      const subscriptionData = {
        frequency,
        delivery_day: deliveryDay,
        start_date: format(startDate, 'yyyy-MM-dd'),
        tray_count: trayCount,
        items: selectedProducts,
        total_price: calculateTotal()
      };

      await axios.post(`${API}/subscriptions?user_id=${user.id}`, subscriptionData);
      toast.success('Subscription created successfully!');
      navigate('/subscriptions');
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to create subscription';
      toast.error(errorMsg);
      
      if (errorMsg.includes('out of stock')) {
        toast.info('Please select a later start date for out-of-stock products');
      }
    } finally {
      setLoading(false);
    }
  };

  const canGoNext = () => {
    if (step === 1) return selectedProducts.length > 0;
    if (step === 2) return startDate !== null;
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
                disabled={loading}
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
        <p className="text-xs sm:text-sm text-muted-foreground mb-6">
          Delivering fresh microgreens in NOIDA area • Save 15% with subscription
        </p>

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

        {step === 2 && (
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
            
            <Card className="mb-4 sm:mb-6 border-secondary/30 bg-secondary/5">
              <CardContent className="p-4 sm:p-6">
                <h4 className="font-semibold text-primary mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                  Selected Products
                </h4>
                <div className="space-y-2 sm:space-y-3">
                  {selectedProducts.map((item) => {
                    const product = products.find(p => p.id === item.product_id);
                    return product ? (
                      <div
                        key={item.product_id}
                        className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 bg-white rounded-lg border border-border"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-primary text-sm sm:text-base truncate">{product.name}</h5>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {item.quantity} tray{item.quantity > 1 ? 's' : ''} × ₹{product.price}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary text-sm sm:text-base">₹{(product.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ) : null;
                  })}
                  <div className="border-t pt-3 flex justify-between items-center">
                    <span className="font-semibold text-primary text-sm sm:text-base">Total per delivery</span>
                    <span className="text-xl sm:text-2xl font-bold text-primary">₹{calculateTotal()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div>
                  <Label className="text-sm">Delivery Frequency</Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger data-testid="frequency-select" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
          </div>
        )}

        {step === 3 && (
          <div>
            <Card className="mb-4 sm:mb-6">
              <CardContent className="p-4 sm:p-6">
                <h4 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Order Summary</h4>
                <div className="space-y-2 sm:space-y-3">
                  {selectedProducts.map((item) => {
                    const product = products.find(p => p.id === item.product_id);
                    return product ? (
                      <div key={item.product_id} className="flex justify-between text-sm sm:text-base">
                        <span className="truncate pr-2">
                          {product.name} × {item.quantity}
                        </span>
                        <span className="font-semibold flex-shrink-0">₹{product.price * item.quantity}</span>
                      </div>
                    ) : null;
                  })}
                  <div className="border-t pt-3 flex justify-between text-base sm:text-lg font-bold">
                    <span>Total per delivery</span>
                    <span data-testid="total-price">₹{calculateTotal()}</span>
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t space-y-2">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-muted-foreground">Frequency:</span>
                    <span className="font-medium capitalize">{frequency}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-muted-foreground">Delivery Day:</span>
                    <span className="font-medium">{deliveryDay}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-muted-foreground">Start Date:</span>
                    <span className="font-medium">{startDate ? format(startDate, 'PPP') : ''}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 sm:p-6">
                <h4 className="font-semibold text-green-800 mb-2">Subscription Benefits</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>✓ Save 15% on every delivery</li>
                  <li>✓ Free delivery on all orders</li>
                  <li>✓ Pause or skip anytime</li>
                  <li>✓ Freshly harvested just for you</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionCreate;
