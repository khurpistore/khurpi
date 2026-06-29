/**
 * useCartOperations Hook - ViewModel for cart operations
 * Single source of truth for cart logic across customer/vendor/admin
 */

import { useCallback, useMemo } from 'react';
import { calculateCartTotal, calculateProductPrice, getDisplayPrice } from '../utils';

/**
 * Cart Operations ViewModel Hook
 * Encapsulates cart business logic - works with any cart context
 */
export const useCartOperations = (cartItems = [], options = {}) => {
  const { isWholesale = false } = options;
  
  // Calculate subtotal
  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const qty = item.product?.selectedQty || item.quantity || 1;
      const price = getDisplayPrice(item.product, isWholesale);
      return total + (price * qty);
    }, 0);
  }, [cartItems, isWholesale]);
  
  // Calculate item count
  const itemCount = useMemo(() => cartItems.length, [cartItems]);
  
  // Calculate total quantity
  const totalQuantity = useMemo(() => {
    return cartItems.reduce((total, item) => {
      return total + (item.product?.selectedQty || item.quantity || 1);
    }, 0);
  }, [cartItems]);
  
  // Get item price
  const getItemPrice = useCallback((item) => {
    const qty = item.product?.selectedQty || item.quantity || 1;
    return calculateProductPrice(item.product, qty, isWholesale);
  }, [isWholesale]);
  
  // Get item unit price
  const getItemUnitPrice = useCallback((item) => {
    return getDisplayPrice(item.product, isWholesale);
  }, [isWholesale]);
  
  // Check if item is wholesale priced
  const isItemWholesale = useCallback((item) => {
    return isWholesale && item.product?.wholesale_price > 0;
  }, [isWholesale]);
  
  // Format cart for order submission
  const formatForOrder = useCallback(() => {
    return cartItems.map(item => ({
      product_id: item.product.id,
      quantity: item.product.selectedQty || item.quantity || 1,
      unit: item.product.unit || 'kg',
      price: getDisplayPrice(item.product, isWholesale)
    }));
  }, [cartItems, isWholesale]);
  
  return {
    // Computed
    subtotal,
    itemCount,
    totalQuantity,
    
    // Methods
    getItemPrice,
    getItemUnitPrice,
    isItemWholesale,
    formatForOrder
  };
};

export default useCartOperations;
