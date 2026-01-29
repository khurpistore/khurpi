import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Plus, Sparkles, Truck, Tag, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useAnalytics } from '@/hooks/useAnalytics';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    if (product.stock <= 0) {
      toast.error('This product is currently out of stock');
      return;
    }
    addToCart(product, 1);
    toast.success(`${product.name} added to cart`);
  };

  const handleStartSubscription = () => {
    if (!user) {
      toast.error('Please login to start a subscription');
      navigate('/login');
      return;
    }
    navigate('/subscription/create');
  };

  return (
    <div className="bg-gradient-to-b from-green-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Subscribe Banner */}
        <div className="mb-8 sm:mb-12 bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 rounded-2xl p-5 sm:p-8 text-white shadow-xl overflow-hidden relative">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
          </div>
          
          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="text-center lg:text-left flex-1">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                <Zap className="w-6 h-6 text-yellow-300" />
                <h3 className="text-xl sm:text-2xl font-bold">
                  Subscribe & Unlock Premium Benefits
                </h3>
              </div>
              <p className="text-base sm:text-lg opacity-95 mb-4">
                Why pay more? Get fresh microgreens delivered on autopilot.
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium">
                  <Truck className="w-4 h-4" /> FREE Delivery
                </span>
                <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium">
                  <Tag className="w-4 h-4" /> Up to 50% OFF
                </span>
                <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium">
                  <Sparkles className="w-4 h-4" /> Priority Harvest
                </span>
              </div>
            </div>
            <Button
              data-testid="subscribe-banner-button"
              onClick={handleStartSubscription}
              size="lg"
              className="bg-white text-green-700 hover:bg-yellow-50 hover:text-green-800 rounded-full px-8 py-6 font-bold text-base shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
            >
              Start Saving Today →
            </Button>
          </div>
        </div>

        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-primary mb-3 sm:mb-4 heading-text">
            Our Premium Microgreens
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground body-text">
            All packs are 80 grams, freshly harvested and delivered to your door
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 sm:py-20">
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8" data-testid="products-grid">
            {products.map((product) => (
              <Card
                key={product.id}
                data-testid={`product-card-${product.id}`}
                className="overflow-hidden border border-border/50 hover:shadow-lg transition-all duration-300 group cursor-pointer"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <div className="aspect-video overflow-hidden relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-2xl font-semibold text-primary mb-1 sm:mb-2 heading-text">{product.name}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 body-text line-clamp-2">{product.benefit}</p>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-primary">₹{product.price}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">per {product.pack_size || '80g'} pack</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs sm:text-sm text-muted-foreground">Ready in</p>
                      <p className="text-base sm:text-lg font-semibold text-secondary">{product.growth_days} days</p>
                    </div>
                  </div>
                  
                  {product.stock > 0 && product.stock < 10 && (
                    <div className="mb-3 px-2 sm:px-3 py-1 sm:py-1.5 bg-amber-50 text-amber-700 text-xs sm:text-sm rounded-full inline-block">
                      Only {product.stock} left in stock
                    </div>
                  )}

                  <Button
                    data-testid={`add-to-cart-${product.id}`}
                    onClick={(e) => handleAddToCart(e, product)}
                    disabled={product.stock <= 0}
                    className="w-full bg-primary hover:bg-primary/90 rounded-full mt-2"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
