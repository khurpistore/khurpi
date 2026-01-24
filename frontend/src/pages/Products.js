import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Leaf, ShoppingCart, Menu, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
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

  const handleStartSubscription = () => {
    if (!user) {
      toast.error('Please login to start a subscription');
      navigate('/login');
      return;
    }
    navigate('/subscription/create');
  };

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Leaf className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold text-primary heading-text">Khurpi</h1>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden sm:flex gap-3">
            {user ? (
              <>
                <Button
                  data-testid="my-subscriptions-nav-button"
                  variant="ghost"
                  onClick={() => navigate('/subscriptions')}
                  className="rounded-full"
                >
                  My Subscriptions
                </Button>
                <Button
                  data-testid="profile-nav-button"
                  variant="ghost"
                  onClick={() => navigate('/profile')}
                  className="rounded-full"
                >
                  Profile
                </Button>
              </>
            ) : (
              <Button
                data-testid="login-nav-button"
                onClick={() => navigate('/login')}
                className="bg-primary hover:bg-primary/90 text-white rounded-full"
              >
                Login
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="sm:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-white border-b border-green-100 px-4 py-3 space-y-2">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => { navigate('/subscriptions'); setMobileMenuOpen(false); }}
                >
                  My Subscriptions
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}
                >
                  Profile
                </Button>
              </>
            ) : (
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-white"
                onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
              >
                Login
              </Button>
            )}
          </div>
        )}
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-primary mb-3 sm:mb-4 heading-text">
            Our Premium Microgreens
          </h2>
          <p className="text-sm sm:text-lg text-muted-foreground body-text">
            All trays are 5×7 inches, freshly harvested and delivered to your door
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 sm:py-20">
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12" data-testid="products-grid">
              {products.map((product) => (
                <Card
                  key={product.id}
                  data-testid={`product-card-${product.id}`}
                  className="overflow-hidden border border-border/50 hover:shadow-lg transition-all duration-300 group cursor-pointer"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-2xl font-semibold text-primary mb-1 sm:mb-2 heading-text">{product.name}</h3>
                    <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 body-text line-clamp-2">{product.benefit}</p>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-xl sm:text-2xl font-bold text-primary">₹{product.price}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">per 5×7 tray</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs sm:text-sm text-muted-foreground">Ready in</p>
                        <p className="text-base sm:text-lg font-semibold text-secondary">{product.growth_days} days</p>
                      </div>
                    </div>
                    {product.stock <= 0 ? (
                      <div className="mt-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-red-50 text-red-700 text-xs sm:text-sm rounded-full inline-block">
                        Out of Stock - Available in {product.growth_days} days
                      </div>
                    ) : product.stock < 10 ? (
                      <div className="mt-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-amber-50 text-amber-700 text-xs sm:text-sm rounded-full inline-block">
                        Only {product.stock} left in stock
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center py-8 sm:py-12 bg-white rounded-2xl border border-border">
              <h3 className="text-xl sm:text-3xl font-bold text-primary mb-3 sm:mb-4 heading-text">
                Ready to Subscribe?
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 body-text px-4">
                Choose your favorites and customize your delivery schedule
              </p>
              <Button
                data-testid="start-subscription-button"
                size="lg"
                onClick={handleStartSubscription}
                className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-medium w-[90%] sm:w-auto"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Start Subscription
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Products;