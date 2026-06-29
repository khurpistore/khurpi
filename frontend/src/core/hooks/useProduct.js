/**
 * useProduct Hook - ViewModel for product-related operations
 * Single source of truth for product logic across customer/vendor/admin
 */

import { useState, useCallback, useMemo } from 'react';
import { 
  getQuantityOptions, 
  getDefaultQuantity, 
  formatQuantity,
  calculateProductPrice,
  getDisplayPrice,
  getStockStatus,
  canOrderProduct
} from '../utils';

/**
 * Product ViewModel Hook
 * Encapsulates all product-related business logic
 */
export const useProduct = (product, options = {}) => {
  const { isWholesale = false } = options;
  
  // State
  const [selectedQty, setSelectedQty] = useState(() => 
    product?.selectedQty || getDefaultQuantity(product)
  );
  
  // Computed values (memoized)
  const unit = useMemo(() => product?.unit || 'kg', [product?.unit]);
  
  const stockInfo = useMemo(() => getStockStatus(product), [product]);
  
  const quantityOptions = useMemo(() => 
    getQuantityOptions(product), [product]
  );
  
  const pricePerUnit = useMemo(() => 
    getDisplayPrice(product, isWholesale), [product, isWholesale]
  );
  
  const totalPrice = useMemo(() => 
    calculateProductPrice(product, selectedQty, isWholesale), 
    [product, selectedQty, isWholesale]
  );
  
  const formattedQty = useMemo(() => 
    formatQuantity(selectedQty, unit), [selectedQty, unit]
  );
  
  const canOrder = useMemo(() => 
    canOrderProduct(product), [product]
  );
  
  const isGrowing = useMemo(() => 
    stockInfo.status === 'growing', [stockInfo]
  );
  
  const isOutOfStock = useMemo(() => 
    stockInfo.status === 'out_of_stock', [stockInfo]
  );
  
  // Actions
  const updateQuantity = useCallback((qty) => {
    const numQty = typeof qty === 'string' ? parseFloat(qty) : qty;
    setSelectedQty(numQty);
  }, []);
  
  const incrementQty = useCallback(() => {
    const currentIndex = quantityOptions.indexOf(selectedQty);
    if (currentIndex < quantityOptions.length - 1) {
      setSelectedQty(quantityOptions[currentIndex + 1]);
    }
  }, [quantityOptions, selectedQty]);
  
  const decrementQty = useCallback(() => {
    const currentIndex = quantityOptions.indexOf(selectedQty);
    if (currentIndex > 0) {
      setSelectedQty(quantityOptions[currentIndex - 1]);
    }
  }, [quantityOptions, selectedQty]);
  
  // Get product with selected quantity for cart
  const getCartProduct = useCallback(() => ({
    ...product,
    selectedQty,
    isGrowing,
    displayPrice: pricePerUnit,
    isWholesale
  }), [product, selectedQty, isGrowing, pricePerUnit, isWholesale]);
  
  return {
    // State
    selectedQty,
    
    // Computed
    unit,
    stockInfo,
    quantityOptions,
    pricePerUnit,
    totalPrice,
    formattedQty,
    canOrder,
    isGrowing,
    isOutOfStock,
    
    // Actions
    updateQuantity,
    incrementQty,
    decrementQty,
    getCartProduct
  };
};

export default useProduct;
