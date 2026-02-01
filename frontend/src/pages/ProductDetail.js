import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Clock, Sprout, Heart, ShieldCheck, ShoppingCart, Sparkles, Truck, Tag, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

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

const ProductDetail = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedQty, setSelectedQty] = useState(100);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { id } = useParams();

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
    const stockInfo = getStockStatus();
    if (stockInfo.status === 'out_of_stock') {
      toast.error('This product is currently out of stock');
      return;
    }
    
    const totalPrice = (product.price / 100) * selectedQty;
    
    const productWithDetails = {
      ...product,
      selectedQty: selectedQty,
      isGrowing: stockInfo.status === 'growing',
      deliveryDays: stockInfo.status === 'growing' 
        ? (product.ready_in_days || product.growth_days) 
        : product.growth_days
    };
    
    addToCart(productWithDetails, 1);
    toast.success(`${product.name} (${selectedQty}gm) added to cart`, {
      description: `₹${totalPrice.toFixed(0)}`
    });
  };

  const getStockStatus = () => {
    if (!product) return { status: 'loading' };
    const status = product.stock_status || 'in_stock';
    if (status === 'out_of_stock' || product.stock <= 0) {
      return { status: 'out_of_stock' };
    }
    if (status === 'growing') {
      return { status: 'growing', readyInDays: product.ready_in_days };
    }
    return { status: 'in_stock' };
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
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="text-3xl sm:text-4xl font-bold text-primary">₹{product.price}</div>
                <div className="text-muted-foreground">per 100gm</div>
              </div>
              
              {getStockStatus().status === 'out_of_stock' ? (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 font-semibold mb-1">Currently Out of Stock</p>
                  <p className="text-red-600 text-sm">
                    This product will be available for delivery in {product.growth_days} days. 
                    You can schedule your subscription to start after {product.growth_days} days from today.
                  </p>
                </div>
              ) : getStockStatus().status === 'growing' ? (
                <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-amber-800 font-semibold flex items-center gap-2">
                    <Sprout className="w-4 h-4" />
                    Currently Growing - Ready in {product.ready_in_days || product.growth_days} days
                  </p>
                </div>
              ) : (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-semibold">In Stock - Available up to {product.weight || 5000}gm</p>
                </div>
              )}
              
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm sm:text-base">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-secondary" />
                  <span>Ready in {product.growth_days} days</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-secondary" />
                  <span>100% Organic</span>
                </div>
              </div>
            </div>

            {/* Buy Options */}
            <div className="space-y-4 p-4 sm:p-6 bg-white rounded-xl border border-border shadow-sm">
              <h3 className="font-semibold text-primary">Buy Now</h3>
              
              {/* Quantity Selector */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Qty:</span>
                <Select
                  value={String(selectedQty)}
                  onValueChange={(value) => setSelectedQty(parseInt(value))}
                >
                  <SelectTrigger className="w-24 h-10">
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
                <span className="text-2xl font-bold text-primary ml-auto">
                  ₹{((product.price / 100) * selectedQty).toFixed(0)}
                </span>
              </div>

              <Button
                data-testid="add-to-cart-detail-button"
                size="lg"
                onClick={handleAddToCart}
                disabled={getStockStatus().status === 'out_of_stock'}
                className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-5 text-lg font-medium"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart - ₹{((product.price / 100) * selectedQty).toFixed(0)}
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
