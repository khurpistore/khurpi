import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Menu, X, Sparkles } from 'lucide-react';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { getCartCount, setIsCartOpen } = useCart();

  const cartCount = getCartCount();

  // Don't show header on admin pages
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-green-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 sm:h-20 flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <img 
              src="/khurpi-logo.png" 
              alt="Khurpi" 
              className="h-10 sm:h-14 w-auto"
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2 lg:gap-4">
            <Button
              data-testid="subscribe-nav-button"
              onClick={() => navigate('/subscription/create')}
              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-full px-4 lg:px-6 font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Sparkles className="w-4 h-4 mr-1 lg:mr-2" />
              Subscribe & Save
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/products')}
              className="rounded-full"
            >
              Products
            </Button>
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
                variant="ghost"
                onClick={() => navigate('/login')}
                className="rounded-full"
              >
                Login
              </Button>
            )}
            {/* Cart Button */}
            <Button
              data-testid="cart-button"
              variant="outline"
              onClick={() => navigate('/cart')}
              className="rounded-full relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {/* Cart Button Mobile */}
            <Button
              data-testid="cart-button-mobile"
              variant="outline"
              size="sm"
              onClick={() => navigate('/cart')}
              className="rounded-full relative"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[16px] h-4 flex items-center justify-center rounded-full text-[10px]">
                  {cartCount}
                </Badge>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-green-100 px-4 py-3 space-y-2">
            <Button
              onClick={() => { navigate('/subscription/create'); setMobileMenuOpen(false); }}
              className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-full font-semibold"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Subscribe & Save
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => { navigate('/products'); setMobileMenuOpen(false); }}
            >
              Products
            </Button>
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
                variant="ghost"
                className="w-full justify-start"
                onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
              >
                Login
              </Button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;
