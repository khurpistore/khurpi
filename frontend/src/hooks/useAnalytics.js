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

// Get or create visitor ID (persists across sessions)
const getVisitorId = () => {
  let visitorId = localStorage.getItem('khurpi_visitor_id');
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('khurpi_visitor_id', visitorId);
    localStorage.setItem('khurpi_first_visit', new Date().toISOString());
  }
  return visitorId;
};

// Check if new visitor
const isNewVisitor = () => {
  return !localStorage.getItem('khurpi_returning');
};

// Mark as returning visitor
const markReturningVisitor = () => {
  localStorage.setItem('khurpi_returning', 'true');
};

// Get visit count
const getVisitCount = () => {
  const count = parseInt(localStorage.getItem('khurpi_visit_count') || '0', 10) + 1;
  localStorage.setItem('khurpi_visit_count', count.toString());
  return count;
};

// Get device info with more details
const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;
  
  // Detect device type
  let deviceType = 'desktop';
  if (/Mobi|Android/i.test(userAgent)) {
    deviceType = 'mobile';
  } else if (/Tablet|iPad/i.test(userAgent)) {
    deviceType = 'tablet';
  }
  
  // Detect browser with version
  let browser = 'unknown';
  let browserVersion = '';
  if (userAgent.includes('Chrome')) {
    browser = 'Chrome';
    browserVersion = userAgent.match(/Chrome\/(\d+)/)?.[1] || '';
  } else if (userAgent.includes('Firefox')) {
    browser = 'Firefox';
    browserVersion = userAgent.match(/Firefox\/(\d+)/)?.[1] || '';
  } else if (userAgent.includes('Safari')) {
    browser = 'Safari';
    browserVersion = userAgent.match(/Version\/(\d+)/)?.[1] || '';
  } else if (userAgent.includes('Edge')) {
    browser = 'Edge';
    browserVersion = userAgent.match(/Edge\/(\d+)/)?.[1] || '';
  }
  
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
    browser_version: browserVersion,
    os,
    screen_width: window.screen.width,
    screen_height: window.screen.height,
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    pixel_ratio: window.devicePixelRatio || 1,
    touch_support: 'ontouchstart' in window,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    online: navigator.onLine
  };
};

// Get referrer info
const getReferrerInfo = () => {
  const referrer = document.referrer;
  const urlParams = new URLSearchParams(window.location.search);
  
  return {
    referrer: referrer || 'direct',
    referrer_domain: referrer ? new URL(referrer).hostname : 'direct',
    utm_source: urlParams.get('utm_source'),
    utm_medium: urlParams.get('utm_medium'),
    utm_campaign: urlParams.get('utm_campaign'),
    utm_term: urlParams.get('utm_term'),
    utm_content: urlParams.get('utm_content')
  };
};

// Get performance metrics
const getPerformanceMetrics = () => {
  if (window.performance && window.performance.timing) {
    const timing = window.performance.timing;
    return {
      page_load_time: timing.loadEventEnd - timing.navigationStart,
      dom_ready_time: timing.domContentLoadedEventEnd - timing.navigationStart,
      dns_time: timing.domainLookupEnd - timing.domainLookupStart,
      connect_time: timing.connectEnd - timing.connectStart,
      response_time: timing.responseEnd - timing.requestStart
    };
  }
  return null;
};

// Location cache
let locationCache = null;
let locationPromise = null;

const getLocation = async () => {
  if (locationCache) return locationCache;
  if (locationPromise) return locationPromise;
  
  locationPromise = new Promise((resolve) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await response.json();
            locationCache = {
              latitude,
              longitude,
              accuracy,
              city: data.address?.city || data.address?.town || data.address?.village || 'Unknown',
              state: data.address?.state || 'Unknown',
              country: data.address?.country || 'Unknown',
              pincode: data.address?.postcode || 'Unknown'
            };
          } catch {
            locationCache = { latitude, longitude, accuracy, city: 'Unknown', country: 'Unknown' };
          }
          resolve(locationCache);
        },
        () => {
          locationCache = { latitude: null, longitude: null, city: 'Unknown', country: 'Unknown' };
          resolve(locationCache);
        },
        { timeout: 5000, enableHighAccuracy: false }
      );
    } else {
      locationCache = { latitude: null, longitude: null, city: 'Unknown', country: 'Unknown' };
      resolve(locationCache);
    }
  });
  
  return locationPromise;
};

// User journey tracking
const userJourney = {
  path: JSON.parse(sessionStorage.getItem('khurpi_journey') || '[]'),
  
  addStep(page, action = 'view') {
    this.path.push({
      page,
      action,
      timestamp: new Date().toISOString()
    });
    // Keep last 50 steps
    if (this.path.length > 50) this.path.shift();
    sessionStorage.setItem('khurpi_journey', JSON.stringify(this.path));
  },
  
  getPath() {
    return this.path;
  },
  
  getLastPage() {
    return this.path.length > 1 ? this.path[this.path.length - 2]?.page : null;
  }
};

export const useAnalytics = () => {
  const { user } = useAuth();
  const sessionId = useRef(getSessionId());
  const visitorId = useRef(getVisitorId());
  const deviceInfo = useRef(getDeviceInfo());
  const referrerInfo = useRef(getReferrerInfo());
  const pageStartTime = useRef(Date.now());
  const maxScrollDepth = useRef(0);
  const isFirstVisit = useRef(isNewVisitor());

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
      if (scrollPercent > maxScrollDepth.current) {
        maxScrollDepth.current = scrollPercent;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track time on page and scroll depth on unmount
  useEffect(() => {
    return () => {
      const timeOnPage = Math.round((Date.now() - pageStartTime.current) / 1000);
      if (timeOnPage > 2) { // Only track if more than 2 seconds
        trackEvent('page_exit', {
          metadata: {
            time_on_page_seconds: timeOnPage,
            max_scroll_depth: maxScrollDepth.current
          }
        });
      }
    };
  }, []);

  // Mark as returning visitor after first page view
  useEffect(() => {
    if (isFirstVisit.current) {
      setTimeout(() => markReturningVisitor(), 5000);
    }
  }, []);

  const trackEvent = useCallback(async (eventType, additionalData = {}) => {
    try {
      const location = await getLocation();
      const performance = getPerformanceMetrics();
      
      const eventData = {
        event_type: eventType,
        page: window.location.pathname,
        page_url: window.location.href,
        page_title: document.title,
        user_id: user?.id || null,
        session_id: sessionId.current,
        visitor_id: visitorId.current,
        timestamp: new Date().toISOString(),
        // Location
        ...location,
        // Device
        device_type: deviceInfo.current.type,
        browser: deviceInfo.current.browser,
        browser_version: deviceInfo.current.browser_version,
        os: deviceInfo.current.os,
        screen_width: deviceInfo.current.screen_width,
        screen_height: deviceInfo.current.screen_height,
        // Extended data
        metadata: {
          ...additionalData.metadata,
          viewport_width: deviceInfo.current.viewport_width,
          viewport_height: deviceInfo.current.viewport_height,
          pixel_ratio: deviceInfo.current.pixel_ratio,
          touch_support: deviceInfo.current.touch_support,
          language: deviceInfo.current.language,
          timezone: deviceInfo.current.timezone,
          online: deviceInfo.current.online,
          // Referrer
          ...referrerInfo.current,
          // Visitor info
          is_new_visitor: isFirstVisit.current,
          visit_count: getVisitCount(),
          // Journey
          previous_page: userJourney.getLastPage(),
          journey_length: userJourney.getPath().length,
          // Performance
          ...performance
        },
        ...additionalData
      };

      // Add to journey
      userJourney.addStep(window.location.pathname, eventType);

      // Send to backend (fire and forget)
      axios.post(`${API}/analytics/track`, eventData).catch(() => {});
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }, [user]);

  // Track page view with enhanced data
  const trackPageView = useCallback((pageName) => {
    pageStartTime.current = Date.now();
    maxScrollDepth.current = 0;
    trackEvent('page_view', { 
      metadata: { 
        page_name: pageName,
        entry_point: userJourney.getPath().length === 0
      } 
    });
  }, [trackEvent]);

  // Track product view
  const trackProductView = useCallback((product) => {
    trackEvent('product_view', {
      product_id: product.id,
      product_name: product.name,
      category: product.category,
      value: product.price,
      metadata: {
        stock: product.stock,
        in_stock: product.stock > 0
      }
    });
  }, [trackEvent]);

  // Track add to cart with more context
  const trackAddToCart = useCallback((product, quantity = 1) => {
    trackEvent('add_to_cart', {
      product_id: product.id,
      product_name: product.name,
      category: product.category,
      value: product.price * quantity,
      metadata: { 
        quantity,
        unit_price: product.price,
        source_page: window.location.pathname
      }
    });
  }, [trackEvent]);

  // Track remove from cart
  const trackRemoveFromCart = useCallback((product, quantity = 1) => {
    trackEvent('remove_from_cart', {
      product_id: product.id,
      product_name: product.name,
      value: product.price * quantity,
      metadata: { quantity }
    });
  }, [trackEvent]);

  // Track cart view
  const trackCartView = useCallback((cartItems, cartTotal) => {
    trackEvent('cart_view', {
      value: cartTotal,
      metadata: {
        items_count: cartItems.length,
        items: cartItems.map(item => ({
          id: item.product?.id,
          name: item.product?.name,
          quantity: item.quantity,
          price: item.product?.price
        }))
      }
    });
  }, [trackEvent]);

  // Track checkout started with full cart info
  const trackCheckoutStarted = useCallback((cartTotal, cartItems = []) => {
    trackEvent('checkout_started', { 
      value: cartTotal,
      metadata: {
        items_count: cartItems.length,
        has_subscription: false
      }
    });
  }, [trackEvent]);

  // Track checkout step
  const trackCheckoutStep = useCallback((step, stepName) => {
    trackEvent('checkout_step', {
      metadata: {
        step_number: step,
        step_name: stepName
      }
    });
  }, [trackEvent]);

  // Track checkout abandonment
  const trackCheckoutAbandonment = useCallback((step, cartTotal) => {
    trackEvent('checkout_abandoned', {
      value: cartTotal,
      metadata: {
        abandoned_at_step: step
      }
    });
  }, [trackEvent]);

  // Track purchase with full details
  const trackPurchase = useCallback((orderId, total, items, paymentMethod) => {
    trackEvent('purchase', {
      value: total,
      metadata: { 
        order_id: orderId, 
        items_count: items?.length || 0,
        payment_method: paymentMethod,
        items: items?.map(item => ({
          id: item.product?.id || item.product_id,
          name: item.product?.name,
          quantity: item.quantity,
          price: item.price
        }))
      }
    });
  }, [trackEvent]);

  // Track subscription created
  const trackSubscription = useCallback((plan, total, products) => {
    trackEvent('subscription_created', {
      value: total,
      metadata: { 
        plan_name: plan?.name, 
        plan_id: plan?.id,
        frequency: plan?.frequency,
        discount_percent: plan?.discount,
        products_count: products?.length || 0
      }
    });
  }, [trackEvent]);

  // Track subscription step
  const trackSubscriptionStep = useCallback((step, stepName, data = {}) => {
    trackEvent('subscription_step', {
      metadata: {
        step_number: step,
        step_name: stepName,
        ...data
      }
    });
  }, [trackEvent]);

  // Track button/element click with position
  const trackClick = useCallback((elementName, additionalData = {}) => {
    trackEvent('click', { 
      metadata: { 
        element: elementName,
        ...additionalData
      } 
    });
  }, [trackEvent]);

  // Track form interaction
  const trackFormInteraction = useCallback((formName, action, fieldName = null) => {
    trackEvent('form_interaction', {
      metadata: {
        form_name: formName,
        action, // 'start', 'field_focus', 'field_blur', 'submit', 'error', 'abandon'
        field_name: fieldName
      }
    });
  }, [trackEvent]);

  // Track search with results
  const trackSearch = useCallback((query, resultsCount, filters = {}) => {
    trackEvent('search', { 
      metadata: { 
        query, 
        results_count: resultsCount,
        has_results: resultsCount > 0,
        filters
      } 
    });
  }, [trackEvent]);

  // Track filter usage
  const trackFilter = useCallback((filterType, filterValue) => {
    trackEvent('filter_applied', {
      metadata: {
        filter_type: filterType,
        filter_value: filterValue
      }
    });
  }, [trackEvent]);

  // Track login
  const trackLogin = useCallback((method = 'phone') => {
    trackEvent('login', {
      metadata: { method }
    });
  }, [trackEvent]);

  // Track signup
  const trackSignup = useCallback((method = 'phone') => {
    trackEvent('signup', {
      metadata: { method }
    });
  }, [trackEvent]);

  // Track logout
  const trackLogout = useCallback(() => {
    trackEvent('logout');
  }, [trackEvent]);

  // Track error
  const trackError = useCallback((errorType, errorMessage, errorStack = null) => {
    trackEvent('error', {
      metadata: {
        error_type: errorType,
        error_message: errorMessage,
        error_stack: errorStack?.substring(0, 500) // Limit stack trace length
      }
    });
  }, [trackEvent]);

  // Track API error
  const trackApiError = useCallback((endpoint, statusCode, errorMessage) => {
    trackEvent('api_error', {
      metadata: {
        endpoint,
        status_code: statusCode,
        error_message: errorMessage
      }
    });
  }, [trackEvent]);

  // Track share
  const trackShare = useCallback((contentType, shareMethod, contentId) => {
    trackEvent('share', {
      metadata: {
        content_type: contentType,
        share_method: shareMethod,
        content_id: contentId
      }
    });
  }, [trackEvent]);

  // Track coupon usage
  const trackCouponUsage = useCallback((couponCode, success, discountAmount = 0) => {
    trackEvent('coupon_usage', {
      value: discountAmount,
      metadata: {
        coupon_code: couponCode,
        success,
        discount_amount: discountAmount
      }
    });
  }, [trackEvent]);

  // Track address interaction
  const trackAddressInteraction = useCallback((action, addressId = null) => {
    trackEvent('address_interaction', {
      metadata: {
        action, // 'add', 'edit', 'delete', 'select', 'set_default'
        address_id: addressId
      }
    });
  }, [trackEvent]);

  // Track notification interaction
  const trackNotification = useCallback((action, notificationType) => {
    trackEvent('notification', {
      metadata: {
        action, // 'shown', 'clicked', 'dismissed'
        notification_type: notificationType
      }
    });
  }, [trackEvent]);

  // Track video interaction (if any videos)
  const trackVideoInteraction = useCallback((action, videoId, currentTime = 0) => {
    trackEvent('video_interaction', {
      metadata: {
        action, // 'play', 'pause', 'complete', 'seek'
        video_id: videoId,
        current_time: currentTime
      }
    });
  }, [trackEvent]);

  // Track external link click
  const trackExternalLink = useCallback((url) => {
    trackEvent('external_link_click', {
      metadata: {
        target_url: url,
        target_domain: new URL(url).hostname
      }
    });
  }, [trackEvent]);

  // Track user engagement score (custom metric)
  const trackEngagement = useCallback((score, factors) => {
    trackEvent('engagement_score', {
      value: score,
      metadata: { factors }
    });
  }, [trackEvent]);

  // Get user journey
  const getUserJourney = useCallback(() => {
    return userJourney.getPath();
  }, []);

  return {
    // Core tracking
    trackEvent,
    trackPageView,
    trackClick,
    
    // E-commerce
    trackProductView,
    trackAddToCart,
    trackRemoveFromCart,
    trackCartView,
    trackCheckoutStarted,
    trackCheckoutStep,
    trackCheckoutAbandonment,
    trackPurchase,
    
    // Subscription
    trackSubscription,
    trackSubscriptionStep,
    
    // User actions
    trackLogin,
    trackSignup,
    trackLogout,
    trackSearch,
    trackFilter,
    trackShare,
    trackCouponUsage,
    trackAddressInteraction,
    
    // Forms
    trackFormInteraction,
    
    // Errors
    trackError,
    trackApiError,
    
    // Engagement
    trackNotification,
    trackVideoInteraction,
    trackExternalLink,
    trackEngagement,
    
    // Utilities
    getUserJourney
  };
};

export default useAnalytics;
