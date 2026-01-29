import { useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Generate or get session ID
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('khurpi_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('khurpi_session_id', sessionId);
  }
  return sessionId;
};

// Get device info
const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;
  
  // Detect device type
  let deviceType = 'desktop';
  if (/Mobi|Android/i.test(userAgent)) {
    deviceType = 'mobile';
  } else if (/Tablet|iPad/i.test(userAgent)) {
    deviceType = 'tablet';
  }
  
  // Detect browser
  let browser = 'unknown';
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';
  else if (userAgent.includes('Opera')) browser = 'Opera';
  
  // Detect OS
  let os = 'unknown';
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'MacOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS') || userAgent.includes('iPhone')) os = 'iOS';
  
  return {
    type: deviceType,
    browser,
    os,
    screen_width: window.screen.width,
    screen_height: window.screen.height
  };
};

// Location cache
let locationCache = null;
let locationPromise = null;

const getLocation = async () => {
  if (locationCache) return locationCache;
  if (locationPromise) return locationPromise;
  
  locationPromise = new Promise((resolve) => {
    // Try to get geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Try to get city from coordinates using reverse geocoding
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await response.json();
            locationCache = {
              latitude,
              longitude,
              city: data.address?.city || data.address?.town || data.address?.village || 'Unknown',
              country: data.address?.country || 'Unknown'
            };
          } catch {
            locationCache = { latitude, longitude, city: 'Unknown', country: 'Unknown' };
          }
          resolve(locationCache);
        },
        () => {
          // Geolocation denied or failed
          locationCache = { latitude: null, longitude: null, city: 'Unknown', country: 'Unknown' };
          resolve(locationCache);
        },
        { timeout: 5000 }
      );
    } else {
      locationCache = { latitude: null, longitude: null, city: 'Unknown', country: 'Unknown' };
      resolve(locationCache);
    }
  });
  
  return locationPromise;
};

export const useAnalytics = () => {
  const { user } = useAuth();
  const sessionId = useRef(getSessionId());
  const deviceInfo = useRef(getDeviceInfo());

  const trackEvent = useCallback(async (eventType, additionalData = {}) => {
    try {
      const location = await getLocation();
      
      const eventData = {
        event_type: eventType,
        page: window.location.pathname,
        user_id: user?.id || null,
        session_id: sessionId.current,
        timestamp: new Date().toISOString(),
        ...location,
        device_type: deviceInfo.current.type,
        browser: deviceInfo.current.browser,
        os: deviceInfo.current.os,
        screen_width: deviceInfo.current.screen_width,
        screen_height: deviceInfo.current.screen_height,
        ...additionalData
      };

      // Send to backend (fire and forget)
      axios.post(`${API}/analytics/track`, eventData).catch(() => {});
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }, [user]);

  // Track page view on mount
  const trackPageView = useCallback((pageName) => {
    trackEvent('page_view', { metadata: { page_name: pageName } });
  }, [trackEvent]);

  // Track product view
  const trackProductView = useCallback((product) => {
    trackEvent('product_view', {
      product_id: product.id,
      product_name: product.name,
      category: product.category,
      value: product.price
    });
  }, [trackEvent]);

  // Track add to cart
  const trackAddToCart = useCallback((product, quantity = 1) => {
    trackEvent('add_to_cart', {
      product_id: product.id,
      product_name: product.name,
      category: product.category,
      value: product.price * quantity,
      metadata: { quantity }
    });
  }, [trackEvent]);

  // Track checkout started
  const trackCheckoutStarted = useCallback((cartTotal) => {
    trackEvent('checkout_started', { value: cartTotal });
  }, [trackEvent]);

  // Track purchase
  const trackPurchase = useCallback((orderId, total, items) => {
    trackEvent('purchase', {
      value: total,
      metadata: { order_id: orderId, items_count: items?.length || 0 }
    });
  }, [trackEvent]);

  // Track subscription created
  const trackSubscription = useCallback((plan, total) => {
    trackEvent('subscription_created', {
      value: total,
      metadata: { plan_name: plan?.name, plan_id: plan?.id }
    });
  }, [trackEvent]);

  // Track button click
  const trackClick = useCallback((buttonName, additionalData = {}) => {
    trackEvent('click', { metadata: { button: buttonName, ...additionalData } });
  }, [trackEvent]);

  // Track search
  const trackSearch = useCallback((query, resultsCount) => {
    trackEvent('search', { metadata: { query, results_count: resultsCount } });
  }, [trackEvent]);

  // Track login
  const trackLogin = useCallback(() => {
    trackEvent('login');
  }, [trackEvent]);

  // Track signup
  const trackSignup = useCallback(() => {
    trackEvent('signup');
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackProductView,
    trackAddToCart,
    trackCheckoutStarted,
    trackPurchase,
    trackSubscription,
    trackClick,
    trackSearch,
    trackLogin,
    trackSignup
  };
};

export default useAnalytics;
