/**
 * Quantity Utilities - Single source of truth for quantity operations
 * Used across all parts of the app: customer, vendor, delivery, admin
 */

import { UNIT_CONFIG, DEFAULT_UNIT, DEFAULT_QUANTITIES, UNIT_TYPES } from '../constants';

/**
 * Get unit configuration for a given unit type
 * @param {string} unit - Unit type (kg, piece, dozen, etc.)
 * @returns {Object} Unit configuration
 */
export const getUnitConfig = (unit) => {
  return UNIT_CONFIG[unit] || UNIT_CONFIG[DEFAULT_UNIT];
};

/**
 * Format quantity with appropriate unit label
 * @param {number} qty - Quantity value
 * @param {string} unit - Unit type
 * @returns {string} Formatted quantity string (e.g., "0.5 kg", "2 pc")
 */
export const formatQuantity = (qty, unit = DEFAULT_UNIT) => {
  const config = getUnitConfig(unit);
  const formattedQty = Number(qty).toFixed(config.decimals);
  // Remove trailing zeros for cleaner display
  const cleanQty = parseFloat(formattedQty);
  return `${cleanQty} ${config.shortLabel}`;
};

/**
 * Format quantity label (alias for formatQuantity)
 */
export const formatQtyLabel = formatQuantity;

/**
 * Get available quantity options for a product
 * @param {Object} product - Product object with unit, min_quantity, step_quantity, stock_quantity
 * @returns {Array<number>} Array of available quantity options
 */
export const getQuantityOptions = (product) => {
  const unit = product?.unit || DEFAULT_UNIT;
  const config = getUnitConfig(unit);
  
  const minQty = product?.min_quantity || config.minQty;
  const stepQty = product?.step_quantity || config.stepQty;
  const maxQty = Math.min(product?.stock_quantity || config.maxQty, config.maxQty);
  
  // For countable items, use predefined options
  if (unit === UNIT_TYPES.PIECE || unit === UNIT_TYPES.DOZEN || unit === UNIT_TYPES.BUNCH) {
    return DEFAULT_QUANTITIES[unit].filter(q => q <= Math.max(maxQty, 12));
  }
  
  // For weight-based items, generate options
  const options = [];
  for (let qty = minQty; qty <= maxQty; qty += stepQty) {
    options.push(parseFloat(qty.toFixed(config.decimals)));
  }
  
  // Return default options if none generated
  return options.length > 0 ? options : DEFAULT_QUANTITIES[unit] || DEFAULT_QUANTITIES[DEFAULT_UNIT];
};

/**
 * Get default quantity for a product
 * @param {Object} product - Product object
 * @returns {number} Default quantity value
 */
export const getDefaultQuantity = (product) => {
  const options = getQuantityOptions(product);
  const unit = product?.unit || DEFAULT_UNIT;
  
  // Try to find 0.5 kg or 1 unit as default
  if (unit === UNIT_TYPES.KG && options.includes(0.5)) return 0.5;
  if (unit === UNIT_TYPES.KG && options.includes(1)) return 1;
  if (options.includes(1)) return 1;
  
  return options[0] || 1;
};

/**
 * Validate quantity for a product
 * @param {number} qty - Quantity to validate
 * @param {Object} product - Product object
 * @returns {boolean} Whether quantity is valid
 */
export const isValidQuantity = (qty, product) => {
  const config = getUnitConfig(product?.unit);
  const minQty = product?.min_quantity || config.minQty;
  const maxQty = product?.stock_quantity || config.maxQty;
  
  return qty >= minQty && qty <= maxQty;
};

/**
 * Parse quantity from string input
 * @param {string|number} value - Input value
 * @param {string} unit - Unit type
 * @returns {number} Parsed quantity
 */
export const parseQuantity = (value, unit = DEFAULT_UNIT) => {
  const config = getUnitConfig(unit);
  const parsed = parseFloat(value);
  return isNaN(parsed) ? config.minQty : parseFloat(parsed.toFixed(config.decimals));
};
