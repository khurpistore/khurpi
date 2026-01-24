import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Clock, Truck, Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Fresh from Farm to Your Table
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-primary mb-4 sm:mb-6 heading-text leading-tight">
                Freshness Delivered to Your Doorstep
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 body-text">
                Subscribe to premium microgreens grown with care. Get fresh, nutrient-rich trays delivered on your schedule.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Button
                  data-testid="subscribe-hero-button"
                  size="lg"
                  onClick={() => navigate('/subscription/create')}
                  className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-full px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Subscribe & Save 15%
                </Button>
                <Button
                  data-testid="explore-products-button"
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/products')}
                  className="rounded-full px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-medium border-primary text-primary hover:bg-primary hover:text-white"
                >
                  Explore Products
                </Button>
              </div>
            </div>
            <div className="relative order-first lg:order-last">
              <img
                src="https://images.unsplash.com/photo-1647613233056-fc9918256a8d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1NzZ8MHwxfHNlYXJjaHwxfHxtaWNyb2dyZWVucyUyMHRyYXklMjBmcmVzaHxlbnwwfHx8fDE3NjkxNzI1MjB8MA&ixlib=rb-4.1.0&q=85"
                alt="Fresh Microgreens"
                className="rounded-2xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-primary mb-8 sm:mb-16 heading-text">
            Why Choose Khurpi?
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            <div className="text-center p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Leaf className="w-6 h-6 sm:w-8 sm:h-8 text-secondary" />
              </div>
              <h4 className="text-base sm:text-xl font-semibold text-primary mb-1 sm:mb-2 heading-text">100% Organic</h4>
              <p className="text-xs sm:text-base text-muted-foreground body-text">Grown without pesticides or chemicals</p>
            </div>
            <div className="text-center p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-secondary" />
              </div>
              <h4 className="text-base sm:text-xl font-semibold text-primary mb-1 sm:mb-2 heading-text">Fresh Daily</h4>
              <p className="text-xs sm:text-base text-muted-foreground body-text">Harvested and delivered within hours</p>
            </div>
            <div className="text-center p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Truck className="w-6 h-6 sm:w-8 sm:h-8 text-secondary" />
              </div>
              <h4 className="text-base sm:text-xl font-semibold text-primary mb-1 sm:mb-2 heading-text">Flexible Delivery</h4>
              <p className="text-xs sm:text-base text-muted-foreground body-text">Choose your schedule and frequency</p>
            </div>
            <div className="text-center p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-secondary" />
              </div>
              <h4 className="text-base sm:text-xl font-semibold text-primary mb-1 sm:mb-2 heading-text">Quality Guaranteed</h4>
              <p className="text-xs sm:text-base text-muted-foreground body-text">Premium quality or your money back</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 bg-gradient-to-r from-green-700 to-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 heading-text">
            Ready to Start Your Healthy Journey?
          </h2>
          <p className="text-base sm:text-lg mb-2 opacity-90">
            Join hundreds of health-conscious customers enjoying fresh microgreens delivered to their door.
          </p>
          <p className="text-xs sm:text-sm mb-6 sm:mb-8 opacity-75">
            Currently delivering in NOIDA area only
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button
              data-testid="cta-subscribe-button"
              size="lg"
              onClick={() => navigate('/subscription/create')}
              className="bg-white text-green-700 hover:bg-gray-100 rounded-full px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-semibold"
            >
              Start Subscription
            </Button>
            <Button
              data-testid="cta-shop-button"
              size="lg"
              variant="outline"
              onClick={() => navigate('/products')}
              className="border-2 border-white text-white hover:bg-white/10 rounded-full px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-semibold"
            >
              Shop Once
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
