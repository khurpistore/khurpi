/**
 * PriceDisplay Component - Reusable price display
 * Used across customer, vendor, delivery, and admin parts
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { BadgePercent } from 'lucide-react';
import { formatPrice, formatPricePerUnit, calculateDiscountPercent } from '../utils';
import { CURRENCY } from '../constants';

/**
 * PriceDisplay - Shows price with optional wholesale indicator
 */
export const PriceDisplay = ({
  price,
  originalPrice,
  unit = 'kg',
  showPerUnit = false,
  showWholesaleBadge = false,
  size = 'default', // 'sm' | 'default' | 'lg' | 'xl'
  className = ''
}) => {
  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercent = hasDiscount ? calculateDiscountPercent(originalPrice, price) : 0;
  
  const sizeClasses = {
    sm: 'text-sm',
    default: 'text-base',
    lg: 'text-lg',
    xl: 'text-2xl font-bold'
  };
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className={`font-semibold text-primary ${sizeClasses[size]}`}>
        {showPerUnit ? formatPricePerUnit(price, unit) : formatPrice(price)}
      </span>
      
      {hasDiscount && (
        <>
          <span className="text-sm text-muted-foreground line-through">
            {formatPrice(originalPrice)}
          </span>
          <Badge variant="destructive" className="text-xs">
            {discountPercent}% OFF
          </Badge>
        </>
      )}
      
      {showWholesaleBadge && (
        <Badge className="bg-orange-100 text-orange-700 text-xs">
          <BadgePercent className="w-3 h-3 mr-1" />
          WP
        </Badge>
      )}
    </div>
  );
};

/**
 * PricePerUnit - Compact price per unit display
 */
export const PricePerUnit = ({ price, unit = 'kg', className = '' }) => (
  <span className={`text-muted-foreground ${className}`}>
    {formatPricePerUnit(price, unit)}
  </span>
);

/**
 * TotalPrice - Large total price display
 */
export const TotalPrice = ({ 
  amount, 
  label = '', 
  showWholesale = false,
  className = '' 
}) => (
  <div className={`flex items-center justify-between ${className}`}>
    {label && <span className="text-muted-foreground">{label}</span>}
    <div className="flex items-center gap-2">
      <span className="text-xl font-bold text-primary">
        {formatPrice(amount)}
      </span>
      {showWholesale && (
        <BadgePercent className="w-4 h-4 text-orange-500" />
      )}
    </div>
  </div>
);

/**
 * PriceSummary - Order/Cart price summary
 */
export const PriceSummary = ({
  subtotal,
  discount = 0,
  deliveryFee = 0,
  total,
  showWholesale = false,
  className = ''
}) => (
  <div className={`space-y-2 ${className}`}>
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">Subtotal</span>
      <span>{formatPrice(subtotal)}</span>
    </div>
    
    {discount > 0 && (
      <div className="flex justify-between text-sm text-green-600">
        <span>Discount</span>
        <span>-{formatPrice(discount)}</span>
      </div>
    )}
    
    {deliveryFee > 0 && (
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Delivery</span>
        <span>{formatPrice(deliveryFee)}</span>
      </div>
    )}
    
    <div className="border-t pt-2 flex justify-between font-semibold">
      <span>Total</span>
      <div className="flex items-center gap-2">
        <span className="text-primary">{formatPrice(total)}</span>
        {showWholesale && (
          <Badge className="bg-orange-100 text-orange-700 text-xs">
            <BadgePercent className="w-3 h-3 mr-1" />
            Wholesale
          </Badge>
        )}
      </div>
    </div>
  </div>
);

export default PriceDisplay;
