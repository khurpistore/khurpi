import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const CartContext = createContext();
const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Helper to get cart from localStorage
const getStoredCart = () => {
  try {
    const savedCart = localStorage.getItem('khurpi_cart');
    if (savedCart) {
      const parsed = JSON.parse(savedCart);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
  }
  return [];
};

// Helper to get subscription from localStorage
const getStoredSubscription = () => {
  try {
    const savedSub = localStorage.getItem('khurpi_subscription');
    if (savedSub) {
      return JSON.parse(savedSub);
    }
  } catch (error) {
    console.error('Error loading subscription from localStorage:', error);
  }
  return null;
};

export const CartProvider = ({ children }) => {
  // Initialize from localStorage immediately
  const [cartItems, setCartItems] = useState(() => getStoredCart());
  const [pendingSubscription, setPendingSubscription] = useState(() => getStoredSubscription());
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [productsCache, setProductsCache] = useState({}); // Cache fresh product data
  
  // Track if we've already synced on login
  const hasSyncedRef = useRef(false);
  const syncTimeoutRef = useRef(null);
  const hasRefreshedProductsRef = useRef(false);

  // Get current user from localStorage
  const getCurrentUser = () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
    } catch (e) {
      return null;
    }
    return null;
  };

  // Sync cart to server (debounced)
  const syncCartToServer = useCallback(async (items, subscription) => {
    const user = getCurrentUser();
    if (!user || !user.id) return;
    
    try {
      const cartData = {
        items: items.map(item => ({
          product_id: item.product?.id || item.product_id,
          product: item.product,
          quantity: item.product?.selectedQty || item.quantity || 100
        })),
        subscription: subscription ? {
          frequency: subscription.frequency,
          delivery_days: subscription.delivery_days || [],
          items: subscription.items || [],
          address_id: subscription.address_id,
          tray_count: subscription.tray_count
        } : null
      };
      
      await axios.put(`${API}/users/${user.id}/cart`, cartData);
    } catch (error) {
      console.error('Failed to sync cart to server:', error);
    }
  }, []);

  // Debounced sync - wait 1 second after last change before syncing
  const debouncedSync = useCallback((items, subscription) => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    syncTimeoutRef.current = setTimeout(() => {
      syncCartToServer(items, subscription);
    }, 1000);
  }, [syncCartToServer]);

  // Save cart to localStorage whenever it changes + sync to server if logged in
  useEffect(() => {
    try {
      localStorage.setItem('khurpi_cart', JSON.stringify(cartItems));
      
      // Sync to server if user is logged in
      const user = getCurrentUser();
      if (user && user.id && hasSyncedRef.current) {
        debouncedSync(cartItems, pendingSubscription);
      }
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cartItems, debouncedSync, pendingSubscription]);

  // Save subscription to localStorage whenever it changes + sync to server
  useEffect(() => {
    try {
      if (pendingSubscription) {
        localStorage.setItem('khurpi_subscription', JSON.stringify(pendingSubscription));
      } else {
        localStorage.removeItem('khurpi_subscription');
      }
      
      // Sync to server if user is logged in
      const user = getCurrentUser();
      if (user && user.id && hasSyncedRef.current) {
        debouncedSync(cartItems, pendingSubscription);
      }
    } catch (error) {
      console.error('Error saving subscription to localStorage:', error);
    }
  }, [pendingSubscription, cartItems, debouncedSync]);

  // Fetch cart from server and merge with local cart
  const fetchAndMergeCart = useCallback(async (userId) => {
    if (isSyncing) return;
    setIsSyncing(true);
    
    try {
      const response = await axios.get(`${API}/users/${userId}/cart`);
      const serverCart = response.data;
      
      if (serverCart && (serverCart.items?.length > 0 || serverCart.subscription)) {
        // Get local cart
        const localItems = getStoredCart();
        const localSubscription = getStoredSubscription();
        
        // Merge strategy: Server cart takes precedence if it's newer or local is empty
        // If local has items and server doesn't, keep local
        // If both have items, merge unique items (server wins on conflicts)
        
        let mergedItems = [];
        const serverItems = serverCart.items || [];
        
        if (serverItems.length > 0 && localItems.length === 0) {
          // Server has items, local is empty - use server
          mergedItems = serverItems;
        } else if (serverItems.length === 0 && localItems.length > 0) {
          // Local has items, server is empty - use local
          mergedItems = localItems;
        } else if (serverItems.length > 0 && localItems.length > 0) {
          // Both have items - merge, preferring server for conflicts
          const itemMap = new Map();
          
          // Add local items first
          localItems.forEach(item => {
            const productId = item.product?.id || item.product_id;
            if (productId) {
              itemMap.set(productId, item);
            }
          });
          
          // Server items override
          serverItems.forEach(item => {
            const productId = item.product?.id || item.product_id;
            if (productId) {
              itemMap.set(productId, item);
            }
          });
          
          mergedItems = Array.from(itemMap.values());
        }
        
        // For subscription, prefer server if exists, otherwise keep local
        const mergedSubscription = serverCart.subscription || localSubscription;
        
        // Update state
        if (mergedItems.length > 0) {
          setCartItems(mergedItems);
        }
        if (mergedSubscription) {
          setPendingSubscription(mergedSubscription);
        }
        
        // Mark as synced
        hasSyncedRef.current = true;
        
        // If we merged, sync the merged result back to server
        if (mergedItems.length > 0 || mergedSubscription) {
          await syncCartToServer(mergedItems, mergedSubscription);
        }
      } else {
        // Server has no cart - sync local to server
        hasSyncedRef.current = true;
        const localItems = getStoredCart();
        const localSubscription = getStoredSubscription();
        if (localItems.length > 0 || localSubscription) {
          await syncCartToServer(localItems, localSubscription);
        }
      }
    } catch (error) {
      console.error('Failed to fetch cart from server:', error);
      hasSyncedRef.current = true; // Mark as synced even on error to enable future syncs
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, syncCartToServer]);

  // Refresh product data from API to get latest prices (including wholesale_price)
  const refreshProductData = useCallback(async () => {
    if (hasRefreshedProductsRef.current || cartItems.length === 0) return;
    
    try {
      const response = await axios.get(`${API}/products?active_only=false`);
      const freshProducts = response.data;
      
      // Create a map of fresh product data
      const productMap = {};
      freshProducts.forEach(p => {
        productMap[p.id] = p;
      });
      
      setProductsCache(productMap);
      
      // Update cart items with fresh product data (including wholesale_price)
      setCartItems(prevItems => {
        return prevItems.map(item => {
          const freshProduct = productMap[item.product?.id || item.product_id];
          if (freshProduct) {
            return {
              ...item,
              product: {
                ...item.product,
                ...freshProduct,
                selectedQty: item.product?.selectedQty || item.quantity || 100
              }
            };
          }
          return item;
        });
      });
      
      hasRefreshedProductsRef.current = true;
    } catch (error) {
      console.error('Failed to refresh product data:', error);
    }
  }, [cartItems.length]);

  // Refresh product data on mount if cart has items
  useEffect(() => {
    if (cartItems.length > 0 && !hasRefreshedProductsRef.current) {
      refreshProductData();
    }
  }, [cartItems.length, refreshProductData]);

  // Listen for login events (check user state periodically)
  useEffect(() => {
    const checkAndSync = () => {
      const user = getCurrentUser();
      if (user && user.id && !hasSyncedRef.current) {
        fetchAndMergeCart(user.id);
      } else if (!user) {
        // User logged out - reset sync flag
        hasSyncedRef.current = false;
      }
    };
    
    // Check on mount
    checkAndSync();
    
    // Check periodically for login state changes
    const interval = setInterval(checkAndSync, 2000);
    
    // Also listen for storage events (login from another tab)
    const handleStorage = (e) => {
      if (e.key === 'user') {
        checkAndSync();
      }
    };
    window.addEventListener('storage', handleStorage);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
    };
  }, [fetchAndMergeCart]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const updateSelectedQty = (productId, selectedQty) => {
    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, product: { ...item.product, selectedQty } }
          : item
      )
    );
  };

  const clearCart = async () => {
    setCartItems([]);
    setPendingSubscription(null);
    
    // Clear from server too
    const user = getCurrentUser();
    if (user && user.id) {
      try {
        await axios.delete(`${API}/users/${user.id}/cart`);
      } catch (error) {
        console.error('Failed to clear cart on server:', error);
      }
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const qty = item.product.selectedQty || 100;
      const unitPrice = (item.product.price / 100) * qty;
      return total + unitPrice;
    }, 0);
  };

  const getCartCount = () => {
    // Count number of unique items in cart (not quantities)
    let count = cartItems.length;
    // Add 1 if there's a pending subscription
    if (pendingSubscription) {
      count += 1;
    }
    return count;
  };

  // Subscription methods
  const setSubscription = (subscriptionData) => {
    setPendingSubscription(subscriptionData);
  };

  const clearSubscription = () => {
    setPendingSubscription(null);
  };

  // Manual sync trigger (call after login)
  const syncOnLogin = async (userId) => {
    if (userId) {
      hasSyncedRef.current = false;
      await fetchAndMergeCart(userId);
    }
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      isCartOpen,
      setIsCartOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
      updateSelectedQty,
      clearCart,
      getCartTotal,
      getCartCount,
      pendingSubscription,
      setSubscription,
      clearSubscription,
      isSyncing,
      syncOnLogin,
      refreshProductData,
      productsCache
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
