import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/context/AuthContext';
import '@/App.css';

import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Products from '@/pages/Products';
import SubscriptionCreate from '@/pages/SubscriptionCreate';
import MySubscriptions from '@/pages/MySubscriptions';
import SubscriptionDetail from '@/pages/SubscriptionDetail';
import Profile from '@/pages/Profile';
import AdminLogin from '@/pages/AdminLogin';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminProducts from '@/pages/AdminProducts';
import AdminSubscriptions from '@/pages/AdminSubscriptions';
import AdminDeliveries from '@/pages/AdminDeliveries';
import AdminInventory from '@/pages/AdminInventory';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/products" element={<Products />} />
            <Route path="/subscription/create" element={<SubscriptionCreate />} />
            <Route path="/subscriptions" element={<MySubscriptions />} />
            <Route path="/subscription/:id" element={<SubscriptionDetail />} />
            <Route path="/profile" element={<Profile />} />
            
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
            <Route path="/admin/deliveries" element={<AdminDeliveries />} />
            <Route path="/admin/inventory" element={<AdminInventory />} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <Toaster position="top-center" />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;