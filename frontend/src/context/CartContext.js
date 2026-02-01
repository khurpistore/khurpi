import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

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

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('khurpi_cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cartItems]);

  // Save subscription to localStorage whenever it changes
  useEffect(() => {
    try {
      if (pendingSubscription) {
        localStorage.setItem('khurpi_subscription', JSON.stringify(pendingSubscription));
      } else {
        localStorage.removeItem('khurpi_subscription');
      }
    } catch (error) {
      console.error('Error saving subscription to localStorage:', error);
    }
  }, [pendingSubscription]);

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

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const qty = item.product.selectedQty || 100;
      const unitPrice = (item.product.price / 100) * qty;
      return total + (unitPrice * item.quantity);
    }, 0);
  };

  const getCartCount = () => {
    let count = cartItems.reduce((count, item) => count + item.quantity, 0);
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

  return (
    <CartContext.Provider value={{
      cartItems,
      isCartOpen,
      setIsCartOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount,
      pendingSubscription,
      setSubscription,
      clearSubscription
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
