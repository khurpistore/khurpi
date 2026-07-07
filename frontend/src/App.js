import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import { registerServiceWorker } from '@/utils/serviceWorker';
import '@/App.css';

import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Products from '@/pages/Products';
import ProductDetail from '@/pages/ProductDetail';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import Orders from '@/pages/Orders';
import OrderDetail from '@/pages/OrderDetail';
import Addresses from '@/pages/Addresses';
import SubscriptionCreate from '@/pages/SubscriptionCreate';
import MySubscriptions from '@/pages/MySubscriptions';
import SubscriptionDetail from '@/pages/SubscriptionDetail';
import Profile from '@/pages/Profile';
import ReferAndEarn from '@/pages/ReferAndEarn';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsConditions from '@/pages/TermsConditions';
import ShippingPolicy from '@/pages/ShippingPolicy';
import CancellationRefund from '@/pages/CancellationRefund';
import AdminLogin from '@/pages/AdminLogin';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminSubscriptions from '@/pages/AdminSubscriptions';
import AdminDeliveries from '@/pages/AdminDeliveries';
import AdminInventory from '@/pages/AdminInventory';
import AdminSettings from '@/pages/AdminSettings';
import AdminCoupons from '@/pages/AdminCoupons';
import AdminReferrals from '@/pages/AdminReferrals';
import AdminPages from '@/pages/AdminPages';
import AdminAnalytics from '@/pages/AdminAnalytics';
import AdminDiscountTiers from '@/pages/AdminDiscountTiers';
import AdminStoreSettings from '@/pages/AdminStoreSettings';
import AdminDeliverySlots from '@/pages/AdminDeliverySlots';
import AdminBanners from '@/pages/AdminBanners';
import AdminAppConfig from '@/pages/AdminAppConfig';
import AdminSpinWheel from '@/pages/AdminSpinWheel';
import AdminProjects from '@/pages/AdminProjects';
import AdminOrdersHub from '@/pages/AdminOrdersHub';
import AdminUsersHub from '@/pages/AdminUsersHub';
import AdminProductsHub from '@/pages/AdminProductsHub';
import AdminFinanceHub from '@/pages/AdminFinanceHub';
import AdminLayout from '@/components/AdminLayout';
import Contact from '@/pages/Contact';
import { ProjectProvider } from '@/context/ProjectContext';
import DeliveryBoyLogin from '@/pages/DeliveryBoyLogin';
import DeliveryDashboard from '@/pages/DeliveryDashboard';

// Layout wrapper that conditionally shows header/footer
const AppLayout = ({ children }) => {
  const location = useLocation();
  const isDeliveryRoute = location.pathname.startsWith('/delivery');
  
  if (isDeliveryRoute) {
    return <>{children}</>;
  }
  
  return (
    <div className="App min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

function App() {
  // Register service worker for PWA
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <AuthProvider>
      <ProjectProvider>
      <CartProvider>
        <BrowserRouter>
          <ScrollToTop />
          <AppLayout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-conditions" element={<TermsConditions />} />
              <Route path="/terms-of-service" element={<TermsConditions />} />
              <Route path="/shipping-policy" element={<ShippingPolicy />} />
              <Route path="/cancellation-refund" element={<CancellationRefund />} />
              <Route path="/contact" element={<Contact />} />
              
              {/* Protected Customer Routes */}
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path="/order/:orderId" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
              <Route path="/addresses" element={<ProtectedRoute><Addresses /></ProtectedRoute>} />
              <Route path="/subscription/create" element={<ProtectedRoute><SubscriptionCreate /></ProtectedRoute>} />
              <Route path="/subscriptions" element={<ProtectedRoute><MySubscriptions /></ProtectedRoute>} />
              <Route path="/subscription/:id" element={<ProtectedRoute><SubscriptionDetail /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/refer" element={<ProtectedRoute><ReferAndEarn /></ProtectedRoute>} />
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/projects" element={<ProtectedRoute requireAdmin><AdminProjects /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="orders" element={<AdminOrdersHub />} />
                <Route path="users" element={<AdminUsersHub />} />
                <Route path="products" element={<AdminProductsHub />} />
                <Route path="finance" element={<AdminFinanceHub />} />
                <Route path="subscriptions" element={<AdminSubscriptions />} />
                <Route path="deliveries" element={<AdminDeliveries />} />
                <Route path="inventory" element={<AdminInventory />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="coupons" element={<AdminCoupons />} />
                <Route path="discount-tiers" element={<AdminDiscountTiers />} />
                <Route path="referrals" element={<AdminReferrals />} />
                <Route path="pages" element={<AdminPages />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="store-settings" element={<AdminStoreSettings />} />
                <Route path="delivery-slots" element={<AdminDeliverySlots />} />
                <Route path="banners" element={<AdminBanners />} />
                <Route path="app-config" element={<AdminAppConfig />} />
                <Route path="spin-wheel" element={<AdminSpinWheel />} />
              </Route>
              
              {/* Delivery Boy Routes - No header/footer */}
              <Route path="/delivery/login" element={<DeliveryBoyLogin />} />
              <Route path="/delivery" element={<DeliveryDashboard />} />
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </AppLayout>
          <PWAInstallPrompt />
          <Toaster position="top-center" />
        </BrowserRouter>
      </CartProvider>
      </ProjectProvider>
    </AuthProvider>
  );
}

export default App;
