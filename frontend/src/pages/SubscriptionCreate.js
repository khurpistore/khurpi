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
import { CalendarIcon, Check } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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
      
      // If stock issue, suggest alternative date
      if (errorMsg.includes('out of stock')) {
        toast.info('Please select a later start date for out-of-stock products');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-primary mb-4 heading-text">
            Create Your Subscription
          </h2>
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full ${
                  step >= s ? 'bg-primary' : 'bg-border'
                }`}
              />
            ))}
          </div>
        </div>

        {step === 1 && (
          <div>
            <h3 className="text-2xl font-semibold text-primary mb-6 heading-text">
              Step 1: Select Microgreens
            </h3>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
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
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <h4 className="text-xl font-semibold text-primary heading-text">
                              {product.name}
                            </h4>
                            {isSelected && (
                              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{product.benefit}</p>
                          <p className="text-lg font-bold text-primary">₹{product.price}/tray</p>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                          <Label>Trays per delivery</Label>
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
            <div className="flex justify-end">
              <Button
                data-testid="next-to-step2-button"
                onClick={() => setStep(2)}
                disabled={selectedProducts.length === 0}
                className="bg-primary hover:bg-primary/90 rounded-full px-8"
              >
                Next: Schedule
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="text-2xl font-semibold text-primary mb-6 heading-text">
              Step 2: Choose Schedule
            </h3>
            
            {stockWarning && (
              <Card className="mb-6 border-amber-200 bg-amber-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-amber-700 text-lg">⚠</span>
                    </div>
                    <div>
                      <p className="font-semibold text-amber-900 mb-1">Stock Availability Notice</p>
                      <p className="text-sm text-amber-800 mb-2">{stockWarning.message}</p>
                      <p className="text-sm text-amber-900 font-medium">
                        Earliest available delivery: {format(stockWarning.earliestDate, 'PPP')}
                      </p>
                      <p className="text-xs text-amber-700 mt-1">
                        Please select a start date on or after this date to include all products.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <Label>Delivery Frequency</Label>
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
                  <Label>Preferred Delivery Day</Label>
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
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        data-testid="start-date-button"
                        variant="outline"
                        className="w-full justify-start text-left font-normal mt-1"
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
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-between mt-6">
              <Button
                data-testid="back-to-step1-button"
                variant="outline"
                onClick={() => setStep(1)}
                className="rounded-full"
              >
                Back
              </Button>
              <Button
                data-testid="next-to-step3-button"
                onClick={() => setStep(3)}
                disabled={!startDate}
                className="bg-primary hover:bg-primary/90 rounded-full px-8"
              >
                Next: Review
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 className="text-2xl font-semibold text-primary mb-6 heading-text">
              Step 3: Review & Confirm
            </h3>
            <Card className="mb-6">
              <CardContent className="p-6">
                <h4 className="font-semibold text-lg mb-4">Order Summary</h4>
                <div className="space-y-3">
                  {selectedProducts.map((item) => {
                    const product = products.find(p => p.id === item.product_id);
                    return product ? (
                      <div key={item.product_id} className="flex justify-between">
                        <span>
                          {product.name} × {item.quantity}
                        </span>
                        <span className="font-semibold">₹{product.price * item.quantity}</span>
                      </div>
                    ) : null;
                  })}
                  <div className="border-t pt-3 flex justify-between text-lg font-bold">
                    <span>Total per delivery</span>
                    <span data-testid="total-price">₹{calculateTotal()}</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frequency:</span>
                    <span className="font-medium capitalize">{frequency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Day:</span>
                    <span className="font-medium">{deliveryDay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start Date:</span>
                    <span className="font-medium">{startDate ? format(startDate, 'PPP') : ''}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-between">
              <Button
                data-testid="back-to-step2-button"
                variant="outline"
                onClick={() => setStep(2)}
                className="rounded-full"
              >
                Back
              </Button>
              <Button
                data-testid="confirm-subscription-button"
                onClick={handleSubmit}
                disabled={loading}
                className="bg-primary hover:bg-primary/90 rounded-full px-8"
              >
                {loading ? 'Processing...' : 'Confirm Subscription'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionCreate;