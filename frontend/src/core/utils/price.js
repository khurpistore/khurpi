/**
 * Price Utilities - Single source of truth for price calculations
 * Used across all parts of the app: customer, vendor, delivery, admin
 */

import { CURRENCY, UNIT_CONFIG, DEFAULT_UNIT } from '../constants';

/**
 * Format price with currency symbol
 * @param {number} price - Price value
 * @param {Object} options - Formatting options
 * @returns {string} Formatted price (e.g., "₹150")
 */
export const formatPrice = (price, options = {}) => {
  const { 
    showSymbol = true, 
    decimals = 0,
    showFree = true 
  } = options;
  
  if (price === 0 && showFree) return 'Free';
  
  const formattedPrice = Number(price).toFixed(decimals);
  return showSymbol ? `${CURRENCY.symbol}${formattedPrice}` : formattedPrice;
};

/**
 * Format price per unit (e.g., "₹150/kg")
 * @param {number} price - Price per unit
 * @param {string} unit - Unit type
 * @returns {string} Formatted price per unit
 */
export const formatPricePerUnit = (price, unit = DEFAULT_UNIT) => {
  const config = UNIT_CONFIG[unit] || UNIT_CONFIG[DEFAULT_UNIT];
  return `${CURRENCY.symbol}${price}${config.priceLabel}`;
};

/**
 * Calculate total price for a given quantity
 * @param {number} pricePerUnit - Price per unit
 * @param {number} quantity - Quantity
 * @returns {number} Total price
 */
export const calculateTotalPrice = (pricePerUnit, quantity) => {
  return pricePerUnit * quantity;
};

/**
 * Calculate price for a product considering wholesale pricing
 * @param {Object} product - Product object with price and wholesale_price
 * @param {number} quantity - Quantity
 * @param {boolean} isWholesale - Whether to use wholesale pricing
 * @returns {number} Calculated price
 */
export const calculateProductPrice = (product, quantity = 1, isWholesale = false) => {
  if (!product) return 0;
  
  const pricePerUnit = isWholesale && product.wholesale_price > 0 
    ? product.wholesale_price 
    : product.price || 0;
  
  return calculateTotalPrice(pricePerUnit, quantity);
};

/**
 * Get display price for a product (wholesale or retail)
 * @param {Object} product - Product object
 * @param {boolean} isWholesale - Whether to show wholesale price
 * @returns {number} Display price per unit
 */
export const getDisplayPrice = (product, isWholesale = false) => {
  if (!product) return 0;
  
  if (isWholesale && product.wholesale_price > 0) {
    return product.wholesale_price;
  }
  return product.price || 0;
};

/**
 * Calculate discount percentage
 * @param {number} originalPrice - Original price
 * @param {number} discountedPrice - Discounted price
 * @returns {number} Discount percentage
 */
export const calculateDiscountPercent = (originalPrice, discountedPrice) => {
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};

/**
 * Calculate cart total
 * @param {Array} items - Cart items with product and quantity
 * @param {boolean} isWholesale - Whether to use wholesale pricing
 * @returns {number} Cart total
 */
export const calculateCartTotal = (items, isWholesale = false) => {
  if (!Array.isArray(items)) return 0;
  
  return items.reduce((total, item) => {
    const qty = item.product?.selectedQty || item.quantity || 1;
    return total + calculateProductPrice(item.product, qty, isWholesale);
  }, 0);
};

/**
 * Format price range (e.g., "₹100 - ₹200")
 * @param {number} minPrice - Minimum price
 * @param {number} maxPrice - Maximum price
 * @returns {string} Formatted price range
 */
export const formatPriceRange = (minPrice, maxPrice) => {
  if (minPrice === maxPrice) {
    return formatPrice(minPrice);
  }
  return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
};
