import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '@/App.css';

import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Products from '@/pages/Products';
import ProductDetail from '@/pages/ProductDetail';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import SubscriptionCreate from '@/pages/SubscriptionCreate';
import MySubscriptions from '@/pages/MySubscriptions';
import SubscriptionDetail from '@/pages/SubscriptionDetail';
import Profile from '@/pages/Profile';
import AdminLogin from '@/pages/AdminLogin';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminUsers from '@/pages/AdminUsers';
import AdminProducts from '@/pages/AdminProducts';
import AdminSubscriptions from '@/pages/AdminSubscriptions';
import AdminDeliveries from '@/pages/AdminDeliveries';
import AdminPayments from '@/pages/AdminPayments';
import AdminInventory from '@/pages/AdminInventory';
import AdminSettings from '@/pages/AdminSettings';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="App min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/subscription/create" element={<SubscriptionCreate />} />
                <Route path="/subscriptions" element={<MySubscriptions />} />
                <Route path="/subscription/:id" element={<SubscriptionDetail />} />
                <Route path="/profile" element={<Profile />} />
                
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
                <Route path="/admin/deliveries" element={<AdminDeliveries />} />
                <Route path="/admin/payments" element={<AdminPayments />} />
                <Route path="/admin/inventory" element={<AdminInventory />} />
                
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
            <Footer />
            <Toaster position="top-center" />
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
