/**
 * Core Module - Single entry point for all core functionality
 * 
 * This module provides the foundation for the e-commerce application
 * following MVVM + Clean Architecture principles.
 * 
 * Structure:
 * - constants/  : Application-wide constants (units, stock status, currency)
 * - utils/      : Pure utility functions (quantity, price, stock calculations)
 * - hooks/      : ViewModel hooks (useProduct, useCartOperations)
 * - components/ : Reusable UI components (QuantitySelector, PriceDisplay, etc.)
 * 
 * Usage:
 * import { formatQuantity, formatPrice, useProduct, QuantitySelector } from '../core';
 */

// Constants
export * from './constants';

// Utilities
export * from './utils';

// Hooks (ViewModels)
export * from './hooks';

// Components
export * from './components';
