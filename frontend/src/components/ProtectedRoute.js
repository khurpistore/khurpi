import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);
  const [localUser, setLocalUser] = useState(null);

  // Immediately check localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const sessionExpiry = localStorage.getItem('sessionExpiry');
    
    if (storedUser && sessionExpiry && Date.now() < parseInt(sessionExpiry, 10)) {
      try {
        setLocalUser(JSON.parse(storedUser));
      } catch (e) {
        setLocalUser(null);
      }
    }
  }, []);

  // Add a small delay to ensure auth state is fully hydrated
  useEffect(() => {
    if (!loading) {
      // Small timeout to prevent flash redirects on page refresh
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Show loading spinner while auth state is being hydrated
  if (loading || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Use either context user or localStorage user
  const effectiveUser = user || localUser;
  
  // Double-check localStorage for user data (safeguard against race conditions)
  const storedUser = localStorage.getItem('user');
  const sessionExpiry = localStorage.getItem('sessionExpiry');
  const hasValidSession = storedUser && sessionExpiry && Date.now() < parseInt(sessionExpiry, 10);

  // Not authenticated - redirect to appropriate login page
  if (!effectiveUser && !hasValidSession) {
    // If trying to access admin route, redirect to admin login
    if (requireAdmin || location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If we have a valid session but user is null, the context might still be loading
  // In this case, show loading rather than redirecting
  if (!effectiveUser && hasValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Admin route but user is not admin
  if (requireAdmin && effectiveUser.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
