import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Plus, Sparkles, Truck, Tag, Zap, Sprout, Clock, XCircle, CalendarPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { format, addDays } from 'date-fns';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Generate quantity options: 25g, 50g, then 100-1000 (step 100), 1500-5000 (step 500)
const getQtyOptions = (maxQty) => {
  const options = [
    25, 50,  // Small quantities
    ...Array.from({ length: 10 }, (_, i) => (i + 1) * 100),  // 100-1000
    ...Array.from({ length: 8 }, (_, i) => 1500 + i * 500),   // 1500-5000
  ];
  return options.filter(q => q <= maxQty);
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQty, setSelectedQty] = useState({});
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { trackPageView, trackProductView, trackAddToCart } = useAnalytics();

  useEffect(() => {
    trackPageView('Products');
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (product) => {
    const status = product.stock_status || 'in_stock';
    const availableQty = product.weight || 0; // weight represents available stock in grams
    
    if (status === 'out_of_stock' || availableQty <= 0) {
      return { status: 'out_of_stock', canBuy: false, canBook: false, availableQty: 0 };
    }
    if (status === 'growing') {
      return { status: 'growing', canBuy: false, canBook: true, readyInDays: product.ready_in_days, availableQty };
    }
    return { status: 'in_stock', canBuy: true, canBook: false, availableQty };
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    const stockInfo = getStockStatus(product);
    
    if (stockInfo.status === 'out_of_stock') {
      toast.error('This product is currently unavailable');
      return;
    }
    
    // Get selected quantity or default to 100
    const qty = selectedQty[product.id] || 100;
    const totalPrice = (product.price / 100) * qty;
    
    // Add product with selected quantity and delivery info
    const productWithDetails = {
      ...product,
      selectedQty: qty,
      isGrowing: stockInfo.status === 'growing',
      deliveryDays: stockInfo.status === 'growing' 
        ? (stockInfo.readyInDays || product.growth_days) 
        : product.growth_days
    };
    
    addToCart(productWithDetails, 1);
    trackAddToCart(product, 1);
    
    if (stockInfo.status === 'growing') {
      toast.success(`${product.name} (${qty}gm) added to cart`, {
        description: `₹${totalPrice.toFixed(0)} - Delivery in ${stockInfo.readyInDays || product.growth_days} days`
      });
    } else {
      toast.success(`${product.name} (${qty}gm) added to cart`, {
        description: `₹${totalPrice.toFixed(0)}`
      });
    }
  };

  const handleProductClick = (product) => {
    trackProductView(product);
    navigate(`/products/${product.id}`);
  };

  const handleStartSubscription = () => {
    if (!user) {
      toast.error('Please login to start a subscription');
      navigate('/login');
      return;
    }
    navigate('/subscription/create');
  };

  const renderStockBadge = (product) => {
    const stockInfo = getStockStatus(product);
    
    // Calculate delivery date based on stock status
    let deliveryDate;
    let deliveryText;
    
    if (stockInfo.status === 'in_stock') {
      // In stock: delivery next day, skip Sunday
      deliveryDate = addDays(new Date(), 1);
      if (deliveryDate.getDay() === 0) { // Sunday
        deliveryDate = addDays(deliveryDate, 1); // Move to Monday
      }
      deliveryText = 'Tomorrow';
      if (addDays(new Date(), 1).getDay() === 0) {
        deliveryText = 'Monday';
      }
    } else if (stockInfo.status === 'growing') {
      // Growing: delivery = availability_date + 1 day
      if (product.availability_date) {
        deliveryDate = addDays(new Date(product.availability_date), 1);
      } else {
        deliveryDate = addDays(new Date(), (stockInfo.readyInDays || product.growth_days) + 1);
      }
      // Skip Sunday for growing products too
      if (deliveryDate.getDay() === 0) {
        deliveryDate = addDays(deliveryDate, 1);
      }
    }
    
    if (stockInfo.status === 'out_of_stock') {
      return (
        <Badge className="bg-red-100 text-red-700 border-0 text-xs">
          <XCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
          Out of Stock
        </Badge>
      );
    }
    
    if (stockInfo.status === 'growing') {
      return (
        <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
          <Sprout className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
          <span className="hidden sm:inline">Delivery by </span>{format(deliveryDate, 'MMM d')}
        </Badge>
      );
    }
    
    return (
      <Badge className="bg-green-100 text-green-700 border-0 text-xs">
        <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
        <span className="hidden sm:inline">Delivery by </span>{deliveryText}
      </Badge>
    );
  };

  const renderActionButton = (product) => {
    const stockInfo = getStockStatus(product);
    
    if (stockInfo.status === 'out_of_stock') {
      return (
        <Button
          disabled
          className="w-full bg-gray-300 text-gray-500 rounded-full mt-1 sm:mt-2 cursor-not-allowed h-8 sm:h-10 text-xs sm:text-sm"
        >
          <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          Unavailable
        </Button>
      );
    }
    
    // Both in_stock and growing use Add to Cart
    return (
      <Button
        data-testid={`add-to-cart-${product.id}`}
        onClick={(e) => handleAddToCart(e, product)}
        className="w-full bg-primary hover:bg-primary/90 rounded-full mt-1 sm:mt-2 h-8 sm:h-10 text-xs sm:text-sm"
      >
        <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
        Add to Cart
      </Button>
    );
  };

  return (
    <div className="bg-gradient-to-b from-green-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-12">
        {/* Subscribe Banner */}
        <div className="mb-6 sm:mb-12 bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 rounded-xl sm:rounded-2xl p-4 sm:p-8 text-white shadow-xl overflow-hidden relative">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
          </div>
          
          <div className="relative flex flex-col items-center justify-between gap-3 sm:gap-6 lg:flex-row">
            <div className="text-center lg:text-left flex-1">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300" />
                <h3 className="text-lg sm:text-2xl font-bold">
                  Subscribe & Unlock Premium Benefits
                </h3>
              </div>
              <p className="text-sm sm:text-lg opacity-95 mb-3 sm:mb-4">
                Why pay more? Get fresh microgreens delivered on autopilot.
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-3">
                <span className="flex items-center gap-1 sm:gap-1.5 bg-white/20 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium">
                  <Truck className="w-3 h-3 sm:w-4 sm:h-4" /> FREE Delivery
                </span>
                <span className="flex items-center gap-1 sm:gap-1.5 bg-white/20 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" /> Priority Harvest
                </span>
                <span className="flex items-center gap-1 sm:gap-1.5 bg-white/20 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium">
                  <Tag className="w-3 h-3 sm:w-4 sm:h-4" /> Flexible Plans
                </span>
              </div>
            </div>
            <Button
              data-testid="subscribe-banner-button"
              onClick={handleStartSubscription}
              size="lg"
              className="bg-white text-green-700 hover:bg-yellow-50 hover:text-green-800 rounded-full px-6 sm:px-8 py-4 sm:py-6 font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all whitespace-nowrap w-full sm:w-auto"
            >
              Start Saving Today →
            </Button>
          </div>
        </div>

        <div className="text-center mb-6 sm:mb-12">
          <h1 className="text-xl sm:text-4xl lg:text-5xl font-bold text-primary mb-2 sm:mb-4 heading-text">
            Our Premium Microgreens
          </h1>
          <p className="text-xs sm:text-lg text-muted-foreground body-text">
            Fresh microgreens, harvested and delivered to your door
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 sm:py-20">
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8" data-testid="products-grid">
            {products.map((product) => {
              const stockInfo = getStockStatus(product);
              return (
                <Card
                  key={product.id}
                  data-testid={`product-card-${product.id}`}
                  className={`overflow-hidden border border-border/50 hover:shadow-lg transition-all duration-300 group cursor-pointer ${
                    stockInfo.status === 'out_of_stock' ? 'opacity-75' : ''
                  }`}
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div className="aspect-video overflow-hidden relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                        stockInfo.status === 'out_of_stock' ? 'grayscale' : ''
                      }`}
                    />
                    {stockInfo.status === 'out_of_stock' && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Out of Stock
                        </span>
                      </div>
                    )}
                    {stockInfo.status === 'growing' && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-amber-500 text-white border-0 shadow-lg">
                          <Sprout className="w-3 h-3 mr-1" />
                          Growing
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-2.5 sm:p-6">
                    <h3 className="text-sm sm:text-2xl font-semibold text-primary mb-0.5 sm:mb-2 heading-text line-clamp-1">{product.name}</h3>
                    <p className="text-xs sm:text-base text-muted-foreground mb-2 sm:mb-4 body-text line-clamp-2 hidden sm:block">{product.benefit}</p>
                    
                    {/* Price - Mobile shows compact */}
                    <div className="sm:hidden mb-2">
                      <span className="text-base font-bold text-primary">
                        ₹{((product.price / 100) * (selectedQty[product.id] || 100)).toFixed(0)}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">
                        / {selectedQty[product.id] || 100}gm
                      </span>
                    </div>
                    
                    {/* Quantity Selector - Desktop */}
                    {stockInfo.status !== 'out_of_stock' && (
                      <div className="hidden sm:flex items-center gap-2 mb-3" onClick={(e) => e.stopPropagation()}>
                        <span className="text-sm text-muted-foreground">Qty:</span>
                        <Select
                          value={String(selectedQty[product.id] || 100)}
                          onValueChange={(value) => setSelectedQty(prev => ({ ...prev, [product.id]: parseInt(value) }))}
                        >
                          <SelectTrigger className="w-20 h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {getQtyOptions(product.weight || 5000).map((qty) => (
                              <SelectItem key={qty} value={String(qty)}>
                                {qty}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-sm text-muted-foreground">gm</span>
                        <span className="text-xl font-bold text-primary ml-auto">
                          ₹{((product.price / 100) * (selectedQty[product.id] || 100)).toFixed(0)}
                        </span>
                      </div>
                    )}
                    
                    {/* Quantity Selector - Mobile */}
                    {stockInfo.status !== 'out_of_stock' && (
                      <div className="flex sm:hidden items-center gap-1 mb-2" onClick={(e) => e.stopPropagation()}>
                        <Select
                          value={String(selectedQty[product.id] || 100)}
                          onValueChange={(value) => setSelectedQty(prev => ({ ...prev, [product.id]: parseInt(value) }))}
                        >
                          <SelectTrigger className="w-16 h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {getQtyOptions(product.weight || 5000).slice(0, 6).map((qty) => (
                              <SelectItem key={qty} value={String(qty)}>
                                {qty}gm
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    <div className="mb-2 sm:mb-3">
                      {renderStockBadge(product)}
                    </div>

                    {renderActionButton(product)}
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

export default Products;
