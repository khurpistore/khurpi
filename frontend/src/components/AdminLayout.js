import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, Package, Users, TrendingUp, CreditCard, Menu, X, LogOut, Leaf, Settings, Tag, Gift } from 'lucide-react';
import { toast } from 'sonner';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { id: 'users', label: 'Users', icon: Users, path: '/admin/users' },
  { id: 'products', label: 'Products', icon: Package, path: '/admin/products' },
  { id: 'subscriptions', label: 'Subscriptions', icon: Users, path: '/admin/subscriptions' },
  { id: 'deliveries', label: 'Deliveries', icon: TrendingUp, path: '/admin/deliveries' },
  { id: 'payments', label: 'Payments', icon: CreditCard, path: '/admin/payments' },
  { id: 'inventory', label: 'Inventory', icon: Package, path: '/admin/inventory' },
  { id: 'coupons', label: 'Discount Coupons', icon: Tag, path: '/admin/coupons' },
  { id: 'referrals', label: 'Referral Program', icon: Gift, path: '/admin/referrals' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' }
];

const AdminLayout = ({ children, active, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  const handleNavClick = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 bg-primary text-white min-h-screen p-6 flex-shrink-0">
        <div className="flex items-center gap-2 mb-8">
          <Leaf className="w-6 h-6" />
          <h2 className="text-xl font-bold heading-text">Khurpi Admin</h2>
        </div>
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                data-testid={`admin-nav-${item.id}`}
                onClick={() => handleNavClick(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm ${
                  active === item.id ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="absolute bottom-6 left-6 right-6">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full text-white hover:bg-white/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-primary text-white px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Leaf className="w-5 h-5" />
          <span className="font-bold">Khurpi Admin</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white hover:bg-white/10"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed top-14 left-0 bottom-0 w-64 bg-primary text-white z-50 transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm ${
                  active === item.id ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-4 border-t border-white/20 mt-4">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full text-white hover:bg-white/10 justify-start"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0 pt-14 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary heading-text">{title}</h1>
            <Button
              data-testid="admin-logout-button"
              onClick={handleLogout}
              variant="outline"
              className="rounded-full hidden lg:flex"
            >
              Logout
            </Button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
