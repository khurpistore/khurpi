/**
 * Stock Utilities - Single source of truth for stock status operations
 * Used across all parts of the app: customer, vendor, delivery, admin
 */

import { STOCK_STATUS, STOCK_STATUS_CONFIG } from '../constants';

/**
 * Get stock status configuration
 * @param {string} status - Stock status
 * @returns {Object} Stock status configuration
 */
export const getStockStatusConfig = (status) => {
  return STOCK_STATUS_CONFIG[status] || STOCK_STATUS_CONFIG[STOCK_STATUS.OUT_OF_STOCK];
};

/**
 * Determine stock status from product data
 * @param {Object} product - Product object
 * @returns {Object} Stock status info with status, label, color, canOrder
 */
export const getStockStatus = (product) => {
  if (!product) {
    return { 
      status: STOCK_STATUS.OUT_OF_STOCK, 
      ...getStockStatusConfig(STOCK_STATUS.OUT_OF_STOCK)
    };
  }
  
  // Check explicit stock_status first - this is the source of truth
  if (product.stock_status === STOCK_STATUS.IN_STOCK || product.stock_status === 'in_stock') {
    return { 
      status: STOCK_STATUS.IN_STOCK, 
      ...getStockStatusConfig(STOCK_STATUS.IN_STOCK)
    };
  }
  
  if (product.stock_status === STOCK_STATUS.GROWING || product.stock_status === 'growing' || product.isGrowing) {
    const config = getStockStatusConfig(STOCK_STATUS.GROWING);
    const readyDate = product.availability_date || product.ready_in_days;
    return {
      status: STOCK_STATUS.GROWING,
      ...config,
      label: readyDate 
        ? `Ready in ${product.ready_in_days || product.growth_days} days` 
        : config.label,
      readyDate,
      canOrder: true  // Growing products can be pre-ordered
    };
  }
  
  if (product.stock_status === STOCK_STATUS.OUT_OF_STOCK || product.stock_status === 'out_of_stock') {
    return { 
      status: STOCK_STATUS.OUT_OF_STOCK, 
      ...getStockStatusConfig(STOCK_STATUS.OUT_OF_STOCK)
    };
  }
  
  // Fallback: Check quantity-based status if no explicit status
  const quantity = product.weight ?? product.stock_quantity ?? 0;
  const threshold = product.low_stock_threshold || 10;
  
  if (quantity <= 0) {
    return { 
      status: STOCK_STATUS.OUT_OF_STOCK, 
      ...getStockStatusConfig(STOCK_STATUS.OUT_OF_STOCK)
    };
  }
  
  if (quantity <= threshold) {
    return { 
      status: STOCK_STATUS.LOW_STOCK, 
      ...getStockStatusConfig(STOCK_STATUS.LOW_STOCK),
      remainingQty: quantity
    };
  }
  
  return { 
    status: STOCK_STATUS.IN_STOCK, 
    ...getStockStatusConfig(STOCK_STATUS.IN_STOCK)
  };
};

/**
 * Check if product can be ordered
 * @param {Object} product - Product object
 * @returns {boolean} Whether product can be ordered
 */
export const canOrderProduct = (product) => {
  const stockInfo = getStockStatus(product);
  return stockInfo.canOrder;
};

/**
 * Sort products by stock status priority
 * Priority: In Stock > Low Stock > Growing > Out of Stock
 * @param {Array} products - Array of products
 * @returns {Array} Sorted products
 */
export const sortByStockStatus = (products) => {
  const priority = {
    [STOCK_STATUS.IN_STOCK]: 0,
    [STOCK_STATUS.LOW_STOCK]: 1,
    [STOCK_STATUS.GROWING]: 2,
    [STOCK_STATUS.OUT_OF_STOCK]: 3
  };
  
  return [...products].sort((a, b) => {
    const statusA = getStockStatus(a).status;
    const statusB = getStockStatus(b).status;
    return (priority[statusA] || 3) - (priority[statusB] || 3);
  });
};
