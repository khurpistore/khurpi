import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/**
 * Custom hook to check if current user has wholesale access
 * and provide utility functions for wholesale pricing
 */
export const useWholesale = () => {
  const [wholesaleEnabled, setWholesaleEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkWholesaleAccess = async () => {
      if (!user?.id) {
        setWholesaleEnabled(false);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API}/admin/users/${user.id}/wholesale-access`);
        setWholesaleEnabled(response.data.wholesale_enabled || false);
      } catch (error) {
        // User doesn't have wholesale access or error occurred
        setWholesaleEnabled(false);
      } finally {
        setLoading(false);
      }
    };

    checkWholesaleAccess();
  }, [user?.id]);

  /**
   * Get the display price for a product based on wholesale access
   * @param {Object} product - Product object with price and wholesale_price
   * @returns {number} - The price to display (per 100gm)
   */
  const getDisplayPrice = useCallback((product) => {
    if (!product) return 0;
    
    if (wholesaleEnabled && product.wholesale_price > 0) {
      return product.wholesale_price;
    }
    return product.price || 0;
  }, [wholesaleEnabled]);

  /**
   * Calculate price for a given quantity
   * @param {Object} product - Product object
   * @param {number} quantity - Quantity in grams
   * @returns {number} - Total price for the quantity
   */
  const calculatePrice = useCallback((product, quantity = 100) => {
    const pricePerHundred = getDisplayPrice(product);
    return (pricePerHundred / 100) * quantity;
  }, [getDisplayPrice]);

  /**
   * Check if a product has wholesale price available
   * @param {Object} product - Product object
   * @returns {boolean}
   */
  const hasWholesalePrice = useCallback((product) => {
    return product?.wholesale_price > 0;
  }, []);

  /**
   * Check if user is seeing wholesale price for a product
   * @param {Object} product - Product object
   * @returns {boolean}
   */
  const isShowingWholesale = useCallback((product) => {
    return wholesaleEnabled && hasWholesalePrice(product);
  }, [wholesaleEnabled, hasWholesalePrice]);

  return {
    wholesaleEnabled,
    loading,
    getDisplayPrice,
    calculatePrice,
    hasWholesalePrice,
    isShowingWholesale
  };
};

export default useWholesale;
