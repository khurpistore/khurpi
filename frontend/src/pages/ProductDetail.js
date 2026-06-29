import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Sprout, Heart, ShieldCheck, ShoppingCart, Sparkles, Truck, Tag, Zap, BadgePercent } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWholesale } from '@/hooks/useWholesale';
import { format, addDays } from 'date-fns';

// Import from core module - Single source of truth
import { 
  QuantitySelector,
  formatQuantity, 
  formatPricePerUnit,
  getQuantityOptions,
  getDefaultQuantity,
  getStockStatus,
  canOrderProduct
} from '../core';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProductDetail = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedQty, setSelectedQty] = useState(0.5);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { id } = useParams();
  const { wholesaleEnabled, getDisplayPrice, calculatePrice, isShowingWholesale } = useWholesale();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API}/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      toast.error('Failed to load product details');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    const stockInfo = getStockStatus(product);
    if (stockInfo.status === 'out_of_stock') {
      toast.error('This product is currently out of stock');
      return;
    }
    
    const displayPrice = getDisplayPrice(product);
    const totalPrice = displayPrice * selectedQty;
    const showingWholesale = isShowingWholesale(product);
    const unit = product.unit || 'kg';
    
    const productWithDetails = {
      ...product,
      selectedQty: selectedQty,
      isGrowing: stockInfo.status === 'growing',
      deliveryDays: stockInfo.status === 'growing' 
        ? (product.ready_in_days || product.growth_days) 
        : product.growth_days,
      displayPrice: displayPrice,
      isWholesale: showingWholesale
    };
    
    addToCart(productWithDetails, 1);
    toast.success(`${product.name} (${formatQuantity(selectedQty, unit)}) added to cart`, {
      description: `₹${totalPrice.toFixed(0)}${showingWholesale ? ' (Wholesale)' : ''}`
    });
  };

  // Use local function to avoid conflict with imported getStockStatus
  const getProductStockStatus = () => {
    if (!product) return { status: 'loading' };
    return getStockStatus(product);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="bg-gradient-to-b from-green-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <Button
          data-testid="back-to-products-button"
          variant="ghost"
          onClick={() => navigate('/products')}
          className="mb-6 rounded-full"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Button>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden shadow-lg">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="space-y-6 sm:space-y-8">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-4 heading-text">
                {product.name}
              </h1>
              
              {/* Stock Status with Delivery Date */}
              {(() => {
                const status = getStockStatus(product).status;
                let deliveryDate;
                let deliveryText;
                
                if (status === 'in_stock') {
                  // In stock: delivery next day, skip Sunday
                  deliveryDate = addDays(new Date(), 1);
                  if (deliveryDate.getDay() === 0) { // Sunday
                    deliveryDate = addDays(deliveryDate, 1); // Move to Monday
                  }
                  deliveryText = 'Tomorrow';
                  if (addDays(new Date(), 1).getDay() === 0) {
                    deliveryText = 'Monday';
                  }
                } else if (status === 'growing') {
                  // Growing: delivery = availability_date + 1 day
                  if (product.availability_date) {
                    deliveryDate = addDays(new Date(product.availability_date), 1);
                  } else {
                    deliveryDate = addDays(new Date(), (product.ready_in_days || product.growth_days) + 1);
                  }
                  // Skip Sunday
                  if (deliveryDate.getDay() === 0) {
                    deliveryDate = addDays(deliveryDate, 1);
                  }
                }
                
                if (status === 'out_of_stock') {
                  return (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 font-semibold">Currently Out of Stock</p>
                    </div>
                  );
                } else if (status === 'growing') {
                  return (
                    <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
                      <p className="text-amber-800 font-semibold flex items-center gap-2">
                        <Sprout className="w-4 h-4" />
                        Currently Growing
                      </p>
                      <p className="text-amber-700 text-sm flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Delivery by&nbsp;{format(deliveryDate, 'MMM d, yyyy')}
                      </p>
                    </div>
                  );
                } else {
                  return (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                      <p className="text-green-800 font-semibold flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Delivery by&nbsp;{deliveryText}
                      </p>
                    </div>
                  );
                }
              })()}
              
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm sm:text-base">
                <div className="flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-secondary" />
                  <span>100% Organic</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-secondary" />
                  <span>Freshly Harvested</span>
                </div>
              </div>
            </div>

            {/* Buy Options */}
            <div className="space-y-4 p-4 sm:p-6 bg-white rounded-xl border border-border shadow-sm">
              
              {/* Wholesale Badge if applicable */}
              {isShowingWholesale(product) && (
                <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg border border-orange-200">
                  <BadgePercent className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-700">Wholesale Price Applied</span>
                </div>
              )}
              
              {/* Quantity Selector */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Qty:</span>
                <QuantitySelector
                  product={product}
                  value={selectedQty}
                  onChange={setSelectedQty}
                  size="lg"
                  className="w-28"
                />
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary">
                    ₹{calculatePrice(product, selectedQty).toFixed(0)}
                  </span>
                  {isShowingWholesale(product) && (
                    <Badge className="bg-orange-100 text-orange-700">WP</Badge>
                  )}
                </div>
              </div>

              <Button
                data-testid="add-to-cart-detail-button"
                size="lg"
                onClick={handleAddToCart}
                disabled={getStockStatus(product).status === 'out_of_stock'}
                className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-5 text-lg font-medium"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart - ₹{calculatePrice(product, selectedQty).toFixed(0)}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">or</span>
                </div>
              </div>

              {/* Subscribe & Save Section */}
              <div className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 rounded-xl p-4 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-yellow-300" />
                  <span className="font-bold text-lg">Subscribe & Save More!</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
                    <Truck className="w-3 h-3" /> FREE Delivery
                  </span>
                  <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
                    <Tag className="w-3 h-3" /> Up to 50% OFF
                  </span>
                </div>
                <Button
                  data-testid="start-subscription-detail-button"
                  size="lg"
                  onClick={() => {
                    if (!user) {
                      toast.error('Please login to start a subscription');
                      navigate('/login');
                      return;
                    }
                    navigate('/subscription/create');
                  }}
                  className="w-full bg-white text-green-700 hover:bg-yellow-50 hover:text-green-800 rounded-full py-5 text-base font-bold shadow-lg"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Subscription →
                </Button>
              </div>
            </div>

            {/* Health Benefits */}
            <Card className="border-secondary/20">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-3 mb-4">
                  <Heart className="w-6 h-6 text-secondary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-primary mb-2 heading-text">
                      Health Benefits
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{product.benefit}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Nutritional Profile */}
            {product.nutrients && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-semibold text-primary mb-3 heading-text">
                        Nutritional Profile
                      </h3>
                      <div className="space-y-2 text-sm sm:text-base">
                        {product.nutrients.split('|').map((nutrient, index) => {
                          const [category, values] = nutrient.split(':');
                          return (
                            <div key={index} className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                              <span className="font-semibold text-primary sm:min-w-[100px]">
                                {category.trim()}:
                              </span>
                              <span className="text-muted-foreground">{values?.trim()}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="bg-secondary/10 rounded-xl p-4 sm:p-6">
              <h4 className="font-semibold text-primary mb-3">Why Choose Khurpi Microgreens?</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-secondary mt-0.5">✓</span>
                  <span>Harvested within 24 hours of delivery</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary mt-0.5">✓</span>
                  <span>Grown without pesticides or chemicals</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary mt-0.5">✓</span>
                  <span>Packed with nutrients - up to 40x more than mature plants</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary mt-0.5">✓</span>
                  <span>Flexible subscription with pause/skip options</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
