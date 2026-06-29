/**
 * Unit Constants - Single source of truth for all unit types
 * Used across customer, vendor, delivery, and admin parts of the app
 */

export const UNIT_TYPES = {
  KG: 'kg',
  PIECE: 'piece',
  DOZEN: 'dozen',
  BUNCH: 'bunch',
  GRAM: 'g',
  LITER: 'liter',
  ML: 'ml'
};

export const UNIT_CONFIG = {
  [UNIT_TYPES.KG]: {
    label: 'kg',
    shortLabel: 'kg',
    priceLabel: '/kg',
    minQty: 0.25,
    stepQty: 0.25,
    maxQty: 10,
    decimals: 2
  },
  [UNIT_TYPES.PIECE]: {
    label: 'piece',
    shortLabel: 'pc',
    priceLabel: '/pc',
    minQty: 1,
    stepQty: 1,
    maxQty: 100,
    decimals: 0
  },
  [UNIT_TYPES.DOZEN]: {
    label: 'dozen',
    shortLabel: 'dz',
    priceLabel: '/dz',
    minQty: 1,
    stepQty: 1,
    maxQty: 20,
    decimals: 0
  },
  [UNIT_TYPES.BUNCH]: {
    label: 'bunch',
    shortLabel: 'bunch',
    priceLabel: '/bunch',
    minQty: 1,
    stepQty: 1,
    maxQty: 20,
    decimals: 0
  },
  [UNIT_TYPES.GRAM]: {
    label: 'gram',
    shortLabel: 'g',
    priceLabel: '/g',
    minQty: 50,
    stepQty: 50,
    maxQty: 5000,
    decimals: 0
  },
  [UNIT_TYPES.LITER]: {
    label: 'liter',
    shortLabel: 'L',
    priceLabel: '/L',
    minQty: 0.5,
    stepQty: 0.5,
    maxQty: 20,
    decimals: 1
  },
  [UNIT_TYPES.ML]: {
    label: 'ml',
    shortLabel: 'ml',
    priceLabel: '/ml',
    minQty: 100,
    stepQty: 100,
    maxQty: 5000,
    decimals: 0
  }
};

export const DEFAULT_UNIT = UNIT_TYPES.KG;

export const DEFAULT_QUANTITIES = {
  [UNIT_TYPES.KG]: [0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 4, 5],
  [UNIT_TYPES.PIECE]: [1, 2, 3, 4, 5, 6, 10, 12, 24],
  [UNIT_TYPES.DOZEN]: [1, 2, 3, 4, 5, 6],
  [UNIT_TYPES.BUNCH]: [1, 2, 3, 4, 5],
  [UNIT_TYPES.GRAM]: [100, 250, 500, 750, 1000, 1500, 2000],
  [UNIT_TYPES.LITER]: [0.5, 1, 1.5, 2, 3, 5],
  [UNIT_TYPES.ML]: [100, 200, 250, 500, 750, 1000]
};
