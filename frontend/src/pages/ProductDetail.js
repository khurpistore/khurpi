import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Leaf, ArrowLeft, Clock, Sprout, Heart, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProductDetail = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Leaf className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary heading-text">Khurpi</h1>
          </div>
          <div className="flex gap-3">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/subscriptions')}
                  className="rounded-full"
                >
                  My Subscriptions
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/profile')}
                  className="rounded-full"
                >
                  Profile
                </Button>
              </>
            ) : (
              <Button
                onClick={() => navigate('/login')}
                className="bg-primary hover:bg-primary/90 text-white rounded-full"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button
          data-testid="back-to-products-button"
          variant="ghost"
          onClick={() => navigate('/products')}
          className="mb-6 rounded-full"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Button>

        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden shadow-lg">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h1 className="text-5xl font-bold text-primary mb-4 heading-text">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-4xl font-bold text-primary">₹{product.price}</div>
                <div className="text-muted-foreground">per 5×7 inch tray</div>
              </div>
              <div className="flex items-center gap-4 text-muted-foreground">
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

            <Card className="border-secondary/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <Heart className="w-6 h-6 text-secondary mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-primary mb-2 heading-text">
                      Health Benefits
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">{product.benefit}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {product.nutrients && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-6 h-6 text-primary mt-1" />
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-primary mb-3 heading-text">
                        Nutritional Profile
                      </h3>
                      <div className="space-y-2">
                        {product.nutrients.split('|').map((nutrient, index) => {
                          const [category, values] = nutrient.split(':');
                          return (
                            <div key={index} className="flex gap-2">
                              <span className="font-semibold text-primary min-w-[100px]">
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

            <div className="space-y-4">
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
                className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-6 text-lg font-medium"
              >
                Start Subscription
              </Button>
              <Button
                data-testid="view-all-products-button"
                size="lg"
                variant="outline"
                onClick={() => navigate('/products')}
                className="w-full rounded-full py-6 text-lg"
              >
                View All Products
              </Button>
            </div>

            <div className="bg-secondary/10 rounded-xl p-6">
              <h4 className="font-semibold text-primary mb-3">Why Choose Khurpi Microgreens?</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-secondary mt-0.5">\u2713</span>
                  <span>Harvested within 24 hours of delivery</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary mt-0.5">\u2713</span>
                  <span>Grown without pesticides or chemicals</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary mt-0.5">\u2713</span>
                  <span>Packed with nutrients - up to 40x more than mature plants</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary mt-0.5">\u2713</span>
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
