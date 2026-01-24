import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Clock, Truck, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary heading-text">Khurpi</h1>
          </div>
          <div className="flex gap-3">
            <Button
              data-testid="login-button"
              variant="ghost"
              onClick={() => navigate('/login')}
              className="rounded-full"
            >
              Login
            </Button>
            <Button
              data-testid="get-started-button"
              onClick={() => navigate('/signup')}
              className="bg-primary hover:bg-primary/90 text-white rounded-full px-6"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary mb-6 heading-text">
                Freshness Delivered to Your Doorstep
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 body-text">
                Subscribe to premium microgreens grown with care. Get fresh, nutrient-rich trays delivered on your schedule.
              </p>
              <Button
                data-testid="explore-products-button"
                size="lg"
                onClick={() => navigate('/products')}
                className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-6 text-lg font-medium hover:-translate-y-0.5 transition-transform"
              >
                Explore Products
              </Button>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1647613233056-fc9918256a8d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1NzZ8MHwxfHNlYXJjaHwxfHxtaWNyb2dyZWVucyUyMHRyYXklMjBmcmVzaHxlbnwwfHx8fDE3NjkxNzI1MjB8MA&ixlib=rb-4.1.0&q=85"
                alt="Fresh Microgreens"
                className="rounded-2xl shadow-lg w-full"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl sm:text-4xl font-bold text-center text-primary mb-16 heading-text">
            Why Choose Khurpi?
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-8 h-8 text-secondary" />
              </div>
              <h4 className="text-xl font-semibold text-primary mb-2 heading-text">100% Organic</h4>
              <p className="text-muted-foreground body-text">Grown without pesticides or chemicals</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-secondary" />
              </div>
              <h4 className="text-xl font-semibold text-primary mb-2 heading-text">Fresh Daily</h4>
              <p className="text-muted-foreground body-text">Harvested and delivered within hours</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-secondary" />
              </div>
              <h4 className="text-xl font-semibold text-primary mb-2 heading-text">Flexible Delivery</h4>
              <p className="text-muted-foreground body-text">Choose your schedule and frequency</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-secondary" />
              </div>
              <h4 className="text-xl font-semibold text-primary mb-2 heading-text">Quality Guaranteed</h4>
              <p className="text-muted-foreground body-text">Premium quality or your money back</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl sm:text-4xl font-bold mb-6 heading-text">
            Ready to Start Your Healthy Journey?
          </h3>
          <p className="text-lg mb-2 opacity-90">
            Join hundreds of health-conscious customers enjoying fresh microgreens delivered to their door.
          </p>
          <p className="text-sm mb-8 opacity-75">
            🚚 Currently delivering in NOIDA area only
          </p>
          <Button
            data-testid="cta-signup-button"
            size="lg"
            onClick={() => navigate('/signup')}
            className="bg-secondary hover:bg-secondary/90 text-primary rounded-full px-8 py-6 text-lg font-medium"
          >
            Start Your Subscription
          </Button>
        </div>
      </section>

      <footer className="bg-white border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>&copy; 2024 Khurpi. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;