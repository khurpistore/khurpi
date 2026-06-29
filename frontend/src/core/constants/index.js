/**
 * Core Constants - Export all constants from single entry point
 */

export * from './units';

// Stock status constants
export const STOCK_STATUS = {
  IN_STOCK: 'in_stock',
  GROWING: 'growing',
  OUT_OF_STOCK: 'out_of_stock',
  LOW_STOCK: 'low_stock'
};

export const STOCK_STATUS_CONFIG = {
  [STOCK_STATUS.IN_STOCK]: {
    label: 'In Stock',
    color: 'bg-green-100 text-green-800',
    badgeColor: 'bg-green-500',
    canOrder: true
  },
  [STOCK_STATUS.GROWING]: {
    label: 'Growing',
    color: 'bg-amber-100 text-amber-800',
    badgeColor: 'bg-amber-500',
    canOrder: true
  },
  [STOCK_STATUS.OUT_OF_STOCK]: {
    label: 'Out of Stock',
    color: 'bg-red-100 text-red-800',
    badgeColor: 'bg-red-500',
    canOrder: false
  },
  [STOCK_STATUS.LOW_STOCK]: {
    label: 'Low Stock',
    color: 'bg-orange-100 text-orange-800',
    badgeColor: 'bg-orange-500',
    canOrder: true
  }
};

// Currency constants
export const CURRENCY = {
  symbol: '₹',
  code: 'INR',
  locale: 'en-IN'
};
