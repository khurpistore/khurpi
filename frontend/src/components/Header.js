import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { 
  ShoppingCart, 
  Menu, 
  X, 
  Bell, 
  User, 
  Package, 
  MapPin, 
  ShoppingBag,
  LogOut,
  ChevronDown,
  CalendarCheck,
  Gift,
  Truck,
  Percent
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const IS_DEV = process.env.REACT_APP_ENV === 'development' || process.env.NODE_ENV === 'development';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [maxDiscount, setMaxDiscount] = useState(0);
  const [notifications] = useState([
    { id: 1, message: 'Your subscription delivery is scheduled for tomorrow', unread: true },
    { id: 2, message: 'New microgreens added to our collection!', unread: true },
  ]);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { getCartCount } = useCart();

  const cartCount = getCartCount();
  const unreadCount = notifications.filter(n => n.unread).length;

  // Fetch max discount on mount
  useEffect(() => {
    const fetchDiscountTiers = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/discount-tiers`);
        if (res.data && res.data.length > 0) {
          const max = Math.max(...res.data.map(t => t.discount_percent));
          setMaxDiscount(max);
        }
      } catch (error) {
        console.log('No discount tiers');
      }
    };
    fetchDiscountTiers();
  }, []);

  // Fetch welcome coupon discount
  const [welcomeCouponDiscount, setWelcomeCouponDiscount] = useState(20);
  useEffect(() => {
    const fetchWelcomeCoupon = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/admin/coupons`);
        const welcomeCoupon = res.data?.find(c => c.code === 'KHURPIWELCOME20' && c.is_active);
        if (welcomeCoupon) {
          setWelcomeCouponDiscount(welcomeCoupon.discount_value);
        }
      } catch (error) {
        console.log('Could not fetch welcome coupon');
      }
    };
    fetchWelcomeCoupon();
  }, []);

  // Don't show header on admin pages
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const menuItems = [
    { label: 'My Orders', icon: ShoppingBag, path: '/orders' },
    { label: 'My Subscriptions', icon: CalendarCheck, path: '/subscriptions' },
    { label: 'Refer & Earn', icon: Gift, path: '/refer' },
    { label: 'Addresses', icon: MapPin, path: '/addresses' },
    { label: 'Profile', icon: User, path: '/profile' },
  ];

  return (
    <>
      {/* Promo Banner */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-4 text-center text-sm">
        <div className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap">
          <span className="flex items-center gap-1.5">
            <Truck className="w-4 h-4" />
            <span className="font-medium">FREE Delivery</span>
          </span>
          <span className="text-white/40">|</span>
          <span className="flex items-center gap-2">
            <span>First Order?</span>
            <span className="font-bold">{welcomeCouponDiscount}% OFF</span>
            <span className="bg-white text-green-700 px-2.5 py-0.5 rounded font-bold text-xs tracking-wider">KHURPIWELCOME20</span>
          </span>
          {maxDiscount > 0 && (
            <>
              <span className="hidden sm:inline text-white/40">|</span>
              <span className="hidden sm:flex items-center gap-1.5">
                Save up to <span className="font-bold">{maxDiscount}%</span> on large orders
              </span>
            </>
          )}
        </div>
      </div>
      
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
              variant="ghost"
              onClick={() => navigate('/products')}
              className="rounded-full"
            >
              Products
            </Button>

            {user ? (
              <>
                {/* Notification Bell */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      data-testid="notification-button"
                      variant="ghost"
                      size="icon"
                      className="rounded-full relative"
                    >
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[18px] h-[18px] flex items-center justify-center rounded-full p-0">
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <div className="px-3 py-2 font-semibold border-b">Notifications</div>
                    {notifications.length === 0 ? (
                      <div className="px-3 py-4 text-center text-muted-foreground text-sm">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <DropdownMenuItem key={notif.id} className="px-3 py-3 cursor-pointer">
                          <div className="flex items-start gap-2">
                            {notif.unread && (
                              <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                            )}
                            <span className={`text-sm ${notif.unread ? '' : 'text-muted-foreground'}`}>
                              {notif.message}
                            </span>
                          </div>
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Menu Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      data-testid="user-menu-button"
                      variant="ghost"
                      className="rounded-full flex items-center gap-1"
                    >
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2 border-b">
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.phone}</p>
                    </div>
                    {menuItems.map((item) => (
                      <DropdownMenuItem 
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className="cursor-pointer"
                      >
                        <item.icon className="w-4 h-4 mr-2" />
                        {item.label}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button
                variant="ghost"
                onClick={() => navigate('/login')}
                className="rounded-full"
              >
                Login / Sign up
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

          {/* Mobile Navigation Icons */}
          <div className="flex md:hidden items-center gap-1">
            {user && (
              /* Notification Bell Mobile */
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    data-testid="notification-button-mobile"
                    variant="ghost"
                    size="sm"
                    className="rounded-full relative"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] min-w-[14px] h-[14px] flex items-center justify-center rounded-full p-0">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  <div className="px-3 py-2 font-semibold border-b text-sm">Notifications</div>
                  {notifications.length === 0 ? (
                    <div className="px-3 py-4 text-center text-muted-foreground text-sm">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <DropdownMenuItem key={notif.id} className="px-3 py-2 cursor-pointer">
                        <div className="flex items-start gap-2">
                          {notif.unread && (
                            <div className="w-2 h-2 bg-primary rounded-full mt-1 flex-shrink-0" />
                          )}
                          <span className={`text-xs ${notif.unread ? '' : 'text-muted-foreground'}`}>
                            {notif.message}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Cart Button Mobile */}
            <Button
              data-testid="cart-button-mobile"
              variant="ghost"
              size="sm"
              onClick={() => navigate('/cart')}
              className="rounded-full relative"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] min-w-[14px] h-[14px] flex items-center justify-center rounded-full p-0">
                  {cartCount}
                </Badge>
              )}
            </Button>

            {/* Hamburger Menu */}
            <Button
              data-testid="mobile-menu-button"
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
          <div className="md:hidden bg-white border-t border-green-100 px-4 py-3 space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => { navigate('/products'); setMobileMenuOpen(false); }}
            >
              <Package className="w-4 h-4 mr-3" />
              Products
            </Button>

            {user ? (
              <>
                <div className="py-2 border-t border-gray-100 mt-2">
                  <div className="px-3 py-2">
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.phone}</p>
                  </div>
                </div>
                
                {menuItems.map((item) => (
                  <Button
                    key={item.path}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => { navigate(item.path); setMobileMenuOpen(false); }}
                  >
                    <item.icon className="w-4 h-4 mr-3" />
                    {item.label}
                  </Button>
                ))}
                
                <div className="border-t border-gray-100 pt-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
              >
                <User className="w-4 h-4 mr-3" />
                Login / Sign up
              </Button>
            )}
          </div>
        )}
      </div>
    </nav>
    </>
  );
};

export default Header;
