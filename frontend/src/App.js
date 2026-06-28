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
import AdminUsers from '@/pages/AdminUsers';
import AdminProducts from '@/pages/AdminProducts';
import AdminSubscriptions from '@/pages/AdminSubscriptions';
import AdminDeliveries from '@/pages/AdminDeliveries';
import AdminPayments from '@/pages/AdminPayments';
import AdminInventory from '@/pages/AdminInventory';
import AdminSettings from '@/pages/AdminSettings';
import AdminCoupons from '@/pages/AdminCoupons';
import AdminReferrals from '@/pages/AdminReferrals';
import AdminPages from '@/pages/AdminPages';
import AdminOrders from '@/pages/AdminOrders';
import AdminAnalytics from '@/pages/AdminAnalytics';
import AdminDiscountTiers from '@/pages/AdminDiscountTiers';
import AdminCustomerView from '@/pages/AdminCustomerView';
import AdminCreateOrder from '@/pages/AdminCreateOrder';
import AdminExpenses from '@/pages/AdminExpenses';
import AdminCostCalculator from '@/pages/AdminCostCalculator';
import AdminStoreSettings from '@/pages/AdminStoreSettings';
import AdminCategories from '@/pages/AdminCategories';
import AdminDeliverySlots from '@/pages/AdminDeliverySlots';
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
              <Route path="/admin/dashboard" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/orders" element={<ProtectedRoute requireAdmin><AdminOrders /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute requireAdmin><AdminUsers /></ProtectedRoute>} />
              <Route path="/admin/products" element={<ProtectedRoute requireAdmin><AdminProducts /></ProtectedRoute>} />
              <Route path="/admin/subscriptions" element={<ProtectedRoute requireAdmin><AdminSubscriptions /></ProtectedRoute>} />
              <Route path="/admin/deliveries" element={<ProtectedRoute requireAdmin><AdminDeliveries /></ProtectedRoute>} />
              <Route path="/admin/payments" element={<ProtectedRoute requireAdmin><AdminPayments /></ProtectedRoute>} />
              <Route path="/admin/inventory" element={<ProtectedRoute requireAdmin><AdminInventory /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute requireAdmin><AdminSettings /></ProtectedRoute>} />
              <Route path="/admin/coupons" element={<ProtectedRoute requireAdmin><AdminCoupons /></ProtectedRoute>} />
              <Route path="/admin/discount-tiers" element={<ProtectedRoute requireAdmin><AdminDiscountTiers /></ProtectedRoute>} />
              <Route path="/admin/referrals" element={<ProtectedRoute requireAdmin><AdminReferrals /></ProtectedRoute>} />
              <Route path="/admin/pages" element={<ProtectedRoute requireAdmin><AdminPages /></ProtectedRoute>} />
              <Route path="/admin/analytics" element={<ProtectedRoute requireAdmin><AdminAnalytics /></ProtectedRoute>} />
              <Route path="/admin/customer-view" element={<ProtectedRoute requireAdmin><AdminCustomerView /></ProtectedRoute>} />
              <Route path="/admin/create-order" element={<ProtectedRoute requireAdmin><AdminCreateOrder /></ProtectedRoute>} />
              <Route path="/admin/expenses" element={<ProtectedRoute requireAdmin><AdminExpenses /></ProtectedRoute>} />
              <Route path="/admin/cost-calculator" element={<ProtectedRoute requireAdmin><AdminCostCalculator /></ProtectedRoute>} />
              <Route path="/admin/store-settings" element={<ProtectedRoute requireAdmin><AdminStoreSettings /></ProtectedRoute>} />
              <Route path="/admin/categories" element={<ProtectedRoute requireAdmin><AdminCategories /></ProtectedRoute>} />
              <Route path="/admin/delivery-slots" element={<ProtectedRoute requireAdmin><AdminDeliverySlots /></ProtectedRoute>} />
              
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
    </AuthProvider>
  );
}

export default App;
